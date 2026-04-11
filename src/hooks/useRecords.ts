'use client';

import { useQuery } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { HallOfFameRecord, Friend, Incident, IconicMoment, Streak } from '@/types';

// Fetch hall of fame records
async function fetchRecords(): Promise<HallOfFameRecord[]> {
  if (!hasValidCredentials) return [];

  try {
    // Fetch all streaks, friends, and incidents in parallel
    const [
      { data: streaksData, error: streaksError },
      { data: friendsData, error: friendsError },
      { data: incidentsData, error: incidentsError },
    ] = await Promise.all([
      supabase.from('streaks').select('*'),
      supabase.from('friends').select('*'),
      supabase.from('incidents').select('*'),
    ]);

    if (streaksError) throw streaksError;
    if (friendsError) throw friendsError;
    if (incidentsError) throw incidentsError;

    const streaks = (streaksData || []) as Streak[];
    const friends = (friendsData || []) as Friend[];
    const incidents = (incidentsData || []) as Incident[];

    const records: HallOfFameRecord[] = [];

    // 1. Longest late streak
    const longestLateStreak = streaks
      .filter((s) => s.streak_type === 'late')
      .sort((a, b) => b.best_count - a.best_count)[0];

    if (longestLateStreak) {
      const friend = friends.find((f) => f.id === longestLateStreak.friend_id);
      if (friend) {
        records.push({
          type: 'longest_streak',
          friend,
          value: longestLateStreak.best_count,
          date: longestLateStreak.last_updated,
        });
      }
    }

    // 2. Longest on-time streak
    const longestOnTimeStreak = streaks
      .filter((s) => s.streak_type === 'on_time')
      .sort((a, b) => b.best_count - a.best_count)[0];

    if (longestOnTimeStreak) {
      const friend = friends.find((f) => f.id === longestOnTimeStreak.friend_id);
      if (friend) {
        records.push({
          type: 'longest_ontime',
          friend,
          value: longestOnTimeStreak.best_count,
          date: longestOnTimeStreak.last_updated,
        });
      }
    }

    // 3. Most minutes late in a single incident
    let mostMinutesSingle: Incident | null = null;
    let maxMinutes = 0;

    incidents.forEach((incident) => {
      const minutes = incident.minutes_late || 0;
      if (minutes > maxMinutes) {
        maxMinutes = minutes;
        mostMinutesSingle = incident;
      }
    });

    if (mostMinutesSingle && maxMinutes > 0) {
      const latestIncident = mostMinutesSingle as Incident;
      const friend = friends.find((f) => f.id === latestIncident.friend_id);
      if (friend) {
        records.push({
          type: 'most_minutes_single',
          friend,
          value: maxMinutes,
          incident: latestIncident,
          date: latestIncident.created_at,
        });
      }
    }

    // 4. Total minutes late per friend (sum of all minutes_late)
    const minutesByFriend: Record<string, { total: number; incident?: Incident }> = {};

    incidents.forEach((incident) => {
      const minutes = incident.minutes_late || 0;
      if (minutes > 0) {
        if (!minutesByFriend[incident.friend_id]) {
          minutesByFriend[incident.friend_id] = { total: 0 };
        }
        minutesByFriend[incident.friend_id].total += minutes;
      }
    });

    // Find the friend with most total minutes
    let mostTotalMinutes = 0;
    let friendWithMostMinutes: string | null = null;

    Object.entries(minutesByFriend).forEach(([friendId, data]) => {
      if (data.total > mostTotalMinutes) {
        mostTotalMinutes = data.total;
        friendWithMostMinutes = friendId;
      }
    });

    if (friendWithMostMinutes && mostTotalMinutes > 0) {
      const friend = friends.find((f) => f.id === friendWithMostMinutes);
      if (friend) {
        records.push({
          type: 'total_minutes',
          friend,
          value: mostTotalMinutes,
          date: new Date().toISOString(),
        });
      }
    }

    return records;
  } catch (error) {
    console.error('Error fetching records:', error);
    return [];
  }
}

// Fetch iconic moments (incidents marked as iconic)
async function fetchIconicMoments(): Promise<IconicMoment[]> {
  if (!hasValidCredentials) return [];

  try {
    // Check if is_iconic column exists by trying to fetch it
    const { data, error } = await supabase
      .from('incidents')
      .select(`
        *,
        friend:friends(*)
      `)
      .eq('is_iconic', true);

    if (error) {
      // If the column doesn't exist, return empty array
      console.warn('is_iconic column not found, returning empty iconic moments');
      return [];
    }

    return (data || []).map((item) => ({
      incident: {
        id: item.id,
        friend_id: item.friend_id,
        location: item.location,
        scheduled_time: item.scheduled_time,
        minutes_late: item.minutes_late,
        photo_url: item.photo_url,
        video_url: item.video_url,
        media_type: item.media_type,
        note: item.note,
        latitude: item.latitude,
        longitude: item.longitude,
        created_at: item.created_at,
      } as Incident,
      friend: item.friend as Friend,
    }));
  } catch (error) {
    console.error('Error fetching iconic moments:', error);
    return [];
  }
}

// Hook: Get hall of fame records
export function useRecords() {
  return useQuery({
    queryKey: ['records'],
    queryFn: fetchRecords,
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Get iconic moments
export function useIconicMoments() {
  return useQuery({
    queryKey: ['iconic-moments'],
    queryFn: fetchIconicMoments,
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}
