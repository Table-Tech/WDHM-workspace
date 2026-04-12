'use client';

import { useState, useRef } from 'react';
import NextImage from 'next/image';
import { FolderPlus, Camera, X, Calendar, FileText, Loader2, Save, Plus } from 'lucide-react';
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
import { useCreateAlbum, useAddPhotosToAlbum } from '@/hooks/useMemories';
import { uploadMemoryPhotos } from '@/lib/storage';

interface AddAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PhotoPreview {
  file: File;
  preview: string;
}

export function AddAlbumModal({
  isOpen,
  onClose,
  onSuccess,
}: AddAlbumModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createAlbum = useCreateAlbum();
  const addPhotos = useAddPhotosToAlbum();

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos((prev) => [
          ...prev,
          { file, preview: reader.result as string },
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEventDate('');
    setPhotos([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsUploading(true);

    try {
      // Upload photos first
      const photoUrls = await uploadMemoryPhotos(photos.map((p) => p.file));

      // Create album
      const album = await createAlbum.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        event_date: eventDate || undefined,
        cover_url: photoUrls[0] || undefined,
      });

      // Add photos to album if any
      if (photoUrls.length > 0) {
        await addPhotos.mutateAsync({
          album_id: album.id,
          photos: photoUrls.map((url) => ({ photo_url: url })),
        });
      }

      resetForm();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create album:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      resetForm();
      onClose();
    }
  };

  const isPending = createAlbum.isPending || addPhotos.isPending || isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-modal w-[95vw] max-w-md border-white/10 max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl sm:rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-pink-500/20 border border-pink-500/30">
              <FolderPlus className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <DialogTitle className="text-xl text-white">
                Nieuw Album
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Maak een album met team herinneringen
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="text-sm text-white/70 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Foto&apos;s
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotosChange}
              className="hidden"
            />

            {/* Photo Grid */}
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <NextImage
                    src={photo.preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-black/80"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-pink-500/80 text-[10px] text-white font-medium">
                      Cover
                    </div>
                  )}
                </div>
              ))}

              {/* Add more button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-white/20 hover:border-white/40 flex flex-col items-center justify-center transition-colors"
              >
                <Plus className="w-6 h-6 text-white/30" />
                <span className="text-[10px] text-white/30 mt-1">Toevoegen</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="album-title" className="text-sm text-white/70">
              Album Titel *
            </Label>
            <Input
              id="album-title"
              placeholder="Bijv. Teamuitje 2024"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/5 border-white/10 focus:border-white/30 h-10"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="album-desc" className="text-sm text-white/70 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Beschrijving (optioneel)
            </Label>
            <Textarea
              id="album-desc"
              placeholder="Waar gaat dit album over?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="bg-white/5 border-white/10 focus:border-white/30 resize-none"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="album-date" className="text-sm text-white/70 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Datum (optioneel)
            </Label>
            <Input
              id="album-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="bg-white/5 border-white/10 focus:border-white/30 h-10"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-white/10 hover:bg-white/5 h-10"
              disabled={isPending}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isPending}
              className="flex-1 bg-pink-600 hover:bg-pink-500 border-0 gap-2 h-10"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isUploading ? 'Uploaden...' : 'Opslaan...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Opslaan
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
