'use client';

import { getProgressColor, getProgressGlow } from '@/lib/milestones';

interface ProgressBarProps {
  percentage: number;
  remaining: number;
  nextMilestoneEmoji?: string;
  nextMilestonePenalty?: string;
  className?: string;
}

export function ProgressBar({
  percentage,
  remaining,
  nextMilestoneEmoji,
  nextMilestonePenalty,
  className = '',
}: ProgressBarProps) {
  const colorClass = getProgressColor(percentage);
  const glowClass = getProgressGlow(percentage);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Progress bar container */}
      <div
        className="h-2.5 bg-white/5 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Voortgang naar volgende milestone: ${Math.round(percentage)}%`}
      >
        {/* Progress fill */}
        <div
          className={`
            h-full rounded-full bg-gradient-to-r ${colorClass}
            transition-all duration-600 ease-out
            ${percentage >= 80 ? `shadow-lg ${glowClass}` : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Label */}
      {nextMilestoneEmoji && nextMilestonePenalty && remaining > 0 && (
        <p className="text-xs text-muted-foreground">
          <span className="text-white/70">Nog {remaining}x</span>
          <span className="mx-1.5 text-white/30">→</span>
          <span className="inline-flex items-center gap-1">
            <span>{nextMilestoneEmoji}</span>
            <span className="text-white/50 truncate max-w-[180px]">
              {nextMilestonePenalty}
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
