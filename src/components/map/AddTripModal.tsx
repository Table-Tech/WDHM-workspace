'use client';

import { useState, useRef } from 'react';
import NextImage from 'next/image';
import { MapPin, Camera, X, Calendar, FileText, Crosshair, Loader2, Save } from 'lucide-react';
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
import { useAddTeamTrip } from '@/hooks/useLocations';
import { useCurrentLocation } from '@/hooks/useLocation';

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddTripModal({
  isOpen,
  onClose,
  onSuccess,
}: AddTripModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addTrip = useAddTeamTrip();
  const { getCurrentLocation, isLoading: isGettingLocation, error: locationError } = useCurrentLocation();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGetLocation = async () => {
    const coords = await getCurrentLocation();
    if (coords) {
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setAddress('');
    setTripDate('');
    setLatitude(null);
    setLongitude(null);
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || latitude === null || longitude === null) return;

    try {
      await addTrip.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        latitude,
        longitude,
        address: address.trim(),
        photo,
        trip_date: tripDate,
      });
      resetForm();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to add trip:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const hasLocation = latitude !== null && longitude !== null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-modal w-[95vw] max-w-md border-white/10 max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl sm:rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl text-white">
                Team Uitje Toevoegen
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Pin een locatie waar jullie zijn geweest
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="text-sm text-white/70 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Foto (optioneel)
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            {photoPreview ? (
              <div className="relative h-32 rounded-xl overflow-hidden">
                <NextImage
                  src={photoPreview}
                  alt="Trip preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 flex items-center justify-center transition-colors"
              >
                <Camera className="w-8 h-8 text-white/30" />
              </button>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="trip-name" className="text-sm text-white/70">
              Naam van het uitje
            </Label>
            <Input
              id="trip-name"
              placeholder="Bijv. Teamborrel Amsterdam"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 border-white/10 focus:border-white/30 h-10"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="trip-desc" className="text-sm text-white/70 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Beschrijving (optioneel)
            </Label>
            <Textarea
              id="trip-desc"
              placeholder="Wat hebben jullie gedaan?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="bg-white/5 border-white/10 focus:border-white/30 resize-none"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-sm text-white/70 flex items-center gap-2">
              <Crosshair className="w-4 h-4" />
              Locatie
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Adres (optioneel)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-white/5 border-white/10 focus:border-white/30 h-10 flex-1"
              />
              <Button
                type="button"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className={`h-10 px-3 border-0 transition-all ${
                  hasLocation
                    ? 'bg-green-600 hover:bg-green-500'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                title="Huidige locatie"
              >
                {isGettingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Crosshair className="w-4 h-4" />
                )}
              </Button>
            </div>
            {hasLocation && (
              <p className="text-xs text-green-400 flex items-center gap-1">
                <Crosshair className="w-3 h-3" />
                GPS locatie vastgelegd
              </p>
            )}
            {locationError && (
              <p className="text-xs text-red-400">{locationError}</p>
            )}
            {!hasLocation && !locationError && (
              <p className="text-xs text-white/50">
                Klik op de knop om je huidige locatie te gebruiken
              </p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="trip-date" className="text-sm text-white/70 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Datum (optioneel)
            </Label>
            <Input
              id="trip-date"
              type="date"
              value={tripDate}
              onChange={(e) => setTripDate(e.target.value)}
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
              disabled={addTrip.isPending}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !hasLocation || addTrip.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-500 border-0 gap-2 h-10"
            >
              {addTrip.isPending ? (
                'Opslaan...'
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
