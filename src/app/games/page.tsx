'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Disc3, Coins, Users, Dices, Target } from 'lucide-react';
import { SpinWheel } from '@/components/games/SpinWheel';
import { CoinFlip } from '@/components/games/CoinFlip';
import { TeamMaker } from '@/components/games/TeamMaker';
import { DiceRoll } from '@/components/games/DiceRoll';
import { PunishmentWheel } from '@/components/games/PunishmentWheel';

type GameTab = 'wheel' | 'coin' | 'teams' | 'dice' | 'punishment';

const TABS: { value: GameTab; label: string; icon: React.ReactNode }[] = [
  { value: 'wheel', label: 'Draaiwiel', icon: <Disc3 className="w-4 h-4" /> },
  { value: 'punishment', label: 'Straf Wiel', icon: <Target className="w-4 h-4" /> },
  { value: 'dice', label: 'Dobbelen', icon: <Dices className="w-4 h-4" /> },
  { value: 'coin', label: 'Muntworp', icon: <Coins className="w-4 h-4" /> },
  { value: 'teams', label: 'Teams', icon: <Users className="w-4 h-4" /> },
];

export default function GamesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<GameTab>('wheel');

  return (
    <main className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <button
          onClick={() => router.back()}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 sm:p-2 rounded-xl bg-pink-500/20 border border-pink-500/30 shrink-0">
            <Disc3 className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Games</h1>
            <p className="text-xs sm:text-sm text-white/50 truncate">Fun beslissingen</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`
              flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all border backdrop-blur-md
              ${activeTab === tab.value
                ? 'bg-pink-600/80 border-pink-400 text-white'
                : 'bg-black/40 border-white/20 text-white hover:bg-black/50 hover:border-white/30'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Game Content */}
      <div className="bg-black/50 backdrop-blur-xl border border-white/15 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl">
        {activeTab === 'wheel' && <SpinWheel />}
        {activeTab === 'punishment' && <PunishmentWheel />}
        {activeTab === 'dice' && <DiceRoll />}
        {activeTab === 'coin' && <CoinFlip />}
        {activeTab === 'teams' && <TeamMaker />}
      </div>
    </main>
  );
}
