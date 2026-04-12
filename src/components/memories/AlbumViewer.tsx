'use client';

import { useState, useEffect, useCallback } from 'react';
import NextImage from 'next/image';
import { X, ChevronLeft, ChevronRight, Calendar, Trash2, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeleteAlbum, useDeletePhoto, useAddPhotosToAlbum } from '@/hooks/useMemories';
import { uploadMemoryPhotos } from '@/lib/storage';
import type { MemoryAlbumWithPhotos } from '@/types';

interface AlbumViewerProps {
  album: MemoryAlbumWithPhotos;
  isOpen: boolean;
  onClose: () => void;
}

export function AlbumViewer({ album, isOpen, onClose }: AlbumViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const deleteAlbum = useDeleteAlbum();
  const deletePhoto = useDeletePhoto();
  const addPhotos = useAddPhotosToAlbum();

  const photos = album.photos;
  const hasPhotos = photos.length > 0;
  const currentPhoto = photos[currentIndex];

  const goNext = useCallback(() => {
    if (photos.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }
  }, [photos.length]);

  const goPrev = useCallback(() => {
    if (photos.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goNext, goPrev, onClose]);

  // Reset index when album changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [album.id]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleDeleteAlbum = async () => {
    if (!confirm(`Album "${album.title}" verwijderen? Alle foto's worden ook verwijderd.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAlbum.mutateAsync(album.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete album:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!currentPhoto) return;
    if (!confirm('Deze foto verwijderen?')) return;

    try {
      await deletePhoto.mutateAsync(currentPhoto.id);
      // Adjust index if needed
      if (currentIndex >= photos.length - 1 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  };

  const handleAddPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const photoUrls = await uploadMemoryPhotos(files);
      if (photoUrls.length > 0) {
        await addPhotos.mutateAsync({
          album_id: album.id,
          photos: photoUrls.map((url) => ({ photo_url: url })),
        });
      }
    } catch (error) {
      console.error('Failed to add photos:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white truncate">{album.title}</h2>
          {album.event_date && (
            <div className="flex items-center gap-1.5 text-sm text-white/50 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(album.event_date)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Add photos button */}
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAddPhotos}
              className="hidden"
              disabled={isUploading}
            />
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Foto&apos;s
          </label>

          {/* Delete album button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteAlbum}
            disabled={isDeleting}
            className="gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Album</span>
          </Button>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {hasPhotos ? (
          <>
            {/* Current photo */}
            <div className="relative w-full h-full max-w-5xl mx-auto p-4">
              <div className="relative w-full h-full">
                <NextImage
                  src={currentPhoto.photo_url}
                  alt={currentPhoto.caption || `Foto ${currentIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
            </div>

            {/* Navigation arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {/* Delete current photo button */}
            <button
              onClick={handleDeletePhoto}
              className="absolute bottom-4 right-4 p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 transition-colors"
              title="Foto verwijderen"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>

            {/* Caption */}
            {currentPhoto.caption && (
              <div className="absolute bottom-4 left-4 right-16 text-sm text-white/80 bg-black/50 px-3 py-2 rounded-lg">
                {currentPhoto.caption}
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-8">
            <p className="text-white/50 mb-4">Nog geen foto&apos;s in dit album</p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAddPhotos}
                className="hidden"
                disabled={isUploading}
              />
              <Button className="bg-pink-600 hover:bg-pink-500 gap-2">
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Foto&apos;s toevoegen
              </Button>
            </label>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="border-t border-white/10 p-3">
          <div className="flex gap-2 overflow-x-auto justify-center">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => setCurrentIndex(index)}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-pink-500 scale-110'
                    : 'border-transparent hover:border-white/30'
                }`}
              >
                <NextImage
                  src={photo.photo_url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
          <div className="text-center text-sm text-white/50 mt-2">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
}
