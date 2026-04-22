'use client';

import { createElement } from 'react';
import NextImage from 'next/image';
import { Award, Star, Heart, Crown, Flame, Zap, Trophy, Medal, Gem, Rocket, Target, Shield, Baby, Ghost, Camera, Repeat, Sparkles, AlarmClockOff, type LucideIcon } from 'lucide-react';
import { getRarityColor, getRarityLabel } from '@/hooks/useBadges';
import type { Badge, FriendBadge } from '@/types';

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

// Render badge icon using createElement to avoid "component created during render" warning
function renderBadgeIcon(iconName: string, className: string) {
  const IconComponent = getIconComponent(iconName);
  return createElement(IconComponent, { className });
}

interface BadgeEarner {
  id: string;
  name: string;
  color: string;
}

interface BadgeCardProps {
  badge: Badge;
  earned?: FriendBadge;
  earners?: BadgeEarner[];
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function BadgeCard({
  badge,
  earned,
  earners = [],
  onClick,
  size = 'md',
  showDetails = true,
}: BadgeCardProps) {
  const isEarned = !!earned || earners.length > 0;
  const rarityClass = getRarityColor(badge.rarity);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  // Show max 3 names, then "+X meer"
  const displayedEarners = earners.slice(0, 3);
  const remainingCount = earners.length - 3;

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center p-3 rounded-xl border transition-all
        bg-black/70 backdrop-blur-xl
        ${rarityClass}
        ${onClick ? 'hover:scale-105 hover:bg-black/80 cursor-pointer' : 'cursor-default'}
        ${!isEarned ? 'opacity-70' : ''}
      `}
    >
      <div
        className={`
          ${sizeClasses[size]} rounded-full flex items-center justify-center mb-2
          bg-black/50
        `}
      >
        {badge.image_url ? (
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <NextImage
              src={badge.image_url}
              alt={badge.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          renderBadgeIcon(badge.icon, iconSizes[size])
        )}
      </div>

      {showDetails && (
        <>
          <span className="text-sm font-medium text-center line-clamp-1">
            {badge.name}
          </span>
          <span className="text-xs text-white/50 mt-0.5">
            {getRarityLabel(badge.rarity)}
          </span>

          {/* Earners names */}
          {earners.length > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              {displayedEarners.map((earner) => (
                <span
                  key={earner.id}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/60 border border-white/20"
                  style={{ color: earner.color }}
                >
                  {earner.name}
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/60 border border-white/20 text-white/50">
                  +{remainingCount}
                </span>
              )}
            </div>
          )}

          {/* Show "Nog niet verdiend" when no earners */}
          {earners.length === 0 && (
            <span className="mt-1 text-[10px] text-white/30">
              Nog niemand
            </span>
          )}
        </>
      )}
    </button>
  );
}

// Mini badge for FriendCard display
interface MiniBadgeProps {
  badge: Badge;
  className?: string;
}

export function MiniBadge({ badge, className = '' }: MiniBadgeProps) {
  const rarityColors: Record<string, string> = {
    legendary: 'text-yellow-400',
    epic: 'text-purple-400',
    rare: 'text-blue-400',
    common: 'text-gray-400',
  };

  return (
    <div
      className={`w-6 h-6 rounded-full bg-white/10 flex items-center justify-center ${className}`}
      title={badge.name}
    >
      {badge.image_url ? (
        <div className="relative w-5 h-5 rounded-full overflow-hidden">
          <NextImage
            src={badge.image_url}
            alt={badge.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        renderBadgeIcon(badge.icon, `w-3.5 h-3.5 ${rarityColors[badge.rarity] || 'text-white/50'}`)
      )}
    </div>
  );
}
