'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import { uploadTripPhoto } from '@/lib/storage';
import type { IncidentLocation, TeamTrip, TeamTripFormData, Friend } from '@/types';

// Fetch all incidents with GPS coordinates
async function fetchIncidentLocations(): Promise<IncidentLocation[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('incidents')
    .select(`
      id,
      latitude,
      longitude,
      location,
      created_at,
      minutes_late,
      photo_url,
      video_url,
      friend:friends(*)
    `)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (error) throw error;

  return (data || []).map((item) => {
    const friend = item.friend as unknown as Friend;
    return {
      incident_id: item.id,
      latitude: item.latitude,
      longitude: item.longitude,
      incident: {
        id: item.id,
        friend_id: friend.id,
        location: item.location,
        scheduled_time: null,
        minutes_late: item.minutes_late,
        photo_url: item.photo_url,
        video_url: item.video_url,
        media_type: item.photo_url ? 'photo' : item.video_url ? 'video' : null,
        note: null,
        latitude: item.latitude,
        longitude: item.longitude,
        created_at: item.created_at,
      },
      friend,
    };
  });
}

// Fetch all team trips
async function fetchTeamTrips(): Promise<TeamTrip[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('team_trips')
    .select(`
      *,
      creator:friends(*)
    `)
    .order('trip_date', { ascending: false });

  if (error) throw error;

  return (data || []).map((item) => ({
    ...item,
    creator: item.creator as unknown as Friend | undefined,
  }));
}

// Add a new team trip
async function addTeamTrip(formData: TeamTripFormData): Promise<TeamTrip> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  let photoUrl: string | null = null;

  if (formData.photo) {
    photoUrl = await uploadTripPhoto(formData.photo);
  }

  const { data, error } = await supabase
    .from('team_trips')
    .insert({
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      latitude: formData.latitude,
      longitude: formData.longitude,
      address: formData.address.trim() || null,
      photo_url: photoUrl,
      trip_date: formData.trip_date || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a team trip
async function deleteTeamTrip(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('team_trips')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Hook: Get all incident locations
export function useIncidentLocations() {
  return useQuery({
    queryKey: ['incident-locations'],
    queryFn: fetchIncidentLocations,
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Get all team trips
export function useTeamTrips() {
  return useQuery({
    queryKey: ['team-trips'],
    queryFn: fetchTeamTrips,
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Add a team trip
export function useAddTeamTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTeamTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-trips'] });
    },
  });
}

// Hook: Delete a team trip
export function useDeleteTeamTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeamTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-trips'] });
    },
  });
}
