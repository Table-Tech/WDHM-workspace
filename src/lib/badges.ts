import type { Badge, Incident, FriendBadge } from '@/types';
import { hasValidCredentials, supabase } from './supabase';

// Badge condition evaluators
type BadgeEvaluator = (
  friendId: string,
  badge: Badge,
  currentIncident: Incident,
  allIncidents: Incident[]
) => boolean;

const evaluators: Record<string, BadgeEvaluator> = {
  // First ever late incident
  first_late: (_friendId, _badge, _currentIncident, allIncidents) => {
    return allIncidents.length === 1;
  },

  // Total X times late
  total_late: (_friendId, badge, _currentIncident, allIncidents) => {
    return allIncidents.length >= (badge.condition_value || 0);
  },

  // X consecutive late incidents
  consecutive_late: (_friendId, badge, _currentIncident, allIncidents) => {
    // Since we're tracking late incidents, the count of incidents IS the streak
    // This badge triggers when they've been late X times in a row
    return allIncidents.length >= (badge.condition_value || 0);
  },

  // Single incident >X minutes late
  minutes_late_single: (_friendId, badge, currentIncident) => {
    const minLate = currentIncident.minutes_late || 0;
    return minLate >= (badge.condition_value || 0);
  },

  // Average >X minutes late
  minutes_late_avg: (_friendId, badge, _currentIncident, allIncidents) => {
    if (allIncidents.length < 3) return false; // Need at least 3 incidents for meaningful avg
    const totalMinutes = allIncidents.reduce((sum, i) => sum + (i.minutes_late || 0), 0);
    const avg = totalMinutes / allIncidents.length;
    return avg >= (badge.condition_value || 0);
  },

  // X incidents without evidence (no photo/video)
  no_evidence: (_friendId, badge, _currentIncident, allIncidents) => {
    const withoutEvidence = allIncidents.filter((i) => !i.photo_url && !i.video_url);
    return withoutEvidence.length >= (badge.condition_value || 0);
  },

  // X incidents always with evidence
  always_evidence: (_friendId, badge, _currentIncident, allIncidents) => {
    if (allIncidents.length < (badge.condition_value || 0)) return false;
    const withEvidence = allIncidents.filter((i) => i.photo_url || i.video_url);
    return withEvidence.length >= (badge.condition_value || 0);
  },

  // On time streak (this is complex - would need additional tracking)
  on_time_streak: () => {
    // This requires additional "check-in" system to track on-time arrivals
    // For now, we'll skip automatic evaluation
    return false;
  },

  // Custom badges are manually assigned
  custom: () => false,
};

// Evaluate if a badge should be awarded
export function evaluateBadgeCondition(
  friendId: string,
  badge: Badge,
  currentIncident: Incident,
  allIncidents: Incident[]
): boolean {
  const evaluator = evaluators[badge.condition_type];
  if (!evaluator) return false;
  return evaluator(friendId, badge, currentIncident, allIncidents);
}

// Check and award badges after an incident
export async function checkAndAwardBadges(
  friendId: string,
  incident: Incident
): Promise<FriendBadge[]> {
  if (!hasValidCredentials) return [];

  try {
    // Fetch all badges
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .eq('is_system', true);

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

    const newlyEarned: FriendBadge[] = [];

    // Check each badge
    for (const badge of badges) {
      // Skip if already earned
      if (earnedBadgeIds.has(badge.id)) continue;

      // Evaluate condition
      const shouldAward = evaluateBadgeCondition(
        friendId,
        badge,
        incident,
        allIncidents
      );

      if (shouldAward) {
        // Award the badge
        const { data: awardedBadge, error: awardError } = await supabase
          .from('friend_badges')
          .insert({
            friend_id: friendId,
            badge_id: badge.id,
            earned_incident_id: incident.id,
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
