'use client';

import { useEffect, useState, createElement } from 'react';
import NextImage from 'next/image';
import { Award, Star, Heart, Crown, Flame, Zap, Trophy, Medal, Gem, Rocket, Target, Shield, Baby, Ghost, Camera, Repeat, Sparkles, AlarmClockOff, X, type LucideIcon } from 'lucide-react';
import { getRarityColor, getRarityLabel } from '@/hooks/useBadges';
import type { FriendBadge } from '@/types';

// Map of icon names to components
const iconMap: Record<string, LucideIcon> = {
  award: Award,
  star: Star,
  heart: Heart,
  crown: Crown,
  flame: Flame,
  zap: Zap,
  trophy: Trophy,
  medal: Medal,
  gem: Gem,
  rocket: Rocket,
  target: Target,
  shield: Shield,
  baby: Baby,
  ghost: Ghost,
  camera: Camera,
  repeat: Repeat,
  sparkles: Sparkles,
  sparkle: Sparkles,
  'alarm-clock-off': AlarmClockOff,
};

function getIconComponent(iconName: string): LucideIcon {
  return iconMap[iconName.toLowerCase()] || Award;
}

function renderBadgeIcon(iconName: string, className: string) {
  const IconComponent = getIconComponent(iconName);
  return createElement(IconComponent, { className });
}

interface BadgeNotificationProps {
  badges: FriendBadge[];
  friendName?: string;
  onDismiss: () => void;
}

export function BadgeNotification({ badges, friendName, onDismiss }: BadgeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (badges.length > 0) {
      setIsVisible(true);
      setCurrentIndex(0);
    }
  }, [badges]);

  // Auto-dismiss after showing all badges
  useEffect(() => {
    if (!isVisible || badges.length === 0) return;

    const timer = setTimeout(() => {
      if (currentIndex < badges.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        handleDismiss();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isVisible, currentIndex, badges.length]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Wait for animation
  };

  if (badges.length === 0 || !isVisible) return null;

  const currentBadge = badges[currentIndex];
  const badge = currentBadge.badge;

  if (!badge) return null;

  const rarityClass = getRarityColor(badge.rarity);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 pointer-events-auto ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleDismiss}
      />

      {/* Badge Card */}
      <div
        className={`relative glass-modal p-6 rounded-2xl border border-white/20 shadow-2xl max-w-sm mx-4 pointer-events-auto transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-white/70" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          {/* New Badge! Text */}
          <div className="mb-4">
            <span className="text-sm font-medium text-yellow-400 uppercase tracking-wider animate-pulse">
              Nieuwe Badge!
            </span>
          </div>

          {/* Badge Icon */}
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 border-2 ${rarityClass} animate-bounce`}
            style={{ animationDuration: '1s' }}
          >
            {badge.image_url ? (
              <div className="relative w-20 h-20 rounded-full overflow-hidden">
                <NextImage
                  src={badge.image_url}
                  alt={badge.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              renderBadgeIcon(badge.icon, 'w-12 h-12')
            )}
          </div>

          {/* Badge Name */}
          <h3 className="text-2xl font-bold text-white mb-1">{badge.name}</h3>

          {/* Friend name if provided */}
          {friendName && (
            <p className="text-sm text-white/70 mb-2">
              Verdiend door <span className="font-medium text-white">{friendName}</span>
            </p>
          )}

          {/* Description */}
          <p className="text-white/60 text-sm mb-3">{badge.description}</p>

          {/* Rarity */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${rarityClass}`}>
            <Sparkles className="w-4 h-4" />
            {getRarityLabel(badge.rarity)}
          </span>

          {/* Progress indicator for multiple badges */}
          {badges.length > 1 && (
            <div className="mt-4 flex gap-1.5">
              {badges.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
