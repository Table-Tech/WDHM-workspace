'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Award, ArrowLeft, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BadgeGrid, CreateBadgeModal } from '@/components/badges';
import { useAllBadges, useAllFriendBadges } from '@/hooks/useBadges';

type FilterType = 'all' | 'earned' | 'unearned';

export default function BadgesPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: badges = [], isLoading: badgesLoading } = useAllBadges();
  const { data: friendBadges = [], isLoading: friendBadgesLoading } = useAllFriendBadges();

  const isLoading = badgesLoading || friendBadgesLoading;

  // Stats
  const totalBadges = badges.length;
  const earnedCount = new Set(friendBadges.map((fb) => fb.badge_id)).size;
  const unearnedCount = totalBadges - earnedCount;

  const filterOptions: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'Alle', count: totalBadges },
    { value: 'earned', label: 'Verdiend', count: earnedCount },
    { value: 'unearned', label: 'Te verdienen', count: unearnedCount },
  ];

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Badges</h1>
              <p className="text-sm text-white/50">
                {earnedCount} van {totalBadges} verdiend
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-500 border-0 gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nieuwe Badge</span>
        </Button>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-white/50 shrink-0" />
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
              ${filter === option.value
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
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
