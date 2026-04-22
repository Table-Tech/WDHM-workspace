'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Award, ArrowLeft, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BadgeGrid, CreateBadgeModal } from '@/components/badges';
import { useAllBadges, useAllFriendBadges, useRevokeFriendBadge } from '@/hooks/useBadges';

type FilterType = 'all' | 'earned' | 'unearned' | 'custom';

export default function BadgesPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: badges = [], isLoading: badgesLoading } = useAllBadges();
  const { data: friendBadges = [], isLoading: friendBadgesLoading } = useAllFriendBadges();
  const revokeBadgeMutation = useRevokeFriendBadge();

  const isLoading = badgesLoading || friendBadgesLoading;

  // Handler for revoking a badge
  const handleRevokeBadge = async (friendId: string, badgeId: string) => {
    await revokeBadgeMutation.mutateAsync({ friendId, badgeId });
  };

  // Stats
  const totalBadges = badges.length;
  const earnedCount = new Set(friendBadges.map((fb) => fb.badge_id)).size;
  const unearnedCount = totalBadges - earnedCount;
  const customCount = badges.filter((b) => !b.is_system).length;

  const filterOptions: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'Alle', count: totalBadges },
    { value: 'earned', label: 'Verdiend', count: earnedCount },
    { value: 'unearned', label: 'Te verdienen', count: unearnedCount },
    { value: 'custom', label: 'Zelfgemaakt', count: customCount },
  ];

  return (
    <main className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/"
            className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 shrink-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Badges</h1>
              <p className="text-xs sm:text-sm text-white/50">
                {earnedCount}/{totalBadges} verdiend
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-500 border-0 gap-1.5 sm:gap-2 px-2.5 sm:px-4 h-8 sm:h-9 text-sm shrink-0"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Nieuwe Badge</span>
        </Button>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
        <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`
              px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all border backdrop-blur-xl
              ${filter === option.value
                ? 'bg-purple-600 border-purple-400 text-white'
                : 'bg-black/60 border-white/20 text-white hover:bg-black/70 hover:border-white/30'
              }
            `}
          >
            {option.label} ({option.count})
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50" />
        </div>
      )}

      {/* Badge Grid */}
      {!isLoading && (
        <BadgeGrid
          badges={badges}
          earnedBadges={friendBadges}
          filter={filter}
          onRevokeBadge={handleRevokeBadge}
        />
      )}

      {/* Create Badge Modal */}
      <CreateBadgeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </main>
  );
}
