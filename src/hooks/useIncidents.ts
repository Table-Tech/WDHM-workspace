'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import { uploadIncidentMedia, uploadMultipleMedia } from '@/lib/storage';
import { checkAndAwardBadges } from '@/lib/badges';
import { updateStreaksAfterIncident } from '@/hooks/useStreaks';
import type { Incident, IncidentFormData, Friend, IncidentWithFriend, FriendMilestoneGallery, ReachedMilestone, Milestone, FriendBadge } from '@/types';
import { DEFAULT_MILESTONES } from '@/lib/milestones';

// Result type for incident creation with badges
export interface CreateIncidentResult {
  incident: Incident;
  newBadges: FriendBadge[];
}

// Fetch all incidents
async function fetchIncidents(): Promise<Incident[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Fetch incidents for a specific friend
async function fetchIncidentsByFriend(friendId: string): Promise<Incident[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .eq('friend_id', friendId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Create a new incident
async function createIncident(formData: IncidentFormData): Promise<CreateIncidentResult> {
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
      latitude: formData.latitude ?? null,
      longitude: formData.longitude ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  const incident = data as Incident;

  // Update streaks after incident
  await updateStreaksAfterIncident(formData.friend_id, incident.id);

  // Check and award badges
  const newBadges = await checkAndAwardBadges(formData.friend_id, incident);

  return { incident, newBadges };
}

// Delete an incident
async function deleteIncident(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const { error } = await supabase
    .from('incidents')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Hook: Get all incidents
export function useIncidents() {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: fetchIncidents,
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Get incidents for a specific friend
export function useIncidentsByFriend(friendId: string | null) {
  return useQuery({
    queryKey: ['incidents', friendId],
    queryFn: () => (friendId ? fetchIncidentsByFriend(friendId) : Promise.resolve([])),
    enabled: !!friendId && hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Create a new incident (returns incident + any newly earned badges)
export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIncident,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
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

// Hook: Delete an incident
export function useDeleteIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['friends-with-stats'] });
      queryClient.invalidateQueries({ queryKey: ['incidents-with-friends'] });
      queryClient.invalidateQueries({ queryKey: ['incidents-with-media'] });
      queryClient.invalidateQueries({ queryKey: ['milestone-galleries'] });
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
  if (!hasValidCredentials) return [];

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
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Get incidents with media (photos/videos) for a specific friend
export function useIncidentsWithMediaByFriend(friendId: string | null) {
  return useQuery({
    queryKey: ['incidents-with-media', friendId],
    queryFn: async (): Promise<Incident[]> => {
      if (!friendId) return [];
      if (!hasValidCredentials) return [];

      const { data, error } = await supabase
        .from('incidents')
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

// Fetch all friends with their incidents for milestone galleries
async function fetchMilestoneGalleries(milestones: Milestone[]): Promise<FriendMilestoneGallery[]> {
  if (!hasValidCredentials) return [];

  // Fetch all friends
  const { data: friends, error: friendsError } = await supabase
    .from('friends')
    .select('*')
    .order('name', { ascending: true });

  if (friendsError) throw friendsError;
  if (!friends || friends.length === 0) return [];

  // Fetch all incidents with media
  const { data: allIncidents, error: incidentsError } = await supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: true });

  if (incidentsError) throw incidentsError;

  const sortedMilestones = [...milestones].sort((a, b) => a.count - b.count);

  return friends.map((friend) => {
    // Get all incidents for this friend, sorted by date (oldest first)
    const friendIncidents = (allIncidents || [])
      .filter((i) => i.friend_id === friend.id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const totalIncidents = friendIncidents.length;
    const reachedMilestones: ReachedMilestone[] = [];

    // For each milestone that has been reached
    for (const milestone of sortedMilestones) {
      if (totalIncidents >= milestone.count) {
        // Find previous milestone count (or 0 if first milestone)
        const prevMilestoneIndex = sortedMilestones.indexOf(milestone) - 1;
        const prevCount = prevMilestoneIndex >= 0 ? sortedMilestones[prevMilestoneIndex].count : 0;

        // Get incidents between previous milestone and this one (only those with media)
        const milestoneIncidents = friendIncidents
          .slice(prevCount, milestone.count)
          .filter((i) => i.photo_url || i.video_url);

        // Get the date when this milestone was reached (the nth incident)
        const milestoneReachedIncident = friendIncidents[milestone.count - 1];
        const reachedAt = milestoneReachedIncident?.created_at || '';

        reachedMilestones.push({
          milestone,
          incidents: milestoneIncidents,
          reachedAt,
        });
      }
    }

    return {
      friend,
      totalIncidents,
      reachedMilestones,
    };
  }).filter((g) => g.reachedMilestones.length > 0); // Only return friends with at least one milestone reached
}

// Hook: Get all milestone galleries
export function useMilestoneGalleries() {
  return useQuery({
    queryKey: ['milestone-galleries'],
    queryFn: () => fetchMilestoneGalleries(DEFAULT_MILESTONES),
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}
