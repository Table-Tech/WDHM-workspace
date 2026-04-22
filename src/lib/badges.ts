import type { Badge, Incident, FriendBadge, Streak } from '@/types';
import { hasValidCredentials, supabase } from './supabase';

// Extended evaluator context
interface EvaluatorContext {
  friendId: string;
  badge: Badge;
  currentIncident: Incident | null;
  allIncidents: Incident[];
  lateStreak: Streak | null;
  onTimeStreak: Streak | null;
}

// Badge condition evaluators
type BadgeEvaluator = (ctx: EvaluatorContext) => boolean;

const evaluators: Record<string, BadgeEvaluator> = {
  // First ever late incident
  first_late: (ctx) => {
    return ctx.allIncidents.length === 1;
  },

  // Total X times late
  total_late: (ctx) => {
    return ctx.allIncidents.length >= (ctx.badge.condition_value || 0);
  },

  // X consecutive late incidents - uses actual streak from database
  consecutive_late: (ctx) => {
    const currentStreak = ctx.lateStreak?.current_count || 0;
    const bestStreak = ctx.lateStreak?.best_count || 0;
    // Check both current and best streak (badge should be awarded if they ever reached it)
    return Math.max(currentStreak, bestStreak) >= (ctx.badge.condition_value || 0);
  },

  // Single incident >X minutes late
  minutes_late_single: (ctx) => {
    // Check if any incident meets the condition
    return ctx.allIncidents.some((i) => (i.minutes_late || 0) >= (ctx.badge.condition_value || 0));
  },

  // Average >X minutes late
  minutes_late_avg: (ctx) => {
    if (ctx.allIncidents.length < 3) return false; // Need at least 3 incidents for meaningful avg
    const totalMinutes = ctx.allIncidents.reduce((sum, i) => sum + (i.minutes_late || 0), 0);
    const avg = totalMinutes / ctx.allIncidents.length;
    return avg >= (ctx.badge.condition_value || 0);
  },

  // X incidents without evidence (no photo/video)
  no_evidence: (ctx) => {
    const withoutEvidence = ctx.allIncidents.filter((i) => !i.photo_url && !i.video_url);
    return withoutEvidence.length >= (ctx.badge.condition_value || 0);
  },

  // X incidents always with evidence
  always_evidence: (ctx) => {
    const withEvidence = ctx.allIncidents.filter((i) => i.photo_url || i.video_url);
    return withEvidence.length >= (ctx.badge.condition_value || 0);
  },

  // On time streak - uses streak from database
  on_time_streak: (ctx) => {
    const currentStreak = ctx.onTimeStreak?.current_count || 0;
    const bestStreak = ctx.onTimeStreak?.best_count || 0;
    // Check both current and best streak
    return Math.max(currentStreak, bestStreak) >= (ctx.badge.condition_value || 0);
  },

  // Custom badges are manually assigned
  custom: () => false,
};

// Evaluate if a badge should be awarded
export function evaluateBadgeCondition(ctx: EvaluatorContext): boolean {
  const evaluator = evaluators[ctx.badge.condition_type];
  if (!evaluator) return false;
  return evaluator(ctx);
}

// Check and award badges after an incident
export async function checkAndAwardBadges(
  friendId: string,
  incident: Incident | null = null
): Promise<FriendBadge[]> {
  if (!hasValidCredentials) return [];

  try {
    // Fetch all badges (both system and custom)
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*');

    if (badgesError || !badges) return [];

    // Fetch already earned badges
    const { data: earnedBadges, error: earnedError } = await supabase
      .from('friend_badges')
      .select('badge_id')
      .eq('friend_id', friendId);

    if (earnedError) return [];

    const earnedBadgeIds = new Set((earnedBadges || []).map((eb) => eb.badge_id));

    // Fetch all incidents for this friend
    const { data: allIncidents, error: incidentsError } = await supabase
      .from('incidents')
      .select('*')
      .eq('friend_id', friendId)
      .order('created_at', { ascending: true });

    if (incidentsError || !allIncidents) return [];

    // Fetch streaks for this friend
    const { data: streaks } = await supabase
      .from('streaks')
      .select('*')
      .eq('friend_id', friendId);

    const lateStreak = streaks?.find((s) => s.streak_type === 'late') || null;
    const onTimeStreak = streaks?.find((s) => s.streak_type === 'on_time') || null;

    const newlyEarned: FriendBadge[] = [];

    // Check each badge
    for (const badge of badges) {
      // Skip if already earned
      if (earnedBadgeIds.has(badge.id)) continue;

      // Skip custom badges (manually assigned)
      if (badge.condition_type === 'custom') continue;

      // Build evaluator context
      const ctx: EvaluatorContext = {
        friendId,
        badge,
        currentIncident: incident,
        allIncidents,
        lateStreak,
        onTimeStreak,
      };

      // Evaluate condition
      const shouldAward = evaluateBadgeCondition(ctx);

      if (shouldAward) {
        // Award the badge
        const { data: awardedBadge, error: awardError } = await supabase
          .from('friend_badges')
          .insert({
            friend_id: friendId,
            badge_id: badge.id,
            earned_incident_id: incident?.id || null,
          })
          .select(`
            *,
            badge:badges(*)
          `)
          .single();

        if (!awardError && awardedBadge) {
          newlyEarned.push({
            ...awardedBadge,
            badge: awardedBadge.badge as Badge,
          });
        }
      }
    }

    return newlyEarned;
  } catch (error) {
    console.error('Badge check failed:', error);
    return [];
  }
}

// Check badges for all friends (useful for batch updates)
export async function checkBadgesForAllFriends(): Promise<Map<string, FriendBadge[]>> {
  if (!hasValidCredentials) return new Map();

  try {
    const { data: friends } = await supabase.from('friends').select('id');
    if (!friends) return new Map();

    const results = new Map<string, FriendBadge[]>();

    for (const friend of friends) {
      const newBadges = await checkAndAwardBadges(friend.id);
      if (newBadges.length > 0) {
        results.set(friend.id, newBadges);
      }
    }

    return results;
  } catch (error) {
    console.error('Batch badge check failed:', error);
    return new Map();
  }
}

// Get icon for a badge condition type
export function getBadgeConditionIcon(type: string): string {
  switch (type) {
    case 'consecutive_late':
      return 'flame';
    case 'total_late':
      return 'repeat';
    case 'minutes_late_single':
      return 'timer';
    case 'minutes_late_avg':
      return 'trending-up';
    case 'no_evidence':
      return 'ghost';
    case 'always_evidence':
      return 'camera';
    case 'on_time_streak':
      return 'check-circle';
    case 'first_late':
      return 'baby';
    default:
      return 'award';
  }
}

// Get description for badge condition
export function getBadgeConditionDescription(type: string, value: number | null): string {
  switch (type) {
    case 'consecutive_late':
      return `${value}x achter elkaar te laat`;
    case 'total_late':
      return `Totaal ${value}x te laat`;
    case 'minutes_late_single':
      return `Meer dan ${value} minuten te laat`;
    case 'minutes_late_avg':
      return `Gemiddeld ${value}+ minuten te laat`;
    case 'no_evidence':
      return `${value}x zonder bewijs`;
    case 'always_evidence':
      return `${value}x met bewijs`;
    case 'on_time_streak':
      return `${value}x op tijd achter elkaar`;
    case 'first_late':
      return 'Eerste keer te laat';
    case 'custom':
      return 'Handmatig toegekend';
    default:
      return 'Onbekende voorwaarde';
  }
}
