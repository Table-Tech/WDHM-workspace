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
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Statistieken</h1>
            <p className="text-sm text-white/50">Ranglijsten & fun facts</p>
          </div>
        </div>
      </header>

      {/* Group Stats Overview */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-white/50" />
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
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Ranglijsten
        </h2>

        {/* Leaderboard Type Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {LEADERBOARD_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setLeaderboardType(type.value)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                ${leaderboardType === type.value
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                }
              `}
            >
              {type.icon}
              {type.label}
            </button>
          ))}
        </div>

        {/* Period Filter */}
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-white/50" />
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`
                  px-3 py-1 rounded-md text-sm transition-all
                  ${period === p.value
                    ? 'bg-white/20 text-white'
                    : 'text-white/50 hover:text-white/70'
                  }
                `}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="glass-card rounded-xl p-4">
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
