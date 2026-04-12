'use client';

import NextImage from 'next/image';
import { Image as ImageIcon, Calendar, Images } from 'lucide-react';
import type { MemoryAlbumWithPhotos } from '@/types';

interface AlbumCardProps {
  album: MemoryAlbumWithPhotos;
  onClick: () => void;
}

export function AlbumCard({ album, onClick }: AlbumCardProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const coverUrl = album.cover_url || album.photos[0]?.photo_url;

  return (
    <button
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-pink-500/50 transition-all text-left bg-slate-900 hover:bg-slate-800/80"
    >
      {/* Cover Image */}
      <div className="relative aspect-[4/3] bg-slate-800">
        {coverUrl ? (
          <>
            <NextImage
              src={coverUrl}
              alt={album.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-slate-600" />
          </div>
        )}

        {/* Photo count badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-xs text-white">
          <Images className="w-3 h-3" />
          {album.photo_count}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-white truncate group-hover:text-pink-300 transition-colors">
          {album.title}
        </h3>
        {album.description && (
          <p className="text-sm text-white/50 line-clamp-2 mt-1">
            {album.description}
          </p>
        )}
        {album.event_date && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-white/40">
            <Calendar className="w-3 h-3" />
            {formatDate(album.event_date)}
          </div>
        )}
      </div>
    </button>
  );
}
