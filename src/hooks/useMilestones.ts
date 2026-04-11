'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import { convertToMilestones, DEFAULT_MILESTONES } from '@/lib/milestones';
import type { GroupSetting, Milestone } from '@/types';

// Fetch milestones from database
async function fetchMilestones(): Promise<GroupSetting[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('group_settings')
    .select('*')
    .order('milestone_count', { ascending: true });

  if (error) {
    console.warn('Failed to fetch milestones:', error);
    return [];
  }

  return (data as GroupSetting[]) || [];
}

// Update a milestone
async function updateMilestone(milestone: {
  id: string;
  milestone_count: number;
  penalty_text: string;
  emoji: string;
}): Promise<GroupSetting> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('group_settings')
    .update({
      milestone_count: milestone.milestone_count,
      penalty_text: milestone.penalty_text,
      emoji: milestone.emoji,
      updated_at: new Date().toISOString(),
    })
    .eq('id', milestone.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Add a new milestone
async function addMilestone(milestone: {
  milestone_count: number;
  penalty_text: string;
  emoji: string;
}): Promise<GroupSetting> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase
    .from('group_settings')
    .insert({
      milestone_count: milestone.milestone_count,
      penalty_text: milestone.penalty_text,
      emoji: milestone.emoji,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a milestone
async function deleteMilestone(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const { error } = await supabase
    .from('group_settings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Hook: Get milestones as Milestone[] for display
export function useMilestones() {
  return useQuery({
    queryKey: ['milestones'],
    queryFn: async (): Promise<Milestone[]> => {
      const settings = await fetchMilestones();
      if (settings.length === 0) {
        return DEFAULT_MILESTONES;
      }
      return convertToMilestones(settings);
    },
    staleTime: 1000 * 60 * 5,
    enabled: hasValidCredentials,
    placeholderData: DEFAULT_MILESTONES,
  });
}

// Hook: Get milestones as GroupSetting[] for editing
export function useMilestoneSettings() {
  return useQuery({
    queryKey: ['milestone-settings'],
    queryFn: fetchMilestones,
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Update a milestone
export function useUpdateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMilestone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['milestone-settings'] });
      queryClient.invalidateQueries({ queryKey: ['friends-with-stats'] });
    },
  });
}

// Hook: Add a new milestone
export function useAddMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addMilestone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['milestone-settings'] });
      queryClient.invalidateQueries({ queryKey: ['friends-with-stats'] });
    },
  });
}

// Hook: Delete a milestone
export function useDeleteMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMilestone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['milestone-settings'] });
      queryClient.invalidateQueries({ queryKey: ['friends-with-stats'] });
    },
  });
}

// Export default milestones for immediate use
export { DEFAULT_MILESTONES };
