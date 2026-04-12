'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { MemoryAlbum, MemoryPhoto, MemoryAlbumWithPhotos } from '@/types';

// Fetch all albums with photo counts
async function fetchAlbums(): Promise<MemoryAlbumWithPhotos[]> {
  if (!hasValidCredentials) return [];

  const { data: albums, error: albumsError } = await supabase
    .from('memory_albums')
    .select('*')
    .order('event_date', { ascending: false });

  if (albumsError) throw albumsError;
  if (!albums || albums.length === 0) return [];

  // Fetch all photos
  const { data: photos, error: photosError } = await supabase
    .from('memory_photos')
    .select('*')
    .order('created_at', { ascending: true });

  if (photosError) throw photosError;

  // Group photos by album
  const photosByAlbum: Record<string, MemoryPhoto[]> = {};
  (photos || []).forEach((photo) => {
    if (!photosByAlbum[photo.album_id]) {
      photosByAlbum[photo.album_id] = [];
    }
    photosByAlbum[photo.album_id].push(photo);
  });

  return albums.map((album) => ({
    ...album,
    photos: photosByAlbum[album.id] || [],
    photo_count: (photosByAlbum[album.id] || []).length,
  }));
}

// Fetch single album with photos
async function fetchAlbum(id: string): Promise<MemoryAlbumWithPhotos | null> {
  if (!hasValidCredentials) return null;

  const { data: album, error: albumError } = await supabase
    .from('memory_albums')
    .select('*')
    .eq('id', id)
    .single();

  if (albumError) throw albumError;
  if (!album) return null;

  const { data: photos, error: photosError } = await supabase
    .from('memory_photos')
    .select('*')
    .eq('album_id', id)
    .order('created_at', { ascending: true });

  if (photosError) throw photosError;

  return {
    ...album,
    photos: photos || [],
    photo_count: (photos || []).length,
  };
}

// Create a new album
async function createAlbum(data: {
  title: string;
  description?: string;
  event_date?: string;
  cover_url?: string;
}): Promise<MemoryAlbum> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data: album, error } = await supabase
    .from('memory_albums')
    .insert({
      title: data.title.trim(),
      description: data.description?.trim() || null,
      event_date: data.event_date || null,
      cover_url: data.cover_url || null,
    })
    .select()
    .single();

  if (error) throw error;
  return album;
}

// Add photos to an album
async function addPhotosToAlbum(data: {
  album_id: string;
  photos: Array<{ photo_url: string; video_url?: string; caption?: string }>;
}): Promise<MemoryPhoto[]> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const photosToInsert = data.photos.map((photo, index) => ({
    album_id: data.album_id,
    photo_url: photo.photo_url,
    video_url: photo.video_url || null,
    caption: photo.caption || null,
    is_cover: index === 0, // First photo is cover by default
  }));

  const { data: photos, error } = await supabase
    .from('memory_photos')
    .insert(photosToInsert)
    .select();

  if (error) throw error;
  return photos;
}

// Update album cover
async function updateAlbumCover(data: { album_id: string; cover_url: string }): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('memory_albums')
    .update({ cover_url: data.cover_url })
    .eq('id', data.album_id);

  if (error) throw error;
}

// Delete album
async function deleteAlbum(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('memory_albums')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Delete photo
async function deletePhoto(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('memory_photos')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Hook: Get all albums
export function useMemoryAlbums() {
  return useQuery({
    queryKey: ['memory-albums'],
    queryFn: fetchAlbums,
  });
}

// Hook: Get single album
export function useMemoryAlbum(id: string) {
  return useQuery({
    queryKey: ['memory-album', id],
    queryFn: () => fetchAlbum(id),
    enabled: !!id,
  });
}

// Hook: Create album
export function useCreateAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-albums'] });
    },
  });
}

// Hook: Add photos to album
export function useAddPhotosToAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addPhotosToAlbum,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['memory-albums'] });
      queryClient.invalidateQueries({ queryKey: ['memory-album', variables.album_id] });
    },
  });
}

// Hook: Update album cover
export function useUpdateAlbumCover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAlbumCover,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['memory-albums'] });
      queryClient.invalidateQueries({ queryKey: ['memory-album', variables.album_id] });
    },
  });
}

// Hook: Delete album
export function useDeleteAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-albums'] });
    },
  });
}

// Hook: Delete photo
export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-albums'] });
    },
  });
}
