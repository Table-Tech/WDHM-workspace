'use client';

import { useState } from 'react';
import { Trophy, Crown, Medal, ChevronDown, ClipboardList } from 'lucide-react';
import { FriendAvatar } from '@/components/friends/FriendAvatar';
import { MilestoneIcon } from '@/components/shared/MilestoneIcon';
import { DEFAULT_MILESTONES } from '@/lib/milestones';
import type { FriendWithStats, Milestone } from '@/types';

interface LeaderboardProps {
  friends: FriendWithStats[];
  milestones?: Milestone[];
}

function getRankIcon(rank: number, isMobile: boolean = false) {
  const size = isMobile ? 'w-4 h-4' : 'w-5 h-5';
  switch (rank) {
    case 1:
      return <Crown className={`${size} text-yellow-400`} aria-hidden="true" />;
    case 2:
      return <Medal className={`${size} text-gray-400`} aria-hidden="true" />;
    case 3:
      return <Medal className={`${size} text-amber-600`} aria-hidden="true" />;
    default:
      return <span className="w-4 sm:w-5 text-center text-muted-foreground text-sm">{rank}</span>;
  }
}

function getRankStyle(rank: number) {
  switch (rank) {
    case 1:
      return 'bg-yellow-500/20 border-yellow-500/40';
    case 2:
      return 'bg-zinc-900/80 border-white/20';
    case 3:
      return 'bg-amber-600/20 border-amber-600/40';
    default:
      return 'bg-zinc-900/80 border-white/15';
  }
}

export function Leaderboard({ friends, milestones = DEFAULT_MILESTONES }: LeaderboardProps) {
  const [showMilestones, setShowMilestones] = useState(false);

  // Sort friends by incident count (descending)
  const sortedFriends = [...friends].sort((a, b) => b.incident_count - a.incident_count);

  // Use provided milestones or defaults
  const displayMilestones = milestones.length > 0 ? milestones : DEFAULT_MILESTONES;

  return (
    <aside
      className="bg-black/50 backdrop-blur-xl border border-white/15 shadow-xl rounded-xl sm:rounded-2xl p-3 sm:p-5 h-fit lg:sticky lg:top-24"
      aria-labelledby="leaderboard-heading"
    >
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" aria-hidden="true" />
        </div>
        <h2 id="leaderboard-heading" className="text-base sm:text-lg font-bold text-white">
          Leaderboard
        </h2>
      </div>

      {/* Rankings - Horizontal scroll on mobile for many friends */}
      <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-8" role="list" aria-label="Ranglijst">
        {sortedFriends.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nog geen vrienden toegevoegd
          </p>
        ) : (
          sortedFriends.map((friend, index) => {
            const rank = index + 1;
            return (
              <div
                key={friend.id}
                className={`
                  flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl border
                  transition-all duration-200 hover:bg-white/[0.04]
                  ${getRankStyle(rank)}
                `}
                role="listitem"
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-5 sm:w-6 flex justify-center">
                  {getRankIcon(rank)}
                </div>

                {/* Avatar - smaller on mobile */}
                <div className="flex-shrink-0">
                  <FriendAvatar name={friend.name} color={friend.color} size="sm" />
                </div>

                {/* Name */}
                <span className="flex-1 font-medium text-white truncate text-sm sm:text-base">
                  {friend.name}
                </span>

                {/* Count */}
                <span
                  className={`
                    font-bold tabular-nums text-sm sm:text-base
                    ${rank === 1 ? 'text-yellow-400' : 'text-muted-foreground'}
                  `}
                >
                  {friend.incident_count}x
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Milestones Reference - Collapsible on mobile */}
      <div>
        <button
          onClick={() => setShowMilestones(!showMilestones)}
          className="w-full flex items-center justify-between text-sm font-semibold text-white/70 mb-2 sm:mb-3 p-2 sm:p-0 rounded-lg sm:rounded-none hover:bg-white/5 sm:hover:bg-transparent transition-colors lg:pointer-events-none"
        >
          <span className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 theme-text-light" aria-hidden="true" />
            Milestones & Straffen
          </span>
          <ChevronDown className={`w-4 h-4 lg:hidden transition-transform ${showMilestones ? 'rotate-180' : ''}`} />
        </button>

        {/* Always show on desktop (lg+), toggle on mobile */}
        <div className={`space-y-1.5 sm:space-y-2 ${showMilestones ? 'block' : 'hidden lg:block'}`} role="list" aria-label="Milestone overzicht">
          {displayMilestones.map((milestone) => (
            <div
              key={milestone.count}
              className="flex items-start gap-2 text-xs text-muted-foreground p-1.5 sm:p-0 rounded-lg sm:rounded-none bg-white/[0.02] sm:bg-transparent"
              role="listitem"
            >
              <span className="flex-shrink-0 w-7 sm:w-8 text-white/50 font-medium">
                {milestone.count}x
              </span>
              <MilestoneIcon icon={milestone.emoji} size="sm" className="flex-shrink-0 theme-text-light" />
              <span className="line-clamp-2">{milestone.penalty}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
