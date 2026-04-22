'use client';

import { useState, useMemo } from 'react';
import { BadgeCard } from './BadgeCard';
import { BadgeModal } from './BadgeModal';
import type { Badge, FriendBadge } from '@/types';
import type { FriendBadgeWithFriend } from '@/hooks/useBadges';

interface BadgeEarner {
  id: string;
  name: string;
  color: string;
}

interface BadgeGridProps {
  badges: Badge[];
  earnedBadges?: FriendBadgeWithFriend[];
  filter?: 'all' | 'earned' | 'unearned' | 'custom';
  onRevokeBadge?: (friendId: string, badgeId: string) => void;
}

export function BadgeGrid({
  badges,
  earnedBadges = [],
  filter = 'all',
  onRevokeBadge,
}: BadgeGridProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Create a map of badge_id -> earners list
  const earnersMap = useMemo(() => {
    const map = new Map<string, BadgeEarner[]>();
    for (const eb of earnedBadges) {
      if (eb.friend) {
        const existing = map.get(eb.badge_id) || [];
        // Avoid duplicates
        if (!existing.some((e) => e.id === eb.friend!.id)) {
          existing.push({
            id: eb.friend.id,
            name: eb.friend.name,
            color: eb.friend.color,
          });
        }
        map.set(eb.badge_id, existing);
      }
    }
    return map;
  }, [earnedBadges]);

  // Create a map for quick lookup of earned status
  const earnedMap = new Map(earnedBadges.map((eb) => [eb.badge_id, eb as FriendBadge]));

  // Filter badges based on filter prop
  const filteredBadges = badges.filter((badge) => {
    const isEarned = earnersMap.has(badge.id) && (earnersMap.get(badge.id)?.length ?? 0) > 0;
    if (filter === 'earned') return isEarned;
    if (filter === 'unearned') return !isEarned;
    if (filter === 'custom') return !badge.is_system;
    return true;
  });

  // Sort: 1) earned first, 2) custom badges, 3) by rarity
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    // 1. Earned badges first
    const aEarned = earnersMap.has(a.id) ? 0 : 1;
    const bEarned = earnersMap.has(b.id) ? 0 : 1;
    if (aEarned !== bEarned) return aEarned - bEarned;

    // 2. Custom badges (is_system = false) before system badges
    const aCustom = a.is_system ? 1 : 0;
    const bCustom = b.is_system ? 1 : 0;
    if (aCustom !== bCustom) return aCustom - bCustom;

    // 3. Sort by rarity (legendary > epic > rare > common)
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  // Get earners for selected badge
  const selectedBadgeEarners = selectedBadge ? (earnersMap.get(selectedBadge.id) || []) : [];

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
        {sortedBadges.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            earned={earnedMap.get(badge.id)}
            earners={earnersMap.get(badge.id) || []}
            onClick={() => setSelectedBadge(badge)}
          />
        ))}
      </div>

      {sortedBadges.length === 0 && (
        <div className="text-center py-12 text-white/50">
          {filter === 'earned' && 'Nog geen badges verdiend'}
          {filter === 'unearned' && 'Alle badges zijn verdiend!'}
          {filter === 'custom' && 'Nog geen zelfgemaakte badges'}
          {filter === 'all' && 'Geen badges beschikbaar'}
        </div>
      )}

      <BadgeModal
        badge={selectedBadge}
        earned={selectedBadge ? earnedMap.get(selectedBadge.id) : undefined}
        earners={selectedBadgeEarners}
        isOpen={!!selectedBadge}
        onClose={() => setSelectedBadge(null)}
        onRevokeBadge={onRevokeBadge}
      />
    </>
  );
}
