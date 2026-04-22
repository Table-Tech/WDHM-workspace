'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import { checkAndAwardBadges } from '@/lib/badges';
import type { Streak, StreakType, FriendBadge } from '@/types';

// Result type for on-time marking
export interface MarkOnTimeResult {
  streak: Streak;
  newBadges: FriendBadge[];
}

// Fetch streaks for a specific friend
async function fetchFriendStreaks(friendId: string): Promise<Streak[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('friend_id', friendId);

  if (error) throw error;
  return data || [];
}

// Fetch all streaks (for leaderboards)
async function fetchAllStreaks(): Promise<Streak[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .order('current_count', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Update or create a streak
async function upsertStreak(params: {
  friendId: string;
  streakType: StreakType;
  currentCount: number;
  incidentId?: string;
}): Promise<Streak> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  // Check for existing streak
  const { data: existing } = await supabase
    .from('streaks')
    .select('*')
    .eq('friend_id', params.friendId)
    .eq('streak_type', params.streakType)
    .single();

  if (existing) {
    // Update existing streak
    const newBest = Math.max(existing.best_count, params.currentCount);

    const { data, error } = await supabase
      .from('streaks')
      .update({
        current_count: params.currentCount,
        best_count: newBest,
        last_incident_id: params.incidentId || existing.last_incident_id,
        last_updated: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new streak
    const { data, error } = await supabase
      .from('streaks')
      .insert({
        friend_id: params.friendId,
        streak_type: params.streakType,
        current_count: params.currentCount,
        best_count: params.currentCount,
        last_incident_id: params.incidentId || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// Hook: Get streaks for a friend
export function useFriendStreaks(friendId: string | null) {
  return useQuery({
    queryKey: ['streaks', friendId],
    queryFn: () => (friendId ? fetchFriendStreaks(friendId) : Promise.resolve([])),
    enabled: !!friendId && hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Get all streaks
export function useAllStreaks() {
  return useQuery({
    queryKey: ['all-streaks'],
    queryFn: fetchAllStreaks,
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Update a streak
export function useUpdateStreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertStreak,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['streaks', data.friend_id] });
      queryClient.invalidateQueries({ queryKey: ['all-streaks'] });
      queryClient.invalidateQueries({ queryKey: ['friends-with-stats'] });
    },
  });
}

// Calculate current late streak from incidents
export function calculateLateStreak(incidents: Array<{ created_at: string }>): number {
  // Late streak is simply the count of consecutive late incidents
  // Since every incident IS a late event, the streak is the count of incidents
  // In a more complex system, you'd track "events" where someone could be on-time or late
  return incidents.length;
}

// Update streaks after a new incident
export async function updateStreaksAfterIncident(
  friendId: string,
  incidentId: string
): Promise<void> {
  if (!hasValidCredentials) return;

  try {
    // Fetch all incidents for this friend
    const { data: incidents, error } = await supabase
      .from('incidents')
      .select('id, created_at')
      .eq('friend_id', friendId)
      .order('created_at', { ascending: false });

    if (error || !incidents) return;

    // Calculate late streak (number of consecutive late incidents)
    const lateStreak = incidents.length;

    // Update the late streak
    await upsertStreak({
      friendId,
      streakType: 'late',
      currentCount: lateStreak,
      incidentId,
    });

    // Reset on-time streak when someone is late
    const { data: onTimeStreak } = await supabase
      .from('streaks')
      .select('*')
      .eq('friend_id', friendId)
      .eq('streak_type', 'on_time')
      .single();

    if (onTimeStreak && onTimeStreak.current_count > 0) {
      await supabase
        .from('streaks')
        .update({
          current_count: 0,
          last_updated: new Date().toISOString(),
        })
        .eq('id', onTimeStreak.id);
    }
  } catch (error) {
    console.error('Failed to update streaks:', error);
  }
}

// Get streak display info
export function getStreakDisplay(streak: Streak | undefined): {
  icon: 'skull' | 'flame' | 'zap' | 'thermometer' | null;
  color: string;
  label: string;
} {
  const count = streak?.current_count || 0;

  if (count >= 20) {
    return { icon: 'skull', color: 'text-red-500', label: 'Chronisch!' };
  } else if (count >= 10) {
    return { icon: 'flame', color: 'text-orange-500', label: 'On Fire!' };
  } else if (count >= 5) {
    return { icon: 'zap', color: 'text-yellow-500', label: 'Streak!' };
  } else if (count >= 3) {
    return { icon: 'thermometer', color: 'text-orange-400', label: 'Warming up' };
  }

  return { icon: null, color: 'text-white/50', label: '' };
}

// Mark a friend as "on time" - this increments their on_time streak and resets late streak
export async function markAsOnTime(friendId: string): Promise<MarkOnTimeResult | null> {
  if (!hasValidCredentials) return null;

  try {
    // Get current on_time streak
    const { data: existing } = await supabase
      .from('streaks')
      .select('*')
      .eq('friend_id', friendId)
      .eq('streak_type', 'on_time')
      .single();

    const newCount = (existing?.current_count || 0) + 1;
    const newBest = Math.max(existing?.best_count || 0, newCount);

    // Update or create on_time streak
    let onTimeStreak: Streak;
    if (existing) {
      const { data, error } = await supabase
        .from('streaks')
        .update({
          current_count: newCount,
          best_count: newBest,
          last_updated: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      onTimeStreak = data;
    } else {
      const { data, error } = await supabase
        .from('streaks')
        .insert({
          friend_id: friendId,
          streak_type: 'on_time',
          current_count: newCount,
          best_count: newBest,
        })
        .select()
        .single();

      if (error) throw error;
      onTimeStreak = data;
    }

    // Reset late streak when someone is on time
    const { data: lateStreak } = await supabase
      .from('streaks')
      .select('*')
      .eq('friend_id', friendId)
      .eq('streak_type', 'late')
      .single();

    if (lateStreak && lateStreak.current_count > 0) {
      await supabase
        .from('streaks')
        .update({
          current_count: 0,
          last_updated: new Date().toISOString(),
        })
        .eq('id', lateStreak.id);
    }

    // Check and award badges (including on_time_streak badges)
    const newBadges = await checkAndAwardBadges(friendId);

    return { streak: onTimeStreak, newBadges };
  } catch (error) {
    console.error('Failed to mark as on time:', error);
    return null;
  }
}

// Hook: Mark friend as on time (returns streak + any newly earned badges)
export function useMarkAsOnTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsOnTime,
    onSuccess: (result) => {
      if (result) {
        queryClient.invalidateQueries({ queryKey: ['streaks', result.streak.friend_id] });
        queryClient.invalidateQueries({ queryKey: ['all-streaks'] });
        queryClient.invalidateQueries({ queryKey: ['friends-with-stats'] });
        if (result.newBadges.length > 0) {
          queryClient.invalidateQueries({ queryKey: ['badges'] });
          queryClient.invalidateQueries({ queryKey: ['friend-badges'] });
          queryClient.invalidateQueries({ queryKey: ['all-friend-badges'] });
        }
      }
    },
  });
}

// Undo the last on-time mark (decrement on_time streak by 1)
export async function undoOnTime(friendId: string): Promise<Streak | null> {
  if (!hasValidCredentials) return null;

  try {
    // Get current on_time streak
    const { data: existing } = await supabase
      .from('streaks')
      .select('*')
      .eq('friend_id', friendId)
      .eq('streak_type', 'on_time')
      .single();

    if (!existing || existing.current_count <= 0) return null;

    const newCount = existing.current_count - 1;

    // Update on_time streak
    const { data, error } = await supabase
      .from('streaks')
      .update({
        current_count: newCount,
        last_updated: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to undo on time:', error);
    return null;
  }
}

// Hook: Undo the last on-time mark
export function useUndoOnTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: undoOnTime,
    onSuccess: (result) => {
      if (result) {
        queryClient.invalidateQueries({ queryKey: ['streaks', result.friend_id] });
        queryClient.invalidateQueries({ queryKey: ['all-streaks'] });
        queryClient.invalidateQueries({ queryKey: ['friends-with-stats'] });
      }
    },
  });
}
