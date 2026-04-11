'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import { uploadBadgeImage } from '@/lib/storage';
import type { Badge, FriendBadge, CustomBadgeFormData } from '@/types';

// Fetch all badge definitions
async function fetchAllBadges(): Promise<Badge[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('rarity', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Fetch badges earned by a specific friend
async function fetchFriendBadges(friendId: string): Promise<FriendBadge[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('friend_badges')
    .select(`
      *,
      badge:badges(*)
    `)
    .eq('friend_id', friendId)
    .order('earned_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((item) => ({
    ...item,
    badge: item.badge as Badge,
  }));
}

// Fetch all friend badges (for leaderboards/stats)
async function fetchAllFriendBadges(): Promise<FriendBadge[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('friend_badges')
    .select(`
      *,
      badge:badges(*)
    `)
    .order('earned_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((item) => ({
    ...item,
    badge: item.badge as Badge,
  }));
}

// Award a badge to a friend
async function awardBadge(params: {
  friendId: string;
  badgeId: string;
  incidentId?: string;
}): Promise<FriendBadge> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  // Check if already earned
  const { data: existing } = await supabase
    .from('friend_badges')
    .select('id')
    .eq('friend_id', params.friendId)
    .eq('badge_id', params.badgeId)
    .single();

  if (existing) {
    throw new Error('Badge already earned');
  }

  const { data, error } = await supabase
    .from('friend_badges')
    .insert({
      friend_id: params.friendId,
      badge_id: params.badgeId,
      earned_incident_id: params.incidentId || null,
    })
    .select(`
      *,
      badge:badges(*)
    `)
    .single();

  if (error) throw error;
  return {
    ...data,
    badge: data.badge as Badge,
  };
}

// Create a custom badge
async function createCustomBadge(formData: CustomBadgeFormData): Promise<Badge> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  let imageUrl: string | null = null;

  // Upload image if provided
  if (formData.image) {
    imageUrl = await uploadBadgeImage(formData.image);
  }

  const { data, error } = await supabase
    .from('badges')
    .insert({
      name: formData.name.trim(),
      description: formData.description.trim(),
      icon: formData.icon || 'award',
      image_url: imageUrl,
      condition_type: 'custom',
      condition_value: null,
      rarity: formData.rarity,
      is_system: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Hook: Get all badge definitions
export function useAllBadges() {
  return useQuery({
    queryKey: ['badges'],
    queryFn: fetchAllBadges,
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Get badges for a specific friend
export function useFriendBadges(friendId: string | null) {
  return useQuery({
    queryKey: ['friend-badges', friendId],
    queryFn: () => (friendId ? fetchFriendBadges(friendId) : Promise.resolve([])),
    enabled: !!friendId && hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Get all friend badges
export function useAllFriendBadges() {
  return useQuery({
    queryKey: ['all-friend-badges'],
    queryFn: fetchAllFriendBadges,
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Award a badge
export function useAwardBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: awardBadge,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      queryClient.invalidateQueries({ queryKey: ['friend-badges', data.friend_id] });
      queryClient.invalidateQueries({ queryKey: ['all-friend-badges'] });
      queryClient.invalidateQueries({ queryKey: ['friends-with-stats'] });
    },
  });
}

// Hook: Create a custom badge
export function useCreateBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
    },
  });
}

// Helper: Get badge count by rarity
export function getBadgeCountByRarity(badges: Badge[]): Record<string, number> {
  return badges.reduce((acc, badge) => {
    acc[badge.rarity] = (acc[badge.rarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// Helper: Get rarity color
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
    case 'epic':
      return 'text-purple-400 border-purple-500/50 bg-purple-500/10';
    case 'rare':
      return 'text-blue-400 border-blue-500/50 bg-blue-500/10';
    default:
      return 'text-gray-400 border-gray-500/50 bg-gray-500/10';
  }
}

// Helper: Get rarity label
export function getRarityLabel(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return 'Legendarisch';
    case 'epic':
      return 'Episch';
    case 'rare':
      return 'Zeldzaam';
    default:
      return 'Gewoon';
  }
}
