'use client';

import { useEffect, useState } from 'react';
import { PartyPopper, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MilestoneReachedEvent } from '@/types';

interface MilestoneBannerProps {
  event: MilestoneReachedEvent | null;
  onDismiss: () => void;
  onViewGallery: () => void;
  duration?: number;
}

// Pre-defined confetti positions to avoid Math.random during render
const CONFETTI_COLORS = ['#fbbf24', '#f97316', '#ef4444', '#a855f7', '#6366f1'];
const CONFETTI_PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  left: ((i * 17 + 7) % 100),
  top: ((i * 23 + 11) % 100),
  colorIndex: i % 5,
  delay: (i * 0.17) % 2,
  duration: 2 + (i * 0.13) % 2,
}));

export function MilestoneBanner({
  event,
  onDismiss,
  onViewGallery,
  duration = 8000,
}: MilestoneBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [lastEventId, setLastEventId] = useState<string | null>(null);

  // Track event changes using render-time state sync
  const currentEventId = event ? `${event.friend.id}-${event.milestone.count}` : null;
  if (currentEventId && currentEventId !== lastEventId) {
    setLastEventId(currentEventId);
    setIsVisible(true);
    setIsLeaving(false);
  }

  // Auto-dismiss timer
  useEffect(() => {
    if (!isVisible || !event) return;

    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => {
        setIsVisible(false);
        onDismiss();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [isVisible, event, duration, onDismiss]);

  const handleViewGallery = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onViewGallery();
    }, 200);
  };

  if (!isVisible || !event) return null;

  // Check if there are incidents with media
  const hasMedia = event.incidents.some((i) => i.photo_url || i.video_url);

  return (
    <div
      className={`
        fixed inset-x-0 top-0 z-50 p-4
        ${isLeaving ? 'animate-slide-out-top' : 'animate-slide-in-top'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-2xl mx-auto">
        <div
          className="
            relative overflow-hidden
            glass-strong rounded-2xl p-6
            border border-yellow-500/30
            bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10
          "
        >
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/10 to-yellow-500/5 animate-gradient" />

          {/* Confetti particles (decorative) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {CONFETTI_PARTICLES.map((particle, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-float"
                style={{
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  backgroundColor: CONFETTI_COLORS[particle.colorIndex],
                  animationDelay: `${particle.delay}s`,
                  animationDuration: `${particle.duration}s`,
                  opacity: 0.6,
                }}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative flex flex-col items-center text-center gap-3">
            {/* Header */}
            <div className="flex items-center gap-2 text-yellow-400">
              <PartyPopper className="w-6 h-6" aria-hidden="true" />
              <span className="text-sm font-semibold uppercase tracking-wider">
                Milestone Bereikt!
              </span>
              <PartyPopper className="w-6 h-6 scale-x-[-1]" aria-hidden="true" />
            </div>

            {/* Friend name and count */}
            <h2 className="text-2xl font-bold text-white">
              {event.friend.name} is {event.milestone.count}x te laat!
            </h2>

            {/* Penalty */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-3xl">{event.milestone.emoji}</span>
              <p className="text-white/90 text-lg">
                {event.milestone.penalty}
              </p>
            </div>

            {/* View Gallery Button */}
            {hasMedia && (
              <Button
                onClick={handleViewGallery}
                className="mt-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 border-0"
              >
                <Image className="w-4 h-4 mr-2" aria-hidden="true" />
                Bekijk alle bewijzen ({event.incidents.filter((i) => i.photo_url || i.video_url).length})
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
