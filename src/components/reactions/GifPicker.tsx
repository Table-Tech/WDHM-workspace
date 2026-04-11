'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import { X } from 'lucide-react';
import { PRESET_GIFS, GIF_CATEGORIES, type PresetGif } from '@/lib/gifs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface GifPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (gif: PresetGif) => void;
}

type Category = PresetGif['category'];

export function GifPicker({ isOpen, onClose, onSelect }: GifPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('laugh');

  const categories = Object.entries(GIF_CATEGORIES) as [Category, { label: string; emoji: string }][];
  const categoryGifs = PRESET_GIFS.filter((gif) => gif.category === selectedCategory);

  const handleSelectGif = (gif: PresetGif) => {
    onSelect(gif);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[min(800px,calc(100vw-1rem))] sm:w-[95vw] max-w-3xl border border-white/10 bg-slate-950 max-h-[85dvh] overflow-hidden p-0 rounded-xl sm:rounded-2xl shadow-2xl shadow-black/80 text-left [direction:ltr]"
        showCloseButton={false}
      >
        <div className="flex h-full max-h-[85dvh] flex-col">
          {/* Header */}
          <DialogHeader className="sticky top-0 z-10 p-4 sm:p-6 border-b border-white/10 bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="text-xl sm:text-2xl">🎬</div>
                <div className="min-w-0">
                  <DialogTitle className="text-lg sm:text-xl text-white">GIF kiezen</DialogTitle>
                </div>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={onClose}
                aria-label="GIF picker sluiten"
                className="h-8 w-8 hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Category Tabs */}
          <div className="sticky top-16 z-9 px-4 sm:px-6 pt-3 sm:pt-4 pb-2 sm:pb-3 border-b border-white/10 bg-slate-950">
            <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2">
              {categories.map(([category, { label, emoji }]) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  aria-label={`${label} GIFs`}
                >
                  <span className="mr-1.5">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* GIF Grid */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 bg-slate-950">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {categoryGifs.map((gif) => (
                <button
                  key={gif.id}
                  type="button"
                  onClick={() => handleSelectGif(gif)}
                  className="relative group rounded-lg overflow-hidden aspect-square bg-slate-800 hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
                  title={gif.alt}
                  aria-label={`Selecteer ${gif.alt} GIF`}
                >
                  <NextImage
                    src={gif.url}
                    alt={gif.alt}
                    fill
                    unoptimized
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
                </button>
              ))}
            </div>

            {categoryGifs.length === 0 && (
              <div className="flex items-center justify-center h-32">
                <p className="text-slate-400">Geen GIFs beschikbaar voor deze categorie</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
