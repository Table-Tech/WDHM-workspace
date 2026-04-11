'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  MapPin,
  Clock,
  Timer,
  FileText,
  Calendar,
  Image,
  Video,
  Info,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FriendAvatar } from '@/components/friends/FriendAvatar';
import { useIncidentsByFriend } from '@/hooks/useIncidents';
import type { Friend, Incident } from '@/types';

interface FriendGalleryProps {
  friend: Friend | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FriendGallery({ friend, isOpen, onClose }: FriendGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [lastOpenState, setLastOpenState] = useState(false);

  const { data: incidents = [] } = useIncidentsByFriend(friend?.id || null);

  // Filter incidents with media
  const mediaIncidents = incidents.filter((i) => i.photo_url || i.video_url);
  const currentIncident = mediaIncidents[currentIndex];

  // Reset on open (using render-time state sync instead of effect)
  if (isOpen && !lastOpenState) {
    setLastOpenState(true);
    setCurrentIndex(0);
    setIsPlaying(false);
    setShowDetails(false);
  } else if (!isOpen && lastOpenState) {
    setLastOpenState(false);
  }

  // Navigation callbacks - defined before useEffects that use them
  const goToPrevious = useCallback(() => {
    if (mediaIncidents.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + mediaIncidents.length) % mediaIncidents.length);
  }, [mediaIncidents.length]);

  const goToNext = useCallback(() => {
    if (mediaIncidents.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % mediaIncidents.length);
  }, [mediaIncidents.length]);

  // Auto-play slideshow
  useEffect(() => {
    if (!isPlaying || mediaIncidents.length <= 1 || !isOpen) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaIncidents.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPlaying, mediaIncidents.length, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, goToPrevious, goToNext]);

