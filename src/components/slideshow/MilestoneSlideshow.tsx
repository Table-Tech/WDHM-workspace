'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Play, Pause, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Incident, Friend, Milestone } from '@/types';

interface MilestoneSlideshowProps {
  friend: Friend;
  milestone: Milestone;
  incidents: Incident[];
  isOpen: boolean;
  onClose: () => void;
}

export function MilestoneSlideshow({
  friend,
  milestone,
  incidents,
  isOpen,
  onClose,
}: MilestoneSlideshowProps) {
  // Filter incidents with photos only
  const photoIncidents = incidents.filter((inc) => inc.photo_url);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION = 5000; // 5 seconds per slide

  // Declare handlers before useEffect that uses them
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photoIncidents.length);
    setProgress(0);
  }, [photoIncidents.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photoIncidents.length) % photoIncidents.length);
    setProgress(0);
  }, [photoIncidents.length]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose, handleNext, handlePrevious]);

  // Auto-advance slides
  useEffect(() => {
    if (!isPlaying || !isOpen || photoIncidents.length === 0) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + (100 / SLIDE_DURATION) * 50; // Update every 50ms
      });
    }, 50);

    const slideInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photoIncidents.length);
      setProgress(0);
    }, SLIDE_DURATION);

    return () => {
      clearInterval(progressInterval);
      clearInterval(slideInterval);
    };
  }, [isPlaying, isOpen, photoIncidents.length]);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  if (!isOpen || photoIncidents.length === 0) {
    return null;
  }

  const currentIncident = photoIncidents[currentIndex];
  const incidentDate = currentIncident.created_at
    ? new Date(currentIncident.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown date';

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Background Image with Ken Burns Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          key={currentIncident.id}
          className="h-full w-full bg-cover bg-center animate-ken-burns"
          style={{
            backgroundImage: `url(${currentIncident.photo_url})`,
          }}
        >
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/40" />
        </div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Top Bar - Progress Indicators */}
        <div className="flex gap-1 p-4">
          {photoIncidents.map((_, idx) => (
            <div
              key={idx}
              className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"
            >
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-2">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {friend.name} - {milestone.emoji} Milestone
            </h2>
            <p className="text-sm text-white/80">
              {milestone.count} incidents • {milestone.penalty}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Main Content - Centered */}
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="max-w-2xl text-center">
            <div className="space-y-4 text-white">
              {currentIncident.location && (
                <div className="text-3xl font-semibold">
                  {currentIncident.location}
                </div>
              )}
              <div className="flex items-center justify-center gap-6 text-lg">
                <span>{incidentDate}</span>
                {currentIncident.minutes_late !== null && (
                  <span className="rounded-lg bg-white/20 px-4 py-2 font-semibold">
                    {currentIncident.minutes_late} min late
                  </span>
                )}
              </div>
              {currentIncident.note && (
                <p className="mt-4 text-base text-white/90">
                  {currentIncident.note}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-center gap-4 pb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleTogglePlay}
            className="text-white hover:bg-white/20"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="text-white hover:bg-white/20"
          >
            <SkipForward className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleMute}
            className="text-white hover:bg-white/20"
          >
            {isMuted ? (
              <VolumeX className="h-6 w-6" />
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Slide Counter */}
        <div className="pb-4 text-center text-sm text-white/60">
          {currentIndex + 1} / {photoIncidents.length}
        </div>
      </div>

      {/* Ken Burns Animation Styles */}
      <style jsx>{`
        @keyframes ken-burns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          100% {
            transform: scale(1.1) translate(-2%, -2%);
          }
        }

        .animate-ken-burns {
          animation: ken-burns ${SLIDE_DURATION}ms ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
}
