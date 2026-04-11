'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { Season, Reset, Friend, Incident, Streak } from '@/types';

// Fetch all seasons ordered by start_date desc
async function fetchSeasons(): Promise<Season[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Fetch the active season
async function fetchActiveSeason(): Promise<Season | null> {
  if (!hasValidCredentials) return null;

  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data || null;
}

// Fetch all resets ordered by reset_at desc
async function fetchResets(): Promise<Reset[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('resets')
    .select('*')
    .order('reset_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Perform a season reset
// 1. Create stats snapshot (total incidents, friend counts)
// 2. Insert into resets table
// 3. End current season (set is_active=false, end_date=now)
// 4. Create new season (is_active=true)
// 5. Archive all incidents (set archived_at=now)
// 6. Reset all streak current_counts to 0
async function performReset(): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  try {
    // 1. Create stats snapshot - get total incidents and friend counts
    const { data: incidents, error: incidentsError } = await supabase
      .from('incidents')
      .select('friend_id')
      .eq('archived_at', null);

    if (incidentsError) throw incidentsError;

    // Get all friends for the snapshot
    const { data: friends, error: friendsError } = await supabase
      .from('friends')
      .select('id, name');

    if (friendsError) throw friendsError;

    // Count incidents per friend
    const incidentCounts: Record<string, number> = {};
    (incidents || []).forEach((incident) => {
      incidentCounts[incident.friend_id] = (incidentCounts[incident.friend_id] || 0) + 1;
    });

    // Build stats snapshot
    const statsSnapshot = {
      total_incidents: incidents?.length || 0,
      friends: (friends || []).map((friend) => ({
        id: friend.id,
        name: friend.name,
        count: incidentCounts[friend.id] || 0,
      })),
    };

    // 2. Insert reset record into resets table
    const { error: resetError } = await supabase
      .from('resets')
      .insert({
        triggered_by: null,
        reset_at: new Date().toISOString(),
        stats_snapshot: statsSnapshot,
      });

    if (resetError) throw resetError;

    // 3. End current active season
    const { data: activeSeason, error: activeSeasonError } = await supabase
      .from('seasons')
      .select('id')
      .eq('is_active', true)
      .single();

    if (activeSeasonError && activeSeasonError.code !== 'PGRST116') throw activeSeasonError;

    if (activeSeason) {
      const { error: updateSeasonError } = await supabase
        .from('seasons')
        .update({
          is_active: false,
          end_date: new Date().toISOString(),
        })
        .eq('id', activeSeason.id);

      if (updateSeasonError) throw updateSeasonError;
    }

    // 4. Create new season
    const { error: createSeasonError } = await supabase
      .from('seasons')
      .insert({
        name: null,
        start_date: new Date().toISOString(),
        end_date: null,
        is_active: true,
      });

    if (createSeasonError) throw createSeasonError;

    // 5. Archive all current incidents
    const { error: archiveError } = await supabase
      .from('incidents')
      .update({
        archived_at: new Date().toISOString(),
      })
      .eq('archived_at', null);

    if (archiveError) throw archiveError;

    // 6. Reset all streak current_counts to 0
    const { data: allStreaks, error: streaksError } = await supabase
      .from('streaks')
      .select('id');

    if (streaksError) throw streaksError;

    if (allStreaks && allStreaks.length > 0) {
      const { error: resetStreaksError } = await supabase
        .from('streaks')
        .update({
          current_count: 0,
          last_updated: new Date().toISOString(),
        })
        .in('id', allStreaks.map((s) => s.id));

      if (resetStreaksError) throw resetStreaksError;
    }
  } catch (error) {
    console.error('Reset failed:', error);
    throw error;
  }
}

// Hook: Get all seasons
export function useSeasons() {
  return useQuery({
    queryKey: ['seasons'],
    queryFn: fetchSeasons,
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Get active season
export function useActiveSeason() {
  return useQuery({
    queryKey: ['active-season'],
    queryFn: fetchActiveSeason,
    enabled: hasValidCredentials,
    placeholderData: null,
  });
}

// Hook: Get all resets
export function useResets() {
  return useQuery({
    queryKey: ['resets'],
    queryFn: fetchResets,
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Perform a reset
export function usePerformReset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: performReset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seasons'] });
      queryClient.invalidateQueries({ queryKey: ['active-season'] });
      queryClient.invalidateQueries({ queryKey: ['resets'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['streaks'] });
      queryClient.invalidateQueries({ queryKey: ['all-streaks'] });
      queryClient.invalidateQueries({ queryKey: ['friends-with-stats'] });
    },
  });
}
