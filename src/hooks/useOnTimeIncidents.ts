'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import { uploadMultipleMedia, uploadIncidentMedia } from '@/lib/storage';
import { checkAndAwardBadges } from '@/lib/badges';
import { markAsOnTime } from '@/hooks/useStreaks';
import type { OnTimeIncident, OnTimeFormData, Friend, FriendBadge } from '@/types';

// Result type for on-time incident creation
export interface CreateOnTimeResult {
  incident: OnTimeIncident;
  newBadges: FriendBadge[];
}

// On-time incident with friend data
export interface OnTimeIncidentWithFriend extends OnTimeIncident {
  friend: Friend;
}

// Fetch all on-time incidents
async function fetchOnTimeIncidents(): Promise<OnTimeIncident[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('on_time_incidents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Fetch on-time incidents for a specific friend
async function fetchOnTimeIncidentsByFriend(friendId: string): Promise<OnTimeIncident[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('on_time_incidents')
    .select('*')
    .eq('friend_id', friendId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Fetch all on-time incidents with friend data
async function fetchOnTimeIncidentsWithFriends(): Promise<OnTimeIncidentWithFriend[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('on_time_incidents')
    .select(`
      *,
      friend:friends(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((item) => ({
    ...item,
    friend: item.friend as Friend,
  }));
}

// Create a new on-time incident
async function createOnTimeIncident(formData: OnTimeFormData): Promise<CreateOnTimeResult> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  let photoUrls: string[] = [];
  let videoUrls: string[] = [];
  let mediaType: 'photo' | 'video' | null = null;

  // Upload multiple media items if provided
  if (formData.mediaItems && formData.mediaItems.length > 0) {
    const result = await uploadMultipleMedia(
      formData.mediaItems.map((item) => ({ file: item.file, type: item.type }))
    );
    photoUrls = result.photoUrls;
    videoUrls = result.videoUrls;

    // Set media type based on what was uploaded (prioritize photos)
    if (photoUrls.length > 0) {
      mediaType = 'photo';
    } else if (videoUrls.length > 0) {
      mediaType = 'video';
    }
  } else if (formData.media) {
    // Legacy single file upload
    const result = await uploadIncidentMedia(formData.media);
    if (result) {
      mediaType = result.type;
      if (result.type === 'photo') {
        photoUrls = [result.url];
      } else {
        videoUrls = [result.url];
      }
    }
  }

  // Store URLs as comma-separated for multiple, or single URL for one
  const photoUrl = photoUrls.length > 0 ? photoUrls.join(',') : null;
  const videoUrl = videoUrls.length > 0 ? videoUrls.join(',') : null;

  // Create the on-time incident record
  const { data, error } = await supabase
    .from('on_time_incidents')
    .insert({
      friend_id: formData.friend_id,
      location: formData.location || null,
      photo_url: photoUrl,
      video_url: videoUrl,
      media_type: mediaType,
      note: formData.note || null,
      latitude: formData.latitude ?? null,
      longitude: formData.longitude ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  const incident = data as OnTimeIncident;

  // Update streaks (this also handles on_time streak increment and late streak reset)
  const streakResult = await markAsOnTime(formData.friend_id);

  // Combine badges from streak result
  const newBadges = streakResult?.newBadges || [];

  return { incident, newBadges };
}

// Delete an on-time incident
async function deleteOnTimeIncident(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const { error } = await supabase
    .from('on_time_incidents')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Hook: Get all on-time incidents
export function useOnTimeIncidents() {
  return useQuery({
    queryKey: ['on-time-incidents'],
    queryFn: fetchOnTimeIncidents,
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Get on-time incidents for a specific friend
export function useOnTimeIncidentsByFriend(friendId: string | null) {
  return useQuery({
    queryKey: ['on-time-incidents', friendId],
    queryFn: () => (friendId ? fetchOnTimeIncidentsByFriend(friendId) : Promise.resolve([])),
    enabled: !!friendId && hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Get all on-time incidents with friend data (for gallery)
export function useOnTimeIncidentsWithFriends() {
  return useQuery({
    queryKey: ['on-time-incidents-with-friends'],
    queryFn: fetchOnTimeIncidentsWithFriends,
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Create a new on-time incident
export function useCreateOnTimeIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOnTimeIncident,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['on-time-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['on-time-incidents-with-friends'] });
      queryClient.invalidateQueries({ queryKey: ['friends-with-stats'] });
      queryClient.invalidateQueries({ queryKey: ['streaks'] });
      queryClient.invalidateQueries({ queryKey: ['all-streaks'] });
      // Invalidate badge queries if new badges were earned
      if (result.newBadges.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['badges'] });
        queryClient.invalidateQueries({ queryKey: ['friend-badges'] });
        queryClient.invalidateQueries({ queryKey: ['all-friend-badges'] });
      }
    },
  });
}

// Hook: Delete an on-time incident
export function useDeleteOnTimeIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOnTimeIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['on-time-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['on-time-incidents-with-friends'] });
      queryClient.invalidateQueries({ queryKey: ['friends-with-stats'] });
    },
  });
}

// Hook: Get on-time incident count for a friend
export function useOnTimeIncidentCount(friendId: string) {
  const { data: incidents } = useOnTimeIncidents();
  return incidents?.filter((i) => i.friend_id === friendId).length || 0;
}

// Hook: Get on-time incidents with media (photos/videos) for a specific friend
export function useOnTimeIncidentsWithMediaByFriend(friendId: string | null) {
  return useQuery({
    queryKey: ['on-time-incidents-with-media', friendId],
    queryFn: async (): Promise<OnTimeIncident[]> => {
      if (!friendId) return [];
      if (!hasValidCredentials) return [];

      const { data, error } = await supabase
        .from('on_time_incidents')
        .select('*')
        .eq('friend_id', friendId)
        .or('photo_url.neq.null,video_url.neq.null')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!friendId && hasValidCredentials,
    placeholderData: [],
  });
}
