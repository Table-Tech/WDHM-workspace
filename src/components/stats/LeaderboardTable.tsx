'use client';

import { FriendAvatar } from '@/components/friends/FriendAvatar';
import { Trophy, Medal, Award } from 'lucide-react';
import type { LeaderboardEntry, LeaderboardType } from '@/types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  type: LeaderboardType;
  isLoading?: boolean;
}

export function LeaderboardTable({
  entries,
  type,
  isLoading = false,
}: LeaderboardTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-16 bg-white/5 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-white/50">
        Geen data beschikbaar
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center text-white/50">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 2:
        return 'bg-gray-500/10 border-gray-500/30';
      case 3:
        return 'bg-amber-500/10 border-amber-500/30';
      default:
        return 'bg-white/5 border-white/10';
    }
  };

  const formatValue = (value: number, type: LeaderboardType) => {
    switch (type) {
      case 'avg_minutes':
        return `${value} min`;
      case 'current_streak':
      case 'best_streak':
        return `${value}x`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.friend.id}
          className={`
            flex items-center gap-3 p-3 rounded-xl border transition-all
            ${getRankStyle(entry.rank)}
          `}
        >
          {/* Rank */}
          <div className="w-8 flex justify-center">
            {getRankIcon(entry.rank)}
          </div>

          {/* Avatar & Name */}
          <FriendAvatar
            name={entry.friend.name}
            color={entry.friend.color}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">{entry.friend.name}</p>
          </div>

          {/* Value */}
          <div className="text-right">
            <span className={`
              font-bold text-lg
              ${entry.rank === 1 ? 'text-yellow-400' : ''}
              ${entry.rank === 2 ? 'text-gray-300' : ''}
              ${entry.rank === 3 ? 'text-amber-500' : ''}
              ${entry.rank > 3 ? 'text-white/70' : ''}
            `}>
              {formatValue(entry.value, type)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
