'use client';

import { Flame } from 'lucide-react';
import type { Streak } from '@/types';
import { getStreakDisplay } from '@/hooks/useStreaks';

interface StreakBadgeProps {
  streak?: Streak;
  count?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StreakBadge({
  streak,
  count,
  showLabel = false,
  size = 'sm',
  className = '',
}: StreakBadgeProps) {
  const displayCount = count ?? streak?.current_count ?? 0;

  // Don't show if streak is less than 3
  if (displayCount < 3) return null;

  const display = getStreakDisplay(streak || { current_count: displayCount } as Streak);

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-0.5',
    md: 'text-sm px-2 py-1 gap-1',
    lg: 'text-base px-3 py-1.5 gap-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`
        inline-flex items-center rounded-full font-semibold
        bg-orange-500/20 border border-orange-500/30
        ${display.color}
        ${sizeClasses[size]}
        ${className}
      `}
      title={`${displayCount}x achter elkaar te laat${display.label ? ` - ${display.label}` : ''}`}
    >
      {display.emoji ? (
        <span>{display.emoji}</span>
      ) : (
        <Flame className={`${iconSizes[size]} text-orange-500`} />
      )}
      <span>{displayCount}</span>
      {showLabel && display.label && (
        <span className="text-white/70 font-normal ml-1">{display.label}</span>
      )}
    </div>
  );
}