  if (!isOpen || !friend) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`Gallerij van ${friend.name} incidenten`}
    >
      {/* Header */}
      <header className="flex-shrink-0 p-3 sm:p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <FriendAvatar name={friend.name} color={friend.color} size="sm" className="sm:hidden" />
          <FriendAvatar name={friend.name} color={friend.color} size="md" className="hidden sm:flex" />
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-white truncate">
              Bewijzen van {friend.name}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {mediaIncidents.length} foto&apos;s &amp; video&apos;s
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {mediaIncidents.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPlaying((p) => !p)}
              className="hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
              aria-label={isPlaying ? 'Pauzeer diavoorstelling' : 'Start diavoorstelling'}
            >
              {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
            </Button>
          )}
          {/* Mobile details toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDetails(!showDetails)}
            className="hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10 lg:hidden"
            aria-label="Toon details"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10"
            aria-label="Sluiten"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      {mediaIncidents.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="p-4 rounded-full bg-white/5 w-fit mx-auto mb-4">
              <Image className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" aria-hidden="true" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Geen media gevonden</h3>
            <p className="text-sm text-muted-foreground px-4">
              Er zijn nog geen foto&apos;s of video&apos;s bij de incidenten van {friend.name} toegevoegd.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* Media Display */}
          <div className="flex-1 relative flex items-center justify-center p-2 sm:p-4">
            {/* Navigation buttons */}
            {mediaIncidents.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-1 sm:left-4 z-10 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  aria-label="Vorige"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-1 sm:right-4 z-10 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                  aria-label="Volgende"
                >
                  <ChevronRight className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                </button>
              </>
            )}

            {/* Media content */}
            <div className="relative w-full max-w-4xl flex items-center justify-center">
              {currentIncident?.video_url ? (
                <video
                  key={currentIncident.id}
                  src={currentIncident.video_url}
                  className="max-h-[50vh] sm:max-h-[60vh] lg:max-h-[70vh] w-auto rounded-xl"
                  controls
                  autoPlay
                  muted
                  playsInline
                />
              ) : currentIncident?.photo_url ? (
                <img
                  key={currentIncident.id}
                  src={currentIncident.photo_url}
                  alt={`Incident bij ${currentIncident.location || 'onbekende locatie'}`}
                  className="max-h-[50vh] sm:max-h-[60vh] lg:max-h-[70vh] w-auto rounded-xl object-contain"
                />
              ) : null}

              {/* Media type badge */}
              {currentIncident && (
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-black/60 text-xs sm:text-sm text-white flex items-center gap-1 sm:gap-2">
                  {currentIncident.video_url ? (
                    <><Video className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Video</span></>
                  ) : (
                    <><Image className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" /> <span className="hidden sm:inline">Foto</span></>
                  )}
                </div>
              )}

              {/* Counter badge - mobile */}
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-1 rounded-full bg-black/60 text-xs sm:text-sm text-white lg:hidden">
                {currentIndex + 1} / {mediaIncidents.length}
              </div>
            </div>

            {/* Mobile thumbnail strip */}
            {mediaIncidents.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 lg:hidden px-4">
                {mediaIncidents.slice(0, 8).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex ? 'bg-violet-500 w-4' : 'bg-white/30'
                    }`}
                    aria-label={`Ga naar ${index + 1}`}
                  />
                ))}
                {mediaIncidents.length > 8 && (
                  <span className="text-xs text-white/50">+{mediaIncidents.length - 8}</span>
                )}
              </div>
            )}
          </div>

          {/* Mobile Details Panel (slides up) */}
          {showDetails && currentIncident && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/95 border-t border-white/10 p-4 lg:hidden animate-slide-in-bottom max-h-[60vh] overflow-y-auto">
              <button
                onClick={() => setShowDetails(false)}
                className="absolute top-2 right-2 p-2 hover:bg-white/10 rounded-full"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <MobileIncidentDetails incident={currentIncident} formatDate={formatDate} />
            </div>
          )}

          {/* Desktop Info Panel */}
          <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0 border-l border-white/10 p-4 xl:p-6 overflow-y-auto">
            <div className="space-y-4 xl:space-y-6">
              {/* Incident counter */}
              <div className="text-center p-3 xl:p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/30">
                <span className="text-2xl xl:text-3xl font-bold text-white">
                  {currentIndex + 1} / {mediaIncidents.length}
                </span>
                <p className="text-xs xl:text-sm text-muted-foreground mt-1">Incidenten met bewijs</p>
              </div>

              {/* Incident Details */}
              {currentIncident && (
                <IncidentDetails incident={currentIncident} formatDate={formatDate} />
              )}

              {/* Thumbnail navigation */}
              {mediaIncidents.length > 1 && (
                <div>
                  <h3 className="text-xs xl:text-sm font-semibold text-white/70 uppercase tracking-wider mb-2 xl:mb-3">
                    Alle Bewijzen
                  </h3>
                  <div className="grid grid-cols-3 gap-1.5 xl:gap-2">
                    {mediaIncidents.map((incident, index) => (
                      <button
                        key={incident.id}
                        onClick={() => setCurrentIndex(index)}
                        className={`
                          relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                          ${
                            index === currentIndex
                              ? 'border-violet-500 ring-2 ring-violet-500/30'
                              : 'border-white/10 hover:border-white/30'
                          }
                        `}
                      >
                        {incident.video_url ? (
                          <div className="w-full h-full bg-white/5 flex items-center justify-center">
                            <Video className="w-4 h-4 xl:w-6 xl:h-6 text-muted-foreground" />
                          </div>
                        ) : (
                          <img
                            src={incident.photo_url!}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute bottom-0.5 right-0.5 text-[8px] xl:text-[10px] bg-black/60 px-1 xl:px-1.5 py-0.5 rounded">
                          {index + 1}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Progress bar */}
      {mediaIncidents.length > 1 && isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-10">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-100"
            style={{ width: `${((currentIndex + 1) / mediaIncidents.length) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Desktop incident details component
function IncidentDetails({ incident, formatDate }: { incident: Incident; formatDate: (d: string) => string }) {
  return (
    <div className="space-y-3 xl:space-y-4">
      <h3 className="text-xs xl:text-sm font-semibold text-white/70 uppercase tracking-wider">
        Incident Details
      </h3>

      <div className="flex items-start gap-2 xl:gap-3 p-2 xl:p-3 rounded-xl bg-white/5">
        <Calendar className="w-4 h-4 xl:w-5 xl:h-5 text-violet-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] xl:text-xs text-muted-foreground">Datum</p>
          <p className="text-sm xl:text-base text-white">{formatDate(incident.created_at)}</p>
        </div>
      </div>

      {incident.location && (
        <div className="flex items-start gap-2 xl:gap-3 p-2 xl:p-3 rounded-xl bg-white/5">
          <MapPin className="w-4 h-4 xl:w-5 xl:h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] xl:text-xs text-muted-foreground">Locatie</p>
            <p className="text-sm xl:text-base text-white">{incident.location}</p>
          </div>
        </div>
      )}

      {incident.scheduled_time && (
        <div className="flex items-start gap-2 xl:gap-3 p-2 xl:p-3 rounded-xl bg-white/5">
          <Clock className="w-4 h-4 xl:w-5 xl:h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] xl:text-xs text-muted-foreground">Afgesproken</p>
            <p className="text-sm xl:text-base text-white">{incident.scheduled_time}</p>
          </div>
        </div>
      )}

      {incident.minutes_late && (
        <div className="flex items-start gap-2 xl:gap-3 p-2 xl:p-3 rounded-xl bg-white/5">
          <Timer className="w-4 h-4 xl:w-5 xl:h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] xl:text-xs text-muted-foreground">Te laat</p>
            <p className="text-sm xl:text-lg text-white font-bold">{incident.minutes_late} min</p>
          </div>
        </div>
      )}

      {incident.note && (
        <div className="flex items-start gap-2 xl:gap-3 p-2 xl:p-3 rounded-xl bg-white/5">
          <FileText className="w-4 h-4 xl:w-5 xl:h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] xl:text-xs text-muted-foreground">Excuus</p>
            <p className="text-sm xl:text-base text-white italic">&ldquo;{incident.note}&rdquo;</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Mobile-optimized incident details
function MobileIncidentDetails({ incident, formatDate }: { incident: Incident; formatDate: (d: string) => string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
        <Calendar className="w-4 h-4 text-violet-400" />
        <div>
          <p className="text-[10px] text-muted-foreground">Datum</p>
          <p className="text-xs text-white">{formatDate(incident.created_at)}</p>
        </div>
      </div>

      {incident.location && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
          <MapPin className="w-4 h-4 text-orange-400" />
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">Locatie</p>
            <p className="text-xs text-white truncate">{incident.location}</p>
          </div>
        </div>
      )}

      {incident.scheduled_time && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
          <Clock className="w-4 h-4 text-blue-400" />
          <div>
            <p className="text-[10px] text-muted-foreground">Afgesproken</p>
            <p className="text-xs text-white">{incident.scheduled_time}</p>
          </div>
        </div>
      )}

      {incident.minutes_late && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
          <Timer className="w-4 h-4 text-red-400" />
          <div>
            <p className="text-[10px] text-muted-foreground">Te laat</p>
            <p className="text-xs text-white font-bold">{incident.minutes_late} min</p>
          </div>
        </div>
      )}

      {incident.note && (
        <div className="col-span-2 flex items-start gap-2 p-2 rounded-lg bg-white/5">
          <FileText className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">Excuus</p>
            <p className="text-xs text-white italic truncate">&ldquo;{incident.note}&rdquo;</p>
          </div>
        </div>
      )}
    </div>
  );
}
