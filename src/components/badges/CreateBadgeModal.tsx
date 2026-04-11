'use client';

import { useState, useRef } from 'react';
import NextImage from 'next/image';
import { Award, Camera, X, Sparkles, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateBadge } from '@/hooks/useBadges';
import type { BadgeRarity } from '@/types';

interface CreateBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RARITY_OPTIONS: { value: BadgeRarity; label: string; color: string }[] = [
  { value: 'common', label: 'Gewoon', color: 'bg-gray-500/20 border-gray-500/50 text-gray-400' },
  { value: 'rare', label: 'Zeldzaam', color: 'bg-blue-500/20 border-blue-500/50 text-blue-400' },
  { value: 'epic', label: 'Episch', color: 'bg-purple-500/20 border-purple-500/50 text-purple-400' },
  { value: 'legendary', label: 'Legendarisch', color: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' },
];

const ICON_OPTIONS = [
  'award', 'star', 'heart', 'crown', 'flame', 'zap',
  'trophy', 'medal', 'gem', 'rocket', 'target', 'shield',
];

export function CreateBadgeModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateBadgeModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('award');
  const [rarity, setRarity] = useState<BadgeRarity>('common');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createBadge = useCreateBadge();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setIcon('award');
    setRarity('common');
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    try {
      await createBadge.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        icon,
        image,
        rarity,
      });
      resetForm();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create badge:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-modal w-[95vw] max-w-md border-white/10 max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl sm:rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <DialogTitle className="text-xl text-white">
                Custom Badge Maken
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Maak een unieke badge voor de groep
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm text-white/70 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Badge Afbeelding (optioneel)
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-white/20">
                <NextImage
                  src={imagePreview}
                  alt="Badge preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-0 right-0 p-1 rounded-full bg-black/50 hover:bg-black/70"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 mx-auto rounded-full border-2 border-dashed border-white/20 hover:border-white/40 flex items-center justify-center transition-colors"
              >
                <Camera className="w-8 h-8 text-white/30" />
              </button>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="badge-name" className="text-sm text-white/70">
              Naam
            </Label>
            <Input
              id="badge-name"
              placeholder="Bijv. Koffie Koning"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 border-white/10 focus:border-white/30 h-10"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="badge-desc" className="text-sm text-white/70">
              Beschrijving
            </Label>
            <Textarea
              id="badge-desc"
              placeholder="Waarom krijgt iemand deze badge?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="bg-white/5 border-white/10 focus:border-white/30 resize-none"
            />
          </div>

          {/* Icon Selection (only if no image) */}
          {!imagePreview && (
            <div className="space-y-2">
              <Label className="text-sm text-white/70">Icon</Label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((iconOption) => (
                  <button
                    key={iconOption}
                    type="button"
                    onClick={() => setIcon(iconOption)}
                    className={`
                      w-10 h-10 rounded-lg flex items-center justify-center transition-all
                      ${icon === iconOption
                        ? 'bg-white/20 border-2 border-white/50'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }
                    `}
                  >
                    <Award className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rarity Selection */}
          <div className="space-y-2">
            <Label className="text-sm text-white/70 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Zeldzaamheid
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {RARITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRarity(option.value)}
                  className={`
                    px-3 py-2 rounded-lg border transition-all text-sm font-medium
                    ${rarity === option.value
                      ? option.color + ' ring-2 ring-white/30'
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-white/10 hover:bg-white/5 h-10"
              disabled={createBadge.isPending}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !description.trim() || createBadge.isPending}
              className="flex-1 bg-purple-600 hover:bg-purple-500 border-0 gap-2 h-10"
            >
              {createBadge.isPending ? (
                'Maken...'
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Maken
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
