'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { IncidentReaction } from '@/types';

// Fetch reactions for an incident
async function fetchReactions(incidentId: string): Promise<IncidentReaction[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('incident_reactions')
    .select('*')
    .eq('incident_id', incidentId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Add a reaction
async function addReaction(params: { incidentId: string; friendId: string; gifId: string }): Promise<IncidentReaction> {
  if (!hasValidCredentials) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('incident_reactions')
    .insert({
      incident_id: params.incidentId,
      friend_id: params.friendId,
      gif_id: params.gifId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Remove a reaction
async function removeReaction(id: string): Promise<void> {
  if (!hasValidCredentials) throw new Error('Supabase is not configured.');

  const { error } = await supabase
    .from('incident_reactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Hook: Get reactions for a specific incident
export function useReactions(incidentId: string | null) {
  return useQuery({
    queryKey: ['reactions', incidentId],
    queryFn: () => (incidentId ? fetchReactions(incidentId) : Promise.resolve([])),
    enabled: !!incidentId && hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Add a reaction
export function useAddReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addReaction,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reactions', data.incident_id] });
    },
  });
}

// Hook: Remove a reaction
export function useRemoveReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeReaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions'] });
    },
  });
}
