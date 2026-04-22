'use client';

import { createElement } from 'react';
import NextImage from 'next/image';
import { Award, Star, Heart, Crown, Flame, Zap, Trophy, Medal, Gem, Rocket, Target, Shield, Baby, Ghost, Camera, Repeat, Sparkles, AlarmClockOff, Check, Lock, Trash2, type LucideIcon } from 'lucide-react';
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

interface BadgeEarner {
  id: string;
  name: string;
  color: string;
}

interface BadgeModalProps {
  badge: Badge | null;
  earned?: FriendBadge;
  earners?: BadgeEarner[];
  isOpen: boolean;
  onClose: () => void;
  onRevokeBadge?: (friendId: string, badgeId: string) => void;
}

export function BadgeModal({
  badge,
  earned,
  earners = [],
  isOpen,
  onClose,
  onRevokeBadge,
}: BadgeModalProps) {
  if (!badge) return null;

  const isEarned = !!earned || earners.length > 0;
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
      <DialogContent className="bg-black/90 backdrop-blur-xl w-[95vw] max-w-sm border border-white/15 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex flex-col items-center text-center">
            {/* Badge Icon/Image */}
            <div
              className={`
                w-24 h-24 rounded-full flex items-center justify-center mb-4 border-2
                ${rarityClass}
                ${!isEarned ? 'opacity-70' : ''}
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
                renderBadgeIcon(badge.icon, 'w-12 h-12')
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
            <div className="p-3 rounded-xl bg-black/60 backdrop-blur-xl border border-white/15">
              <p className="text-sm text-white/70 flex items-center gap-2">
                <Target className="w-4 h-4 text-white/50" />
                <span>Voorwaarde:</span>
              </p>
              <p className="text-white mt-1">
                {getBadgeConditionDescription(badge.condition_type, badge.condition_value)}
              </p>
            </div>
          )}

          {/* Earners Section */}
          {earners.length > 0 && (
            <div className="p-3 rounded-xl bg-black/60 backdrop-blur-xl border border-green-500/40">
              <p className="text-sm text-green-400 flex items-center gap-2 mb-2">
                <Check className="w-4 h-4" />
                Verdiend door {earners.length} {earners.length === 1 ? 'persoon' : 'personen'}
              </p>
              <div className="flex flex-wrap gap-2">
                {earners.map((earner) => (
                  <span
                    key={earner.id}
                    className="text-sm px-2 py-1 rounded-full bg-black/50 border border-white/20 flex items-center gap-1.5"
                    style={{ color: earner.color }}
                  >
                    {earner.name}
                    {onRevokeBadge && badge && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Badge "${badge.name}" verwijderen van ${earner.name}?`)) {
                            onRevokeBadge(earner.id, badge.id);
                          }
                        }}
                        className="p-0.5 rounded hover:bg-red-500/30 transition-colors text-red-400/60 hover:text-red-400"
                        title={`Badge verwijderen van ${earner.name}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Not Earned */}
          {earners.length === 0 && (
            <div className="p-3 rounded-xl bg-black/60 backdrop-blur-xl border border-white/15">
              <p className="text-sm text-white/50 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Nog niet verdiend door iemand
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
