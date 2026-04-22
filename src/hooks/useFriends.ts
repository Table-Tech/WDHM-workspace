'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import { getRandomAvatarColor } from '@/lib/colors';
import type { Friend, Incident, FriendWithStats, Streak } from '@/types';
import { calculateMilestoneProgress, convertToMilestones, DEFAULT_MILESTONES } from '@/lib/milestones';

// Fetch all friends
async function fetchFriends(): Promise<Friend[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('friends')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Fetch incident counts per friend
async function fetchIncidentCounts(): Promise<Record<string, number>> {
  if (!hasValidCredentials) return {};

  const { data, error } = await supabase
    .from('incidents')
    .select('friend_id');

  if (error) throw error;

  const counts: Record<string, number> = {};
  (data || []).forEach((incident) => {
    counts[incident.friend_id] = (counts[incident.friend_id] || 0) + 1;
  });

  return counts;
}

// Fetch last incident per friend
async function fetchLastIncidents(): Promise<Record<string, Incident>> {
  if (!hasValidCredentials) return {};

  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const lastIncidents: Record<string, Incident> = {};
  (data || []).forEach((incident) => {
    if (!lastIncidents[incident.friend_id]) {
      lastIncidents[incident.friend_id] = incident;
    }
  });

  return lastIncidents;
}

// Fetch milestone settings and convert to app milestone model
async function fetchMilestonesForStats() {
  if (!hasValidCredentials) return DEFAULT_MILESTONES;

  const { data, error } = await supabase
    .from('group_settings')
    .select('*')
    .order('milestone_count', { ascending: true });

  if (error || !data || data.length === 0) {
    return DEFAULT_MILESTONES;
  }

  return convertToMilestones(data);
}

// Fetch on-time streaks for all friends
async function fetchOnTimeStreaks(): Promise<Record<string, number>> {
  if (!hasValidCredentials) return {};

  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('streak_type', 'on_time');

  if (error) return {};

  const streaks: Record<string, number> = {};
  (data || []).forEach((streak: Streak) => {
    streaks[streak.friend_id] = streak.current_count;
  });

  return streaks;
}

// Add a new friend
async function addFriend(name: string): Promise<Friend> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('friends')
    .insert({
      name: name.trim(),
      color: getRandomAvatarColor(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update a friend
async function updateFriend(data: { id: string; name: string; color: string }): Promise<Friend> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const { data: friend, error } = await supabase
    .from('friends')
    .update({
      name: data.name.trim(),
      color: data.color,
    })
    .eq('id', data.id)
    .select()
    .single();

  if (error) throw error;
  return friend;
}

// Delete a friend
async function deleteFriend(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Hook: Get all friends with stats
export function useFriends() {
  return useQuery({
    queryKey: ['friends'],
    queryFn: fetchFriends,
  });
}

// Hook: Get friends with computed stats (incident counts, milestones, etc.)
export function useFriendsWithStats() {
  return useQuery({
    queryKey: ['friends-with-stats'],
    queryFn: async (): Promise<FriendWithStats[]> => {
      const [friends, incidentCounts, lastIncidents, milestones, onTimeStreaks] = await Promise.all([
        fetchFriends(),
        fetchIncidentCounts(),
        fetchLastIncidents(),
        fetchMilestonesForStats(),
        fetchOnTimeStreaks(),
      ]);

      return friends.map((friend) => {
        const count = incidentCounts[friend.id] || 0;
        const { current, next, progress, remaining } = calculateMilestoneProgress(
          count,
          milestones
        );

        return {
          ...friend,
          incident_count: count,
          current_milestone: current,
          next_milestone: next,
          progress_percentage: progress,
          incidents_until_next: remaining,
          last_incident: lastIncidents[friend.id] || null,
          on_time_streak: onTimeStreaks[friend.id] || 0,
        };
      });
    },
  });
}

// Hook: Add a new friend
export function useAddFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friends-with-stats'] });
    },
  });
}

// Hook: Update a friend
export function useUpdateFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friends-with-stats'] });
    },
  });
}

// Hook: Delete a friend
export function useDeleteFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friends-with-stats'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}
