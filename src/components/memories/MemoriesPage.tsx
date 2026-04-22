'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, Plus, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlbumCard } from './AlbumCard';
import { AlbumViewer } from './AlbumViewer';
import { AddAlbumModal } from './AddAlbumModal';
import { useMemoryAlbums } from '@/hooks/useMemories';
import type { MemoryAlbumWithPhotos } from '@/types';

export function MemoriesPage() {
  const { data: albums = [], isLoading } = useMemoryAlbums();
  const [selectedAlbum, setSelectedAlbum] = useState<MemoryAlbumWithPhotos | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Back button and title */}
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  Herinneringen
                </h1>
                <p className="text-xs text-muted-foreground">
                  {albums.length} album{albums.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Add album button */}
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-pink-600 hover:bg-pink-500 border-0 gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nieuw Album</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-pink-500 border-t-transparent mx-auto mb-4" />
              <p className="text-muted-foreground">Laden...</p>
            </div>
          </div>
        ) : albums.length === 0 ? (
          <EmptyState onAddClick={() => setIsAddModalOpen(true)} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onClick={() => setSelectedAlbum(album)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Album Viewer Modal */}
      {selectedAlbum && (
        <AlbumViewer
          album={selectedAlbum}
          isOpen={true}
          onClose={() => setSelectedAlbum(null)}
        />
      )}

      {/* Add Album Modal */}
      <AddAlbumModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}

function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="p-6 rounded-full bg-black/40 backdrop-blur-md border border-pink-500/30 mb-6">
        <ImageIcon className="w-12 h-12 text-pink-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">
        Nog geen herinneringen
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Maak je eerste album om mooie team momenten te bewaren!
        Voeg foto&apos;s toe van uitjes, feestjes, of gewoon leuke momenten op kantoor.
      </p>
      <Button
        onClick={onAddClick}
        className="bg-pink-600 hover:bg-pink-500 border-0 gap-2"
      >
        <Plus className="w-5 h-5" />
        Eerste Album Maken
      </Button>
    </div>
  );
}
