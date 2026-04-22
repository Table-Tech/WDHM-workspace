'use client';

import { useState, useRef } from 'react';
import NextImage from 'next/image';
import { MapPin, Clock, Camera, FileText, X, Timer, Send, Video, Image as ImageIcon, Crosshair, Loader2, Plus } from 'lucide-react';
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
import { FriendAvatar } from '@/components/friends/FriendAvatar';
import { useCurrentLocation } from '@/hooks/useLocation';
import type { Friend, IncidentFormData, MediaItem } from '@/types';

interface IncidentModalProps {
  friend: Friend | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IncidentFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const MAX_MEDIA_ITEMS = 5;

export function IncidentModal({
  friend,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: IncidentModalProps) {
  const [location, setLocation] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [minutesLate, setMinutesLate] = useState('');
  const [note, setNote] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { getCurrentLocation, isLoading: isGettingLocation, error: locationError } = useCurrentLocation();

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_MEDIA_ITEMS - mediaItems.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaItems((prev) => {
          if (prev.length >= MAX_MEDIA_ITEMS) return prev;
          return [...prev, {
            file,
            type,
            preview: reader.result as string,
          }];
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const removeMediaItem = (index: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setLocation('');
    setScheduledTime('');
    setMinutesLate('');
    setNote('');
    setMediaItems([]);
    setGpsCoords(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleGetCurrentLocation = async () => {
    const result = await getCurrentLocation();
    if (result) {
      setGpsCoords({ latitude: result.latitude, longitude: result.longitude });
      // Auto-fill the location field with the address
      if (result.address && !location) {
        setLocation(result.address);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friend) return;

    // For backward compatibility, use first media item as primary
    const primaryMedia = mediaItems[0] || null;

    await onSubmit({
      friend_id: friend.id,
      location,
      scheduled_time: scheduledTime,
      minutes_late: minutesLate,
      note,
      media: primaryMedia?.file ?? null,
      mediaType: primaryMedia?.type ?? null,
      mediaItems,
      latitude: gpsCoords?.latitude ?? null,
      longitude: gpsCoords?.longitude ?? null,
    });

    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const canAddMore = mediaItems.length < MAX_MEDIA_ITEMS;

  if (!friend) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-black/80 backdrop-blur-xl w-[95vw] max-w-md border border-white/15 max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <FriendAvatar name={friend.name} color={friend.color} size="sm" className="sm:hidden shrink-0" />
            <FriendAvatar name={friend.name} color={friend.color} size="md" className="hidden sm:flex shrink-0" />
            <div className="min-w-0">
              <DialogTitle className="text-lg sm:text-xl text-white truncate">
                {friend.name} is te laat!
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs sm:text-sm">
                Registreer dit incident met optionele details
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Quick info banner */}
        <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-black/40 backdrop-blur-md border border-orange-500/30 text-xs sm:text-sm text-orange-300/90">
          <p className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            Voeg bewijs toe: waar hadden jullie afgesproken? Maak een foto van de plek!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mt-2">
          {/* Media Upload - Multiple Photos or Videos */}
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm text-white/70 flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              Bewijs (foto&apos;s of video&apos;s)
              <span className="text-white/40 text-xs">({mediaItems.length}/{MAX_MEDIA_ITEMS})</span>
            </Label>

            {/* Hidden file inputs with multiple support */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleMediaChange(e, 'photo')}
              className="hidden"
              aria-label="Foto&apos;s uploaden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              multiple
              onChange={(e) => handleMediaChange(e, 'video')}
              className="hidden"
              aria-label="Video&apos;s uploaden"
            />

            {/* Media Grid */}
            {mediaItems.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {mediaItems.map((item, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-black/40 border border-white/15">
                    {item.type === 'video' ? (
                      <video
                        src={item.preview}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                    ) : (
                      <NextImage
                        src={item.preview}
                        alt={`Media ${index + 1}`}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    )}
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white flex items-center gap-0.5">
                      {item.type === 'video' ? (
                        <Video className="w-2.5 h-2.5" />
                      ) : (
                        <ImageIcon className="w-2.5 h-2.5" aria-hidden="true" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMediaItem(index)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-red-600/80 transition-colors"
                      aria-label={`Media ${index + 1} verwijderen`}
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}

                {/* Add more button (inside grid) */}
                {canAddMore && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 aspect-square rounded-lg border-2 border-dashed border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all flex flex-col items-center justify-center text-orange-400/70"
                      title="Foto toevoegen"
                    >
                      <Plus className="w-4 h-4" />
                      <Camera className="w-3 h-3 mt-0.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="flex-1 aspect-square rounded-lg border-2 border-dashed theme-border-light hover:bg-white/5 transition-all flex flex-col items-center justify-center theme-text"
                      title="Video toevoegen"
                    >
                      <Plus className="w-4 h-4" />
                      <Video className="w-3 h-3 mt-0.5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Initial upload buttons (when no media selected) */}
            {mediaItems.length === 0 && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-20 sm:h-24 rounded-lg sm:rounded-xl border-2 border-dashed border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/5 active:bg-orange-500/10 transition-all flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-orange-400/70"
                >
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                  <span className="text-xs">Foto&apos;s maken</span>
                </button>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="h-20 sm:h-24 rounded-lg sm:rounded-xl border-2 border-dashed theme-border-light hover:bg-white/5 active:bg-white/10 transition-all flex flex-col items-center justify-center gap-1.5 sm:gap-2 theme-text"
                >
                  <Video className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                  <span className="text-xs">Video&apos;s opnemen</span>
                </button>
              </div>
            )}
          </div>

          {/* Location with GPS */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="location" className="text-xs sm:text-sm text-white/70 flex items-center gap-1.5 sm:gap-2">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              Locatie
            </Label>

            {/* GPS Button - Prominent */}
            <Button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
              className={`w-full h-11 sm:h-12 border-0 transition-all gap-2 ${
                gpsCoords
                  ? 'bg-green-600 hover:bg-green-500'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'
              }`}
            >
              {isGettingLocation ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Locatie ophalen...</span>
                </>
              ) : gpsCoords ? (
                <>
                  <Crosshair className="w-5 h-5" />
                  <span>✓ Locatie vastgelegd</span>
                </>
              ) : (
                <>
                  <Crosshair className="w-5 h-5" />
                  <span>📍 Pak Huidige Locatie</span>
                </>
              )}
            </Button>

            {/* Address input - auto-filled or manual */}
            <Input
              id="location"
              placeholder="Adres wordt automatisch ingevuld..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`bg-black/40 border-white/20 focus:border-white/40 placeholder:text-white/30 h-9 sm:h-10 text-sm backdrop-blur-md ${
                gpsCoords && location ? 'border-green-500/40' : ''
              }`}
            />

            {gpsCoords && (
              <p className="text-xs text-green-400 flex items-center gap-1">
                <Crosshair className="w-3 h-3" />
                GPS coördinaten opgeslagen voor de kaart
              </p>
            )}
            {locationError && (
              <p className="text-xs text-red-400">{locationError}</p>
            )}
          </div>

          {/* Two columns for time and minutes */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* Scheduled Time */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="scheduled-time" className="text-xs sm:text-sm text-white/70 flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Afgesproken tijd</span>
                <span className="sm:hidden">Tijd</span>
              </Label>
              <Input
                id="scheduled-time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="bg-black/40 border-white/20 focus:border-white/40 h-9 sm:h-10 text-sm backdrop-blur-md"
              />
            </div>

            {/* Minutes Late */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="minutes-late" className="text-xs sm:text-sm text-white/70 flex items-center gap-1.5 sm:gap-2">
                <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Minuten te laat</span>
                <span className="sm:hidden">Min. laat</span>
              </Label>
              <Input
                id="minutes-late"
                type="number"
                min="1"
                placeholder="15"
                value={minutesLate}
                onChange={(e) => setMinutesLate(e.target.value)}
                className="bg-black/40 border-white/20 focus:border-white/40 placeholder:text-white/30 h-9 sm:h-10 text-sm backdrop-blur-md"
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="note" className="text-xs sm:text-sm text-white/70 flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              Notitie / Excuus
              <span className="text-white/40 text-xs">(wat was het excuus?)</span>
            </Label>
            <Textarea
              id="note"
              placeholder="Bijv. 'De bus gemist' of 'Moest nog douchen'..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="bg-black/40 border-white/20 focus:border-white/40 placeholder:text-white/30 resize-none text-sm backdrop-blur-md"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-white/20 hover:bg-white/10 h-10 sm:h-11 text-sm"
              disabled={isSubmitting}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-linear-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 border-0 gap-1.5 sm:gap-2 h-10 sm:h-11 text-sm"
            >
              {isSubmitting ? (
                'Verzenden...'
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Registreren
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
