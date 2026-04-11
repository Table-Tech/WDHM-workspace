'use client';

import { useQuery } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { LeaderboardEntry, LeaderboardType, LeaderboardPeriod, GroupStats, FunStat } from '@/types';

// Get date range for period
function getDateRange(period: LeaderboardPeriod): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  let start: Date;

  switch (period) {
    case 'week':
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      break;
    case 'all_time':
    default:
      start = new Date(2020, 0, 1); // Far back enough
      break;
  }

  return { start, end };
}

// Fetch leaderboard data
async function fetchLeaderboard(
  type: LeaderboardType,
  period: LeaderboardPeriod
): Promise<LeaderboardEntry[]> {
  if (!hasValidCredentials) return [];

  const { start, end } = getDateRange(period);

  // Fetch friends
  const { data: friends, error: friendsError } = await supabase
    .from('friends')
    .select('*');

  if (friendsError || !friends) return [];

  // Fetch incidents within period
  const { data: incidents, error: incidentsError } = await supabase
    .from('incidents')
    .select('*')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString());

  if (incidentsError) return [];

  const incidentData = incidents || [];

  // Fetch streaks if needed
  let streaks: Array<{ friend_id: string; current_count: number; best_count: number }> = [];
  if (type === 'current_streak' || type === 'best_streak') {
    const { data: streakData } = await supabase
      .from('streaks')
      .select('*')
      .eq('streak_type', 'late');
    streaks = streakData || [];
  }

  // Calculate values per friend
  const friendStats: Map<string, number> = new Map();

  switch (type) {
    case 'most_late':
      friends.forEach((friend) => {
        const count = incidentData.filter((i) => i.friend_id === friend.id).length;
        friendStats.set(friend.id, count);
      });
      break;

    case 'least_late':
      friends.forEach((friend) => {
        const count = incidentData.filter((i) => i.friend_id === friend.id).length;
        friendStats.set(friend.id, count);
      });
      break;

    case 'avg_minutes':
      friends.forEach((friend) => {
        const friendIncidents = incidentData.filter((i) => i.friend_id === friend.id);
        if (friendIncidents.length > 0) {
          const total = friendIncidents.reduce((sum, i) => sum + (i.minutes_late || 0), 0);
          const avg = Math.round(total / friendIncidents.length);
          friendStats.set(friend.id, avg);
        } else {
          friendStats.set(friend.id, 0);
        }
      });
      break;

    case 'current_streak':
      friends.forEach((friend) => {
        const streak = streaks.find((s) => s.friend_id === friend.id);
        friendStats.set(friend.id, streak?.current_count || 0);
      });
      break;

    case 'best_streak':
      friends.forEach((friend) => {
        const streak = streaks.find((s) => s.friend_id === friend.id);
        friendStats.set(friend.id, streak?.best_count || 0);
      });
      break;
  }

  // Convert to leaderboard entries
  const entries: LeaderboardEntry[] = friends.map((friend) => ({
    friend,
    value: friendStats.get(friend.id) || 0,
    rank: 0,
  }));

  // Sort (descending for most metrics, ascending for least_late)
  entries.sort((a, b) => {
    if (type === 'least_late') {
      return a.value - b.value;
    }
    return b.value - a.value;
  });

  // Assign ranks
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return entries;
}

