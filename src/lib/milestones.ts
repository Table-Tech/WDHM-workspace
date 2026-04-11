import type { Milestone, GroupSetting } from '@/types';

// Default milestones used when database is not available
// emoji field now stores icon names (e.g., 'beer', 'pizza') instead of actual emojis
export const DEFAULT_MILESTONES: Milestone[] = [
  { count: 5, emoji: 'beer', penalty: 'Jij betaalt de volgende ronde drankjes voor de hele groep' },
  { count: 10, emoji: 'pizza', penalty: 'Jij trakteert de groep op pizza of eten naar keuze van de groep' },
  { count: 15, emoji: 'mic', penalty: 'Jij zingt een solo bij de volgende karaoke-avond, geen excuses' },
  { count: 20, emoji: 'shirt', penalty: 'Je draagt een week lang een schaamshirt dat de groep kiest en ontwerpt' },
  { count: 25, emoji: 'plane', penalty: 'Jij organiseert en regelt volledig een weekendje weg voor de hele groep' },
];

export function convertToMilestones(settings: GroupSetting[]): Milestone[] {
  return settings
    .map((s) => ({
      count: s.milestone_count,
      emoji: s.emoji,
      penalty: s.penalty_text,
    }))
    .sort((a, b) => a.count - b.count);
}

export function calculateMilestoneProgress(
  incidentCount: number,
  milestones: Milestone[]
): {
  current: Milestone | null;
  next: Milestone | null;
  progress: number;
  remaining: number;
} {
  const sortedMilestones = [...milestones].sort((a, b) => a.count - b.count);

  let current: Milestone | null = null;
  let next: Milestone | null = null;

  for (const milestone of sortedMilestones) {
    if (incidentCount >= milestone.count) {
      current = milestone;
    } else {
      next = milestone;
      break;
    }
  }

  // Calculate progress to next milestone
  const previousCount = current?.count ?? 0;
  const nextCount = next?.count ?? (current?.count ?? 0) + 5;
  const range = nextCount - previousCount;
  const progress = range > 0 ? Math.min(((incidentCount - previousCount) / range) * 100, 100) : 100;
  const remaining = Math.max(nextCount - incidentCount, 0);

  return {
    current,
    next,
    progress,
    remaining,
  };
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 80) return 'from-red-500 to-red-400';
  if (percentage >= 50) return 'from-orange-500 to-amber-400';
  return 'from-emerald-500 to-green-400';
}

export function getProgressGlow(percentage: number): string {
  if (percentage >= 80) return 'shadow-red-500/50';
  if (percentage >= 50) return 'shadow-orange-500/50';
  return 'shadow-emerald-500/50';
}

export function shouldShowMilestoneBanner(
  previousCount: number,
  newCount: number,
  milestones: Milestone[]
): Milestone | null {
  for (const milestone of milestones) {
    if (previousCount < milestone.count && newCount >= milestone.count) {
      return milestone;
    }
  }
  return null;
}
