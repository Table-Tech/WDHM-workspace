'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getRandomAvatarColor } from '@/lib/colors';
import type { Friend, Incident, FriendWithStats } from '@/types';
import { calculateMilestoneProgress, DEFAULT_MILESTONES } from '@/lib/milestones';

// Fetch all friends
async function fetchFriends(): Promise<Friend[]> {
  const { data, error } = await supabase
    .from('friends')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Fetch incident counts per friend
async function fetchIncidentCounts(): Promise<Record<string, number>> {
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

// Add a new friend
async function addFriend(name: string): Promise<Friend> {
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
      const [friends, incidentCounts, lastIncidents] = await Promise.all([
        fetchFriends(),
        fetchIncidentCounts(),
        fetchLastIncidents(),
      ]);

      return friends.map((friend) => {
        const count = incidentCounts[friend.id] || 0;
        const { current, next, progress, remaining } = calculateMilestoneProgress(
          count,
          DEFAULT_MILESTONES
        );

        return {
          ...friend,
          incident_count: count,
          current_milestone: current,
          next_milestone: next,
          progress_percentage: progress,
          incidents_until_next: remaining,
          last_incident: lastIncidents[friend.id] || null,
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