// Fetch group statistics
async function fetchGroupStats(): Promise<GroupStats> {
  if (!hasValidCredentials) {
    return {
      total_incidents: 0,
      total_minutes_late: 0,
      avg_minutes_late: 0,
      most_common_day: 'Onbekend',
      most_common_hour: 0,
      total_with_evidence: 0,
    };
  }

  const { data: incidents, error } = await supabase
    .from('incidents')
    .select('*');

  if (error || !incidents || incidents.length === 0) {
    return {
      total_incidents: 0,
      total_minutes_late: 0,
      avg_minutes_late: 0,
      most_common_day: 'Onbekend',
      most_common_hour: 0,
      total_with_evidence: 0,
    };
  }

  const totalIncidents = incidents.length;
  const totalMinutes = incidents.reduce((sum, i) => sum + (i.minutes_late || 0), 0);
  const avgMinutes = Math.round(totalMinutes / totalIncidents);
  const withEvidence = incidents.filter((i) => i.photo_url || i.video_url).length;

  // Find most common day of week
  const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const dayCounts: Record<number, number> = {};
  incidents.forEach((i) => {
    const day = new Date(i.created_at).getDay();
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  const mostCommonDayNum = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const mostCommonDay = mostCommonDayNum ? dayNames[parseInt(mostCommonDayNum)] : 'Onbekend';

  // Find most common hour
  const hourCounts: Record<number, number> = {};
  incidents.forEach((i) => {
    const hour = new Date(i.created_at).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const mostCommonHour = parseInt(Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '12');

  return {
    total_incidents: totalIncidents,
    total_minutes_late: totalMinutes,
    avg_minutes_late: avgMinutes,
    most_common_day: mostCommonDay,
    most_common_hour: mostCommonHour,
    total_with_evidence: withEvidence,
  };
}

// Fetch fun stats
async function fetchFunStats(): Promise<FunStat[]> {
  if (!hasValidCredentials) return [];

  const { data: incidents } = await supabase.from('incidents').select('*');
  const { data: friends } = await supabase.from('friends').select('*');

  if (!incidents || !friends) return [];

  const stats: FunStat[] = [];

  // Total time wasted waiting
  const totalMinutes = incidents.reduce((sum, i) => sum + (i.minutes_late || 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  stats.push({
    label: 'Totaal gewacht',
    value: hours > 0 ? `${hours}u ${mins}m` : `${mins} min`,
    icon: 'clock',
    description: 'Tijd die de groep heeft gewacht',
  });

  // Person with longest single late
  const longestLate = incidents.reduce((max, i) => {
    return (i.minutes_late || 0) > (max?.minutes_late || 0) ? i : max;
  }, incidents[0]);
  if (longestLate) {
    const friend = friends.find((f) => f.id === longestLate.friend_id);
    stats.push({
      label: 'Langste wachttijd',
      value: `${longestLate.minutes_late || 0} min`,
      icon: 'trophy',
      description: friend?.name || 'Onbekend',
    });
  }

  // Most popular excuse location
  const locationCounts: Record<string, number> = {};
  incidents.forEach((i) => {
    if (i.location) {
      locationCounts[i.location] = (locationCounts[i.location] || 0) + 1;
    }
  });
  const topLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0];
  if (topLocation) {
    stats.push({
      label: 'Populairste plek',
      value: topLocation[0],
      icon: 'map-pin',
      description: `${topLocation[1]}x`,
    });
  }

  // Incidents without excuse
  const noNote = incidents.filter((i) => !i.note).length;
  stats.push({
    label: 'Geen excuus',
    value: `${noNote}x`,
    icon: 'message-circle-off',
    description: 'Incidents zonder uitleg',
  });

  return stats;
}

// Hook: Get leaderboard
export function useLeaderboard(type: LeaderboardType, period: LeaderboardPeriod) {
  return useQuery({
    queryKey: ['leaderboard', type, period],
    queryFn: () => fetchLeaderboard(type, period),
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Get group stats
export function useGroupStats() {
  return useQuery({
    queryKey: ['group-stats'],
    queryFn: fetchGroupStats,
    enabled: hasValidCredentials,
  });
}

// Hook: Get fun stats
export function useFunStats() {
  return useQuery({
    queryKey: ['fun-stats'],
    queryFn: fetchFunStats,
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}

// Get leaderboard type label
export function getLeaderboardLabel(type: LeaderboardType): string {
  switch (type) {
    case 'most_late':
      return 'Meest Te Laat';
    case 'least_late':
      return 'Minst Te Laat';
    case 'avg_minutes':
      return 'Gemiddeld Minuten';
    case 'current_streak':
      return 'Huidige Streak';
    case 'best_streak':
      return 'Beste Streak';
    default:
      return 'Leaderboard';
  }
}

// Get period label
export function getPeriodLabel(period: LeaderboardPeriod): string {
  switch (period) {
    case 'week':
      return 'Deze Week';
    case 'month':
      return 'Deze Maand';
    case 'all_time':
      return 'Altijd';
    default:
      return period;
  }
}
