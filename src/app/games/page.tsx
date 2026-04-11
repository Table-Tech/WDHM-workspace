'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Disc3, Coins, Users } from 'lucide-react';

type GameTab = 'wheel' | 'coin' | 'teams';

const TABS: { value: GameTab; label: string; icon: React.ReactNode }[] = [
  { value: 'wheel', label: 'Draaiwiel', icon: <Disc3 className="w-4 h-4" /> },
  { value: 'coin', label: 'Muntworp', icon: <Coins className="w-4 h-4" /> },
  { value: 'teams', label: 'Team Maker', icon: <Users className="w-4 h-4" /> },
];

export default function GamesPage() {
  const [activeTab, setActiveTab] = useState<GameTab>('wheel');

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
          <div className="p-2 rounded-xl bg-pink-500/20 border border-pink-500/30">
            <Disc3 className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Games</h1>
            <p className="text-sm text-white/50">Fun beslissingen maken</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
              ${activeTab === tab.value
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Game Content - placeholders for now */}
      <div className="glass-card rounded-2xl p-6">
        {activeTab === 'wheel' && (
          <div className="text-center text-white/50">Spin Wheel component komt hier</div>
        )}
        {activeTab === 'coin' && (
          <div className="text-center text-white/50">Coin Flip component komt hier</div>
        )}
        {activeTab === 'teams' && (
          <div className="text-center text-white/50">Team Maker component komt hier</div>
        )}
      </div>
    </main>
  );
}
