'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarChart3, ArrowLeft, Calendar, Trophy, Users, Flame, Target } from 'lucide-react';
import { LeaderboardTable } from '@/components/stats/LeaderboardTable';
import { FunStats } from '@/components/stats/FunStats';
import { StatCard } from '@/components/stats/StatCard';
import { useLeaderboard, useGroupStats } from '@/hooks/useStats';
import type { LeaderboardType, LeaderboardPeriod } from '@/types';

const LEADERBOARD_TYPES: { value: LeaderboardType; label: string; icon: React.ReactNode }[] = [
  { value: 'most_late', label: 'Meest Te Laat', icon: <Trophy className="w-4 h-4" /> },
  { value: 'least_late', label: 'Minst Te Laat', icon: <Users className="w-4 h-4" /> },
  { value: 'avg_minutes', label: 'Gem. Minuten', icon: <Target className="w-4 h-4" /> },
  { value: 'current_streak', label: 'Streak', icon: <Flame className="w-4 h-4" /> },
];

const PERIODS: { value: LeaderboardPeriod; label: string }[] = [
  { value: 'all_time', label: 'Altijd' },
  { value: 'month', label: 'Maand' },
  { value: 'week', label: 'Week' },
];

export default function StatsPage() {
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('most_late');
  const [period, setPeriod] = useState<LeaderboardPeriod>('all_time');

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useLeaderboard(leaderboardType, period);
  const { data: groupStats, isLoading: statsLoading } = useGroupStats();

  return (
    <main className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Link
          href="/"
          className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 sm:p-2 rounded-xl bg-blue-500/20 border border-blue-500/30 shrink-0">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Statistieken</h1>
            <p className="text-xs sm:text-sm text-white/50 truncate">Ranglijsten & fun facts</p>
          </div>
        </div>
      </header>

      {/* Group Stats Overview */}
      <section className="mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white/50" />
          Groep Overzicht
        </h2>
        {statsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : groupStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Totaal Te Laat"
              value={groupStats.total_incidents}
              icon="alert-circle"
              color="orange"
            />
            <StatCard
              label="Totaal Minuten"
              value={`${groupStats.total_minutes_late} min`}
              icon="clock"
              color="purple"
            />
            <StatCard
              label="Populairste Dag"
              value={groupStats.most_common_day}
              icon="calendar"
              color="blue"
            />
            <StatCard
              label="Met Bewijs"
              value={`${groupStats.total_with_evidence}x`}
              icon="camera"
              color="green"
            />
          </div>
        )}
      </section>

      {/* Leaderboard Section */}
      <section className="mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
          Ranglijsten
        </h2>

        {/* Leaderboard Type Tabs */}
        <div className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {LEADERBOARD_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setLeaderboardType(type.value)}
              className={`
                flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all border backdrop-blur-md
                ${leaderboardType === type.value
                  ? 'bg-blue-600/80 border-blue-400 text-white'
                  : 'bg-black/40 border-white/20 text-white hover:bg-black/50 hover:border-white/30'
                }
              `}
            >
              {type.icon}
              <span className="hidden xs:inline sm:inline">{type.label}</span>
            </button>
          ))}
        </div>

        {/* Period Filter */}
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-white/50" />
          <div className="flex gap-1 bg-black/40 backdrop-blur-md border border-white/20 rounded-lg p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`
                  px-3 py-1 rounded-md text-sm transition-all
                  ${period === p.value
                    ? 'bg-blue-600/80 text-white'
                    : 'text-white/70 hover:bg-black/40 hover:text-white'
                  }
                `}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-black/50 backdrop-blur-xl border border-white/15 rounded-xl p-3 sm:p-4 shadow-xl">
          <LeaderboardTable
            entries={leaderboard}
            type={leaderboardType}
            isLoading={leaderboardLoading}
          />
        </div>
      </section>

      {/* Fun Stats Section */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="text-xl">🎉</span>
          Fun Facts
        </h2>
        <FunStats />
      </section>
    </main>
  );
}
