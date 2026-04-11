'use client';

import { useState } from 'react';
import { BadgeCard } from './BadgeCard';
import { BadgeModal } from './BadgeModal';
import type { Badge, FriendBadge } from '@/types';

interface BadgeGridProps {
  badges: Badge[];
  earnedBadges?: FriendBadge[];
  filter?: 'all' | 'earned' | 'unearned';
}

export function BadgeGrid({
  badges,
  earnedBadges = [],
  filter = 'all',
}: BadgeGridProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Create a map for quick lookup
  const earnedMap = new Map(earnedBadges.map((eb) => [eb.badge_id, eb]));

  // Filter badges based on filter prop
  const filteredBadges = badges.filter((badge) => {
    const isEarned = earnedMap.has(badge.id);
    if (filter === 'earned') return isEarned;
    if (filter === 'unearned') return !isEarned;
    return true;
  });

  // Sort: earned first, then by rarity
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    const aEarned = earnedMap.has(a.id) ? 0 : 1;
    const bEarned = earnedMap.has(b.id) ? 0 : 1;
    if (aEarned !== bEarned) return aEarned - bEarned;
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
        {sortedBadges.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            earned={earnedMap.get(badge.id)}
            onClick={() => setSelectedBadge(badge)}
          />
        ))}
      </div>

      {sortedBadges.length === 0 && (
        <div className="text-center py-12 text-white/50">
          {filter === 'earned' && 'Nog geen badges verdiend'}
          {filter === 'unearned' && 'Alle badges zijn verdiend!'}
          {filter === 'all' && 'Geen badges beschikbaar'}
        </div>
      )}

      <BadgeModal
        badge={selectedBadge}
        earned={selectedBadge ? earnedMap.get(selectedBadge.id) : undefined}
        isOpen={!!selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </>
  );
}
