'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { uploadIncidentMedia } from '@/lib/storage';
import type { Incident, IncidentFormData, Friend, IncidentWithFriend } from '@/types';

// Fetch all incidents
async function fetchIncidents(): Promise<Incident[]> {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Fetch incidents for a specific friend
async function fetchIncidentsByFriend(friendId: string): Promise<Incident[]> {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .eq('friend_id', friendId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Create a new incident
async function createIncident(formData: IncidentFormData): Promise<Incident> {
  let photoUrl: string | null = null;
  let videoUrl: string | null = null;
  let mediaType: 'photo' | 'video' | null = null;

  // Upload media if provided
  if (formData.media) {
    const result = await uploadIncidentMedia(formData.media);
    if (result) {
      mediaType = result.type;
      if (result.type === 'photo') {
        photoUrl = result.url;
      } else {
        videoUrl = result.url;
      }
    }
  }

  const { data, error } = await supabase
    .from('incidents')
    .insert({
      friend_id: formData.friend_id,
      location: formData.location || null,
      scheduled_time: formData.scheduled_time || null,
      minutes_late: formData.minutes_late ? parseInt(formData.minutes_late, 10) : null,
      photo_url: photoUrl,
      video_url: videoUrl,
      media_type: mediaType,
      note: formData.note || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Hook: Get all incidents
export function useIncidents() {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: fetchIncidents,
  });
}

// Hook: Get incidents for a specific friend
export function useIncidentsByFriend(friendId: string | null) {
  return useQuery({
    queryKey: ['incidents', friendId],
    queryFn: () => (friendId ? fetchIncidentsByFriend(friendId) : Promise.resolve([])),
    enabled: !!friendId,
  });
}

// Hook: Create a new incident
export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['friends-with-stats'] });
    },
  });
}

// Hook: Get incident count for a friend
export function useIncidentCount(friendId: string) {
  const { data: incidents } = useIncidents();
  return incidents?.filter((i) => i.friend_id === friendId).length || 0;
}

// Fetch all incidents with friend data for gallery
async function fetchIncidentsWithFriends(): Promise<IncidentWithFriend[]> {
  const { data, error } = await supabase
    .from('incidents')
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

// Hook: Get all incidents with friend data (for gallery)
export function useIncidentsWithFriends() {
  return useQuery({
    queryKey: ['incidents-with-friends'],
    queryFn: fetchIncidentsWithFriends,
  });
}

// Hook: Get incidents with media (photos/videos) for a specific friend
export function useIncidentsWithMediaByFriend(friendId: string | null) {
  return useQuery({
    queryKey: ['incidents-with-media', friendId],
    queryFn: async (): Promise<Incident[]> => {
      if (!friendId) return [];

      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('friend_id', friendId)
        .or('photo_url.neq.null,video_url.neq.null')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!friendId,
  });
}
