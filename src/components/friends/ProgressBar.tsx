'use client';

import { getProgressColor, getProgressGlow } from '@/lib/milestones';
import { MilestoneIcon } from '@/components/shared/MilestoneIcon';

interface ProgressBarProps {
  percentage: number;
  remaining: number;
  nextMilestoneCount?: number;
  nextMilestoneEmoji?: string;
  nextMilestonePenalty?: string;
  className?: string;
}

export function ProgressBar({
  percentage,
  remaining,
  nextMilestoneCount,
  nextMilestoneEmoji,
  nextMilestonePenalty,
  className = '',
}: ProgressBarProps) {
  const colorClass = getProgressColor(percentage);
  const glowClass = getProgressGlow(percentage);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Progress bar container */}
      <progress
        className={`h-2.5 w-full overflow-hidden rounded-full appearance-none bg-white/5 [&::-webkit-progress-bar]:bg-white/5 [&::-webkit-progress-value]:bg-linear-to-r [&::-webkit-progress-value]:${colorClass} [&::-moz-progress-bar]:bg-emerald-500 ${percentage >= 80 ? `shadow-lg ${glowClass}` : ''}`}
        max={100}
        value={percentage}
        aria-label={`Voortgang naar volgende milestone: ${Math.round(percentage)}%`}
      />

      {/* Label */}
      {nextMilestoneEmoji && nextMilestoneCount && remaining > 0 && (
        <p className="text-xs text-muted-foreground">
          <span className="text-white/70">Nog {remaining}x</span>
          <span className="mx-1.5 text-white/30">→</span>
          <span className="inline-flex items-center gap-1">
            <MilestoneIcon icon={nextMilestoneEmoji} size="sm" className="theme-text-light" />
            <span className="text-white/50">
              {nextMilestonePenalty ? nextMilestonePenalty : `${nextMilestoneCount}x milestone`}
            </span>
          </span>
        </p>
      )}

      {/* Milestone reached indicator */}
      {remaining === 0 && (
        <p className="text-xs text-emerald-400 font-medium">
          Alle milestones bereikt!
        </p>
      )}
    </div>
  );
}
