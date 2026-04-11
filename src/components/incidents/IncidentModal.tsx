'use client';

import { useState, useRef } from 'react';
import { MapPin, Clock, Camera, FileText, X, Timer, Send, Video, Image } from 'lucide-react';
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
import type { Friend, IncidentFormData } from '@/types';

interface IncidentModalProps {
  friend: Friend | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IncidentFormData) => Promise<void>;
  isSubmitting?: boolean;
}

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
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      setMediaType(type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setLocation('');
    setScheduledTime('');
    setMinutesLate('');
    setNote('');
    setMedia(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friend) return;

    await onSubmit({
      friend_id: friend.id,
      location,
      scheduled_time: scheduledTime,
      minutes_late: minutesLate,
      note,
      media,
      mediaType,
    });

    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!friend) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-strong w-[95vw] max-w-md border-white/10 max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl sm:rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <FriendAvatar name={friend.name} color={friend.color} size="sm" className="sm:hidden flex-shrink-0" />
            <FriendAvatar name={friend.name} color={friend.color} size="md" className="hidden sm:flex flex-shrink-0" />
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
        <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs sm:text-sm text-orange-300/90">
          <p>
            📍 Voeg bewijs toe: waar hadden jullie afgesproken? Maak een foto van de plek!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mt-2">
          {/* Media Upload - Photo or Video */}
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm text-white/70 flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              Bewijs (foto of video)
              <span className="text-white/40 text-xs">(van de plek/situatie)</span>
            </Label>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleMediaChange(e, 'photo')}
              className="hidden"
              aria-label="Foto uploaden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              capture="environment"
              onChange={(e) => handleMediaChange(e, 'video')}
              className="hidden"
              aria-label="Video uploaden"
            />

            {mediaPreview ? (
              <div className="relative rounded-lg sm:rounded-xl overflow-hidden bg-white/5 border border-white/10">
                {mediaType === 'video' ? (
                  <video
                    src={mediaPreview}
                    className="w-full h-32 sm:h-40 object-cover"
                    controls
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full h-32 sm:h-40 object-cover"
                  />
                )}
                <div className="absolute top-2 left-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-black/50 text-xs text-white flex items-center gap-1">
                  {mediaType === 'video' ? (
                    <><Video className="w-3 h-3" /> Video</>
                  ) : (
                    <><Image className="w-3 h-3" aria-hidden="true" /> Foto</>
                  )}
                </div>
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 p-1 sm:p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  aria-label="Media verwijderen"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-20 sm:h-24 rounded-lg sm:rounded-xl border-2 border-dashed border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/5 active:bg-orange-500/10 transition-all flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-orange-400/70"
                >
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                  <span className="text-xs">Foto maken</span>
                </button>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="h-20 sm:h-24 rounded-lg sm:rounded-xl border-2 border-dashed border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/5 active:bg-violet-500/10 transition-all flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-violet-400/70"
                >
                  <Video className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                  <span className="text-xs">Video opnemen</span>
                </button>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="location" className="text-xs sm:text-sm text-white/70 flex items-center gap-1.5 sm:gap-2">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              Waar hadden jullie afgesproken?
            </Label>
            <Input
              id="location"
              placeholder="Bijv. McDonalds Centrum, Station..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-white/5 border-white/10 focus:border-violet-500/50 placeholder:text-white/30 h-9 sm:h-10 text-sm"
            />
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
                className="bg-white/5 border-white/10 focus:border-violet-500/50 h-9 sm:h-10 text-sm"
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
                className="bg-white/5 border-white/10 focus:border-violet-500/50 placeholder:text-white/30 h-9 sm:h-10 text-sm"
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
              className="bg-white/5 border-white/10 focus:border-violet-500/50 placeholder:text-white/30 resize-none text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-white/10 hover:bg-white/5 h-10 sm:h-11 text-sm"
              disabled={isSubmitting}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 border-0 gap-1.5 sm:gap-2 h-10 sm:h-11 text-sm"
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
