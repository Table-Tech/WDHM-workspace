'use client';

import { createElement } from 'react';
import NextImage from 'next/image';
import { Award, Star, Heart, Crown, Flame, Zap, Trophy, Medal, Gem, Rocket, Target, Shield, Baby, Ghost, Camera, Repeat, Sparkles, AlarmClockOff, Check, Lock, type LucideIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getRarityColor, getRarityLabel } from '@/hooks/useBadges';
import { getBadgeConditionDescription } from '@/lib/badges';
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

interface BadgeModalProps {
  badge: Badge | null;
  earned?: FriendBadge;
  isOpen: boolean;
  onClose: () => void;
}

export function BadgeModal({
  badge,
  earned,
  isOpen,
  onClose,
}: BadgeModalProps) {
  if (!badge) return null;

  const isEarned = !!earned;
  const rarityClass = getRarityColor(badge.rarity);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-modal w-[95vw] max-w-sm border-white/10 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
        <DialogHeader>
          <div className="flex flex-col items-center text-center">
            {/* Badge Icon/Image */}
            <div
              className={`
                w-24 h-24 rounded-full flex items-center justify-center mb-4 border-2
                ${isEarned ? rarityClass : 'bg-white/5 border-white/10 grayscale opacity-50'}
              `}
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
                renderBadgeIcon(badge.icon, `w-12 h-12 ${isEarned ? '' : 'text-white/30'}`)
              )}
            </div>

            <DialogTitle className="text-xl text-white">{badge.name}</DialogTitle>
            <DialogDescription className="text-white/70 mt-1">
              {badge.description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Rarity */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${rarityClass}`}>
            <Sparkles className="w-4 h-4" />
            {getRarityLabel(badge.rarity)}
          </div>

          {/* Condition */}
          {badge.condition_type !== 'custom' && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/70 flex items-center gap-2">
                <Target className="w-4 h-4 text-white/50" />
                <span>Voorwaarde:</span>
              </p>
              <p className="text-white mt-1">
                {getBadgeConditionDescription(badge.condition_type, badge.condition_value)}
              </p>
            </div>
          )}

          {/* Earned Info */}
          {earned && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30">
              <p className="text-sm text-green-400 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Verdiend op {formatDate(earned.earned_at)}
              </p>
            </div>
          )}

          {/* Not Earned */}
          {!isEarned && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/50 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Nog niet verdiend
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
