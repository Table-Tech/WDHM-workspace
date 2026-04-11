'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { Incident, MilestoneReachedEvent } from '@/types';
import { shouldShowMilestoneBanner, DEFAULT_MILESTONES } from '@/lib/milestones';

interface UseRealtimeSyncOptions {
  onMilestoneReached?: (event: MilestoneReachedEvent) => void;
}

export function useRealtimeSync(options: UseRealtimeSyncOptions = {}) {
  const queryClient = useQueryClient();
  const { onMilestoneReached } = options;

  // Keep track of incident counts for milestone detection
  const incidentCountsRef = useRef<Record<string, number>>({});

  // Update incident counts cache
  const updateIncidentCounts = useCallback(async () => {
    if (!hasValidCredentials) {
      incidentCountsRef.current = {};
      return;
    }

    const { data } = await supabase.from('incidents').select('friend_id');
    const counts: Record<string, number> = {};
    (data || []).forEach((incident) => {
      counts[incident.friend_id] = (counts[incident.friend_id] || 0) + 1;
    });
    incidentCountsRef.current = counts;
  }, []);

  // Initialize counts on mount
  useEffect(() => {
    updateIncidentCounts();
  }, [updateIncidentCounts]);

  useEffect(() => {
    if (!hasValidCredentials) return;

    // Subscribe to friends table changes
    const friendsChannel = supabase
      .channel('friends-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friends',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['friends'] });
          queryClient.invalidateQueries({ queryKey: ['friends-with-stats'] });
        }
      )
      .subscribe();

    // Subscribe to incidents table changes
    const incidentsChannel = supabase
      .channel('incidents-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'incidents',
        },
        async (payload) => {
          const newIncident = payload.new as Incident;
          const previousCount = incidentCountsRef.current[newIncident.friend_id] || 0;
          const newCount = previousCount + 1;

          // Check for milestone
          const milestone = shouldShowMilestoneBanner(
            previousCount,
            newCount,
            DEFAULT_MILESTONES
          );

          if (milestone && onMilestoneReached) {
            // Fetch the friend data and all their incidents
            const [friendResult, incidentsResult] = await Promise.all([
              supabase
                .from('friends')
                .select('*')
                .eq('id', newIncident.friend_id)
                .single(),
              supabase
                .from('incidents')
                .select('*')
                .eq('friend_id', newIncident.friend_id)
                .order('created_at', { ascending: false }),
            ]);

            if (friendResult.data) {
              onMilestoneReached({
                friend: friendResult.data,
                milestone,
                incidents: incidentsResult.data || [],
              });
            }
          }

          // Update local count
          incidentCountsRef.current[newIncident.friend_id] = newCount;

          // Invalidate queries
          queryClient.invalidateQueries({ queryKey: ['incidents'] });
          queryClient.invalidateQueries({ queryKey: ['friends-with-stats'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'incidents',
        },
        () => {
          updateIncidentCounts();
          queryClient.invalidateQueries({ queryKey: ['incidents'] });
          queryClient.invalidateQueries({ queryKey: ['friends-with-stats'] });
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(friendsChannel);
      supabase.removeChannel(incidentsChannel);
    };
  }, [queryClient, onMilestoneReached, updateIncidentCounts]);
}
