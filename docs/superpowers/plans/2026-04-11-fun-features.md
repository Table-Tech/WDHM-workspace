# Fun Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add games page, hall of fame, GIF reactions, milestone slideshow, invite system, and reset functionality to LateTable.

**Architecture:** Features are largely independent. Games page is standalone React components with CSS animations. Reset system introduces seasons/archive concept. GIF reactions use preset collection stored locally. Slideshow uses CSS Ken Burns animations.

**Tech Stack:** Next.js 14, React, TanStack Query, Supabase, Tailwind CSS, Lucide icons

---

## File Structure

```
src/
├── app/
│   ├── games/
│   │   └── page.tsx                    # Games page with tabs
│   └── hall-of-fame/
│       └── page.tsx                    # Hall of Fame page
├── components/
│   ├── games/
│   │   ├── GamesTabs.tsx               # Tab container
│   │   ├── SpinWheel.tsx               # Wheel spinner
│   │   ├── CoinFlip.tsx                # Coin flip game
│   │   └── TeamMaker.tsx               # Random team generator
│   ├── hall-of-fame/
│   │   ├── RecordsSection.tsx          # All-time records
│   │   ├── IconicMoments.tsx           # Memorable incidents
│   │   └── ResetHistory.tsx            # Past resets/seasons
│   ├── reactions/
│   │   ├── GifPicker.tsx               # GIF selection popup
│   │   └── ReactionDisplay.tsx         # Show reactions on items
│   ├── slideshow/
│   │   └── MilestoneSlideshow.tsx      # Ken Burns slideshow
│   └── invite/
│       └── InviteButton.tsx            # Share invite link
├── hooks/
│   ├── useReactions.ts                 # GIF reactions CRUD
│   ├── useSeasons.ts                   # Seasons/reset data
│   └── useRecords.ts                   # Hall of fame records
├── lib/
│   └── gifs.ts                         # Preset GIF definitions
└── types/
    └── index.ts                        # Add new types
public/
└── gifs/
    └── reactions/                      # ~25 preset GIF files
supabase/
└── migrations/
    └── 003_fun_features.sql            # New tables
```

---

## Phase 1: Foundation

### Task 1: Add New Types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add reaction types**

```typescript
// Add at end of src/types/index.ts

// GIF Reaction types
export interface GifReaction {
  id: string;
  gif_id: string;
  gif_url: string;
  category: 'laugh' | 'shame' | 'shocked' | 'applause' | 'drama';
}

export interface IncidentReaction {
  id: string;
  incident_id: string;
  friend_id: string;
  gif_id: string;
  created_at: string;
}
```

- [ ] **Step 2: Add season and reset types**

```typescript
// Add after reaction types

// Season types
export interface Season {
  id: string;
  name: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

export interface Reset {
  id: string;
  triggered_by: string | null;
  reset_at: string;
  stats_snapshot: {
    total_incidents: number;
    friends: Array<{ id: string; name: string; count: number }>;
  };
}
```

- [ ] **Step 3: Add hall of fame types**

```typescript
// Add after reset types

// Hall of Fame types
export interface Record {
  type: 'longest_streak' | 'most_minutes_single' | 'total_minutes' | 'most_monthly' | 'longest_ontime';
  friend: Friend;
  value: number;
  incident?: Incident;
  date: string;
}

export interface IconicMoment {
  incident: Incident;
  friend: Friend;
}

// Extend Incident type
export interface IncidentExtended extends Incident {
  is_iconic: boolean;
  archived_at: string | null;
  season_id: string | null;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts
git commit -m "$(cat <<'EOF'
feat: add types for reactions, seasons, and hall of fame

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Database Migration

**Files:**
- Create: `supabase/migrations/003_fun_features.sql`

- [ ] **Step 1: Create migration file with reactions table**

```sql
-- ============================================
-- LateTable Fun Features Migration
-- ============================================

-- 1. Reactions table
CREATE TABLE IF NOT EXISTS incident_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
  gif_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(incident_id, friend_id, gif_id)
);

-- Enable RLS
ALTER TABLE incident_reactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read on incident_reactions" ON incident_reactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on incident_reactions" ON incident_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on incident_reactions" ON incident_reactions FOR DELETE USING (true);
```

- [ ] **Step 2: Add seasons and resets tables**

```sql
-- 2. Seasons table
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- 3. Resets table
CREATE TABLE IF NOT EXISTS resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by UUID REFERENCES friends(id) ON DELETE SET NULL,
  reset_at TIMESTAMPTZ DEFAULT NOW(),
  stats_snapshot JSONB NOT NULL
);

-- Enable RLS
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE resets ENABLE ROW LEVEL SECURITY;

-- Policies for seasons
CREATE POLICY "Allow public read on seasons" ON seasons FOR SELECT USING (true);
CREATE POLICY "Allow public insert on seasons" ON seasons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on seasons" ON seasons FOR UPDATE USING (true);

-- Policies for resets
CREATE POLICY "Allow public read on resets" ON resets FOR SELECT USING (true);
CREATE POLICY "Allow public insert on resets" ON resets FOR INSERT WITH CHECK (true);
```

- [ ] **Step 3: Add columns to incidents table**

```sql
-- 4. Add columns to incidents
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS is_iconic BOOLEAN DEFAULT false;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id);

-- 5. Create initial season
INSERT INTO seasons (name, start_date, is_active)
VALUES ('Seizoen 1', NOW(), true)
ON CONFLICT DO NOTHING;
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/003_fun_features.sql
git commit -m "$(cat <<'EOF'
feat: add database migration for reactions, seasons, resets

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 2: Games Page

### Task 3: Create Games Page Shell

**Files:**
- Create: `src/app/games/page.tsx`

- [ ] **Step 1: Create page with tab structure**

```tsx
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

      {/* Game Content */}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/games/page.tsx
git commit -m "$(cat <<'EOF'
feat: add games page with tab navigation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Create Spin Wheel Component

**Files:**
- Create: `src/components/games/SpinWheel.tsx`

- [ ] **Step 1: Create wheel component with state**

```tsx
'use client';

import { useState, useRef } from 'react';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8B500', '#FF8C00',
];

export function SpinWheel() {
  const [names, setNames] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [spinText, setSpinText] = useState('Waarvoor draai je?');
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const addName = () => {
    if (newName.trim() && names.length < 12) {
      setNames([...names, newName.trim()]);
      setNewName('');
    }
  };

  const removeName = (index: number) => {
    setNames(names.filter((_, i) => i !== index));
  };

  const spin = () => {
    if (names.length < 2 || isSpinning) return;

    setIsSpinning(true);
    setWinner(null);

    const spins = 5 + Math.random() * 5; // 5-10 full rotations
    const extraDegrees = Math.random() * 360;
    const totalRotation = rotation + (spins * 360) + extraDegrees;

    setRotation(totalRotation);

    setTimeout(() => {
      const normalizedRotation = totalRotation % 360;
      const segmentSize = 360 / names.length;
      const winnerIndex = Math.floor((360 - normalizedRotation + segmentSize / 2) % 360 / segmentSize);
      setWinner(names[winnerIndex]);
      setIsSpinning(false);
    }, 4000);
  };

  const reset = () => {
    setNames([]);
    setRotation(0);
    setWinner(null);
    setSpinText('Waarvoor draai je?');
  };

  const segmentAngle = names.length > 0 ? 360 / names.length : 360;

  return (
    <div className="space-y-6">
      {/* Spin Text Input */}
      <div>
        <label className="text-sm text-white/50 mb-2 block">Waarvoor draai je?</label>
        <Input
          value={spinText}
          onChange={(e) => setSpinText(e.target.value)}
          placeholder="Bijv: Wie betaalt de koffie?"
          className="bg-white/5 border-white/10"
        />
      </div>

      {/* Add Names */}
      <div>
        <label className="text-sm text-white/50 mb-2 block">Namen ({names.length}/12)</label>
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addName()}
            placeholder="Naam toevoegen..."
            className="bg-white/5 border-white/10"
            disabled={names.length >= 12}
          />
          <Button onClick={addName} disabled={!newName.trim() || names.length >= 12}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Names List */}
      {names.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {names.map((name, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
              style={{ backgroundColor: COLORS[i % COLORS.length] + '30', borderColor: COLORS[i % COLORS.length] }}
            >
              <span style={{ color: COLORS[i % COLORS.length] }}>{name}</span>
              <button onClick={() => removeName(i)} className="hover:opacity-70">
                <Trash2 className="w-3 h-3" style={{ color: COLORS[i % COLORS.length] }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Wheel */}
      {names.length >= 2 && (
        <div className="flex flex-col items-center gap-6">
          {/* Spin Text Display */}
          <p className="text-lg font-medium text-white/70">{spinText}</p>

          {/* Wheel Container */}
          <div className="relative">
            {/* Pointer */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-white" />
            </div>

            {/* Wheel */}
            <div
              ref={wheelRef}
              className="w-64 h-64 sm:w-80 sm:h-80 rounded-full relative overflow-hidden border-4 border-white/20"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
              }}
            >
              {names.map((name, i) => (
                <div
                  key={i}
                  className="absolute w-full h-full"
                  style={{
                    transform: `rotate(${i * segmentAngle}deg)`,
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.tan((segmentAngle * Math.PI) / 360)}% 0%)`,
                  }}
                >
                  <div
                    className="w-full h-full flex items-start justify-center pt-4"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  >
                    <span
                      className="text-xs font-bold text-white/90 rotate-90 whitespace-nowrap"
                      style={{ transform: `rotate(${segmentAngle / 2}deg)` }}
                    >
                      {name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Winner Display */}
          {winner && (
            <div className="text-center animate-bounce">
              <p className="text-sm text-white/50">Winnaar:</p>
              <p className="text-2xl font-bold text-white">{winner}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={spin}
              disabled={isSpinning || names.length < 2}
              className="bg-pink-500 hover:bg-pink-600 px-8"
            >
              {isSpinning ? 'Draait...' : 'Draai!'}
            </Button>
            <Button onClick={reset} variant="outline">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {names.length < 2 && (
        <div className="text-center py-8 text-white/50">
          Voeg minimaal 2 namen toe om te draaien
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/games/SpinWheel.tsx
git commit -m "$(cat <<'EOF'
feat: add SpinWheel component with CSS animation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Create Coin Flip Component

**Files:**
- Create: `src/components/games/CoinFlip.tsx`

- [ ] **Step 1: Create coin flip component**

```tsx
'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CoinSide = 'tabletech' | 'techtable' | null;

export function CoinFlip() {
  const [result, setResult] = useState<CoinSide>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipCount, setFlipCount] = useState(0);

  const flip = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    setResult(null);
    setFlipCount((c) => c + 1);

    // Random result
    const newResult: CoinSide = Math.random() > 0.5 ? 'tabletech' : 'techtable';

    setTimeout(() => {
      setResult(newResult);
      setIsFlipping(false);
    }, 2000);
  };

  const reset = () => {
    setResult(null);
    setFlipCount(0);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Coin */}
      <div className="relative w-48 h-48 sm:w-64 sm:h-64" style={{ perspective: '1000px' }}>
        <div
          className={`
            w-full h-full relative transition-transform duration-[2000ms]
            ${isFlipping ? 'animate-coin-flip' : ''}
          `}
          style={{
            transformStyle: 'preserve-3d',
            transform: result === 'techtable' ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front - TableTech */}
          <div
            className="absolute w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-4 border-yellow-300 shadow-lg"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-center">
              <span className="text-3xl sm:text-4xl font-bold text-yellow-900">Table</span>
              <br />
              <span className="text-3xl sm:text-4xl font-bold text-yellow-900">Tech</span>
            </div>
          </div>

          {/* Back - TechTable */}
          <div
            className="absolute w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center border-4 border-purple-300 shadow-lg"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="text-center">
              <span className="text-3xl sm:text-4xl font-bold text-purple-900">Tech</span>
              <br />
              <span className="text-3xl sm:text-4xl font-bold text-purple-900">Table</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && !isFlipping && (
        <div className="text-center animate-bounce">
          <p className="text-sm text-white/50">Resultaat:</p>
          <p className={`text-2xl font-bold ${result === 'tabletech' ? 'text-yellow-400' : 'text-purple-400'}`}>
            {result === 'tabletech' ? 'TableTech' : 'TechTable'}
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={flip}
          disabled={isFlipping}
          className="bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600 px-8"
        >
          {isFlipping ? 'Flipt...' : 'Flip!'}
        </Button>
        <Button onClick={reset} variant="outline">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      {flipCount > 0 && (
        <p className="text-sm text-white/40">Totaal geflipped: {flipCount}x</p>
      )}

      {/* CSS for animation */}
      <style jsx global>{`
        @keyframes coin-flip {
          0% { transform: rotateY(0deg); }
          25% { transform: rotateY(900deg); }
          50% { transform: rotateY(1800deg); }
          75% { transform: rotateY(2700deg); }
          100% { transform: rotateY(3600deg); }
        }
        .animate-coin-flip {
          animation: coin-flip 2s ease-out;
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/games/CoinFlip.tsx
git commit -m "$(cat <<'EOF'
feat: add CoinFlip component with 3D animation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Create Team Maker Component

**Files:**
- Create: `src/components/games/TeamMaker.tsx`

- [ ] **Step 1: Create team maker component**

```tsx
'use client';

import { useState } from 'react';
import { Plus, Trash2, RotateCcw, Shuffle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TEAM_COLORS = [
  { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', name: 'Rood' },
  { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400', name: 'Blauw' },
  { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400', name: 'Groen' },
  { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400', name: 'Geel' },
  { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-400', name: 'Paars' },
  { bg: 'bg-pink-500/20', border: 'border-pink-500/50', text: 'text-pink-400', name: 'Roze' },
  { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', text: 'text-cyan-400', name: 'Cyan' },
  { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400', name: 'Oranje' },
];

export function TeamMaker() {
  const [names, setNames] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<string[][]>([]);
  const [isShuffling, setIsShuffling] = useState(false);

  const addName = () => {
    if (newName.trim() && names.length < 24) {
      setNames([...names, newName.trim()]);
      setNewName('');
    }
  };

  const removeName = (index: number) => {
    setNames(names.filter((_, i) => i !== index));
    setTeams([]);
  };

  const shuffle = () => {
    if (names.length < 2) return;

    setIsShuffling(true);
    setTeams([]);

    // Shuffle animation
    setTimeout(() => {
      const shuffled = [...names].sort(() => Math.random() - 0.5);
      const newTeams: string[][] = Array.from({ length: teamCount }, () => []);

      shuffled.forEach((name, i) => {
        newTeams[i % teamCount].push(name);
      });

      setTeams(newTeams);
      setIsShuffling(false);
    }, 1500);
  };

  const reset = () => {
    setNames([]);
    setTeams([]);
    setTeamCount(2);
  };

  return (
    <div className="space-y-6">
      {/* Add Names */}
      <div>
        <label className="text-sm text-white/50 mb-2 block">Namen ({names.length}/24)</label>
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addName()}
            placeholder="Naam toevoegen..."
            className="bg-white/5 border-white/10"
            disabled={names.length >= 24}
          />
          <Button onClick={addName} disabled={!newName.trim() || names.length >= 24}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Names List */}
      {names.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {names.map((name, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-white/10 border border-white/20 ${
                isShuffling ? 'animate-pulse' : ''
              }`}
            >
              <span className="text-white/80">{name}</span>
              <button onClick={() => removeName(i)} className="hover:opacity-70">
                <Trash2 className="w-3 h-3 text-white/50" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Team Count Selector */}
      {names.length >= 2 && teams.length === 0 && (
        <div>
          <label className="text-sm text-white/50 mb-2 block">Aantal teams</label>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6, 7, 8].filter((n) => n <= names.length).map((n) => (
              <button
                key={n}
                onClick={() => setTeamCount(n)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  teamCount === n
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Shuffle Button */}
      {names.length >= 2 && teams.length === 0 && (
        <Button
          onClick={shuffle}
          disabled={isShuffling}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <Shuffle className={`w-4 h-4 mr-2 ${isShuffling ? 'animate-spin' : ''}`} />
          {isShuffling ? 'Shuffelen...' : 'Maak Teams!'}
        </Button>
      )}

      {/* Teams Display */}
      {teams.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Teams
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teams.map((team, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border ${TEAM_COLORS[i].bg} ${TEAM_COLORS[i].border}`}
              >
                <h4 className={`font-medium mb-2 ${TEAM_COLORS[i].text}`}>
                  Team {TEAM_COLORS[i].name}
                </h4>
                <ul className="space-y-1">
                  {team.map((name, j) => (
                    <li key={j} className="text-white/80 text-sm">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Reset Button */}
          <Button onClick={reset} variant="outline" className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Opnieuw
          </Button>
        </div>
      )}

      {/* Empty State */}
      {names.length < 2 && (
        <div className="text-center py-8 text-white/50">
          Voeg minimaal 2 namen toe om teams te maken
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/games/TeamMaker.tsx
git commit -m "$(cat <<'EOF'
feat: add TeamMaker component with shuffle animation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Integrate Games Components

**Files:**
- Modify: `src/app/games/page.tsx`

- [ ] **Step 1: Import and use game components**

Replace the placeholder content in `src/app/games/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Disc3, Coins, Users } from 'lucide-react';
import { SpinWheel } from '@/components/games/SpinWheel';
import { CoinFlip } from '@/components/games/CoinFlip';
import { TeamMaker } from '@/components/games/TeamMaker';

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

      {/* Game Content */}
      <div className="glass-card rounded-2xl p-6">
        {activeTab === 'wheel' && <SpinWheel />}
        {activeTab === 'coin' && <CoinFlip />}
        {activeTab === 'teams' && <TeamMaker />}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/games/page.tsx
git commit -m "$(cat <<'EOF'
feat: integrate all game components into games page

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Add Games Link to Dashboard

**Files:**
- Modify: `src/components/dashboard/Dashboard.tsx`

- [ ] **Step 1: Add Games icon import**

Add `Gamepad2` to the imports at line 5:

```tsx
import { UserPlus, Clock, Zap, Settings, Image as ImageIcon, Award, MapPin, BarChart3, Gamepad2 } from 'lucide-react';
```

- [ ] **Step 2: Add Games button after Stats button**

Add after the Stats Button (around line 230):

```tsx
{/* Games Button */}
<Link href="/games">
  <Button
    variant="ghost"
    className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all p-0"
    aria-label="Games spelen"
  >
    <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
  </Button>
</Link>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/Dashboard.tsx
git commit -m "$(cat <<'EOF'
feat: add games navigation button to dashboard header

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 3: GIF Reactions

### Task 9: Create Preset GIF Definitions

**Files:**
- Create: `src/lib/gifs.ts`

- [ ] **Step 1: Define preset GIFs**

```typescript
export interface PresetGif {
  id: string;
  url: string;
  alt: string;
  category: 'laugh' | 'shame' | 'shocked' | 'applause' | 'drama';
}

// Preset GIF collection (~25 GIFs)
// Note: Replace URLs with actual GIF files in public/gifs/reactions/
export const PRESET_GIFS: PresetGif[] = [
  // Laugh (5)
  { id: 'laugh-1', url: '/gifs/reactions/laugh-1.gif', alt: 'Lachen', category: 'laugh' },
  { id: 'laugh-2', url: '/gifs/reactions/laugh-2.gif', alt: 'Lol', category: 'laugh' },
  { id: 'laugh-3', url: '/gifs/reactions/laugh-3.gif', alt: 'Haha', category: 'laugh' },
  { id: 'laugh-4', url: '/gifs/reactions/laugh-4.gif', alt: 'Grappig', category: 'laugh' },
  { id: 'laugh-5', url: '/gifs/reactions/laugh-5.gif', alt: 'Schaterlach', category: 'laugh' },

  // Shame (5)
  { id: 'shame-1', url: '/gifs/reactions/shame-1.gif', alt: 'Facepalm', category: 'shame' },
  { id: 'shame-2', url: '/gifs/reactions/shame-2.gif', alt: 'Schaamte', category: 'shame' },
  { id: 'shame-3', url: '/gifs/reactions/shame-3.gif', alt: 'Cringe', category: 'shame' },
  { id: 'shame-4', url: '/gifs/reactions/shame-4.gif', alt: 'Oh nee', category: 'shame' },
  { id: 'shame-5', url: '/gifs/reactions/shame-5.gif', alt: 'Awkward', category: 'shame' },

  // Shocked (5)
  { id: 'shocked-1', url: '/gifs/reactions/shocked-1.gif', alt: 'Shocked', category: 'shocked' },
  { id: 'shocked-2', url: '/gifs/reactions/shocked-2.gif', alt: 'Wow', category: 'shocked' },
  { id: 'shocked-3', url: '/gifs/reactions/shocked-3.gif', alt: 'Verbaasd', category: 'shocked' },
  { id: 'shocked-4', url: '/gifs/reactions/shocked-4.gif', alt: 'Wat?!', category: 'shocked' },
  { id: 'shocked-5', url: '/gifs/reactions/shocked-5.gif', alt: 'Mind blown', category: 'shocked' },

  // Applause (5)
  { id: 'applause-1', url: '/gifs/reactions/applause-1.gif', alt: 'Applaus', category: 'applause' },
  { id: 'applause-2', url: '/gifs/reactions/applause-2.gif', alt: 'Thumbs up', category: 'applause' },
  { id: 'applause-3', url: '/gifs/reactions/applause-3.gif', alt: 'Clapping', category: 'applause' },
  { id: 'applause-4', url: '/gifs/reactions/applause-4.gif', alt: 'Bravo', category: 'applause' },
  { id: 'applause-5', url: '/gifs/reactions/applause-5.gif', alt: 'Nice', category: 'applause' },

  // Drama (5)
  { id: 'drama-1', url: '/gifs/reactions/drama-1.gif', alt: 'Eye roll', category: 'drama' },
  { id: 'drama-2', url: '/gifs/reactions/drama-2.gif', alt: 'Sigh', category: 'drama' },
  { id: 'drama-3', url: '/gifs/reactions/drama-3.gif', alt: 'Drama', category: 'drama' },
  { id: 'drama-4', url: '/gifs/reactions/drama-4.gif', alt: 'Whatever', category: 'drama' },
  { id: 'drama-5', url: '/gifs/reactions/drama-5.gif', alt: 'Ugh', category: 'drama' },
];

export const GIF_CATEGORIES = {
  laugh: { label: 'Lachen', emoji: '😂' },
  shame: { label: 'Schaamte', emoji: '🙈' },
  shocked: { label: 'Verbaasd', emoji: '😱' },
  applause: { label: 'Applaus', emoji: '👏' },
  drama: { label: 'Drama', emoji: '🙄' },
};

export function getGifById(id: string): PresetGif | undefined {
  return PRESET_GIFS.find((g) => g.id === id);
}

export function getGifsByCategory(category: PresetGif['category']): PresetGif[] {
  return PRESET_GIFS.filter((g) => g.category === category);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/gifs.ts
git commit -m "$(cat <<'EOF'
feat: add preset GIF definitions for reactions

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Create useReactions Hook

**Files:**
- Create: `src/hooks/useReactions.ts`

- [ ] **Step 1: Create reactions hook**

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { IncidentReaction } from '@/types';

// Fetch reactions for an incident
async function fetchReactions(incidentId: string): Promise<IncidentReaction[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('incident_reactions')
    .select('*')
    .eq('incident_id', incidentId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Add a reaction
async function addReaction(params: {
  incidentId: string;
  friendId: string;
  gifId: string;
}): Promise<IncidentReaction> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('incident_reactions')
    .insert({
      incident_id: params.incidentId,
      friend_id: params.friendId,
      gif_id: params.gifId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Remove a reaction
async function removeReaction(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('incident_reactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Hook: Get reactions for an incident
export function useReactions(incidentId: string | null) {
  return useQuery({
    queryKey: ['reactions', incidentId],
    queryFn: () => fetchReactions(incidentId!),
    enabled: hasValidCredentials && !!incidentId,
    placeholderData: [],
  });
}

// Hook: Add a reaction
export function useAddReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addReaction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reactions', variables.incidentId] });
    },
  });
}

// Hook: Remove a reaction
export function useRemoveReaction(incidentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeReaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions', incidentId] });
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useReactions.ts
git commit -m "$(cat <<'EOF'
feat: add useReactions hook for GIF reactions

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Create GifPicker Component

**Files:**
- Create: `src/components/reactions/GifPicker.tsx`

- [ ] **Step 1: Create GIF picker popup**

```tsx
'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import { X } from 'lucide-react';
import { PRESET_GIFS, GIF_CATEGORIES, type PresetGif } from '@/lib/gifs';

interface GifPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (gif: PresetGif) => void;
}

type Category = PresetGif['category'];

export function GifPicker({ isOpen, onClose, onSelect }: GifPickerProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('laugh');

  if (!isOpen) return null;

  const filteredGifs = PRESET_GIFS.filter((g) => g.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Picker */}
      <div className="relative w-full max-w-md bg-[#1a1a2e] border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 max-h-[70vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Kies een GIF</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
          {(Object.keys(GIF_CATEGORIES) as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all
                ${activeCategory === cat
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
                }
              `}
            >
              <span>{GIF_CATEGORIES[cat].emoji}</span>
              <span>{GIF_CATEGORIES[cat].label}</span>
            </button>
          ))}
        </div>

        {/* GIF Grid */}
        <div className="grid grid-cols-3 gap-2 overflow-y-auto flex-1">
          {filteredGifs.map((gif) => (
            <button
              key={gif.id}
              onClick={() => {
                onSelect(gif);
                onClose();
              }}
              className="aspect-square relative rounded-lg overflow-hidden bg-white/5 hover:ring-2 hover:ring-white/30 transition-all"
            >
              <NextImage
                src={gif.url}
                alt={gif.alt}
                fill
                className="object-cover"
                unoptimized // GIFs need this
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/reactions/GifPicker.tsx
git commit -m "$(cat <<'EOF'
feat: add GifPicker component with category tabs

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: Create ReactionDisplay Component

**Files:**
- Create: `src/components/reactions/ReactionDisplay.tsx`

- [ ] **Step 1: Create reaction display**

```tsx
'use client';

import NextImage from 'next/image';
import { Plus, X } from 'lucide-react';
import { getGifById } from '@/lib/gifs';
import type { IncidentReaction } from '@/types';

interface ReactionDisplayProps {
  reactions: IncidentReaction[];
  onAddClick: () => void;
  onRemove?: (reactionId: string) => void;
  currentFriendId?: string;
  compact?: boolean;
}

export function ReactionDisplay({
  reactions,
  onAddClick,
  onRemove,
  currentFriendId,
  compact = false,
}: ReactionDisplayProps) {
  // Group reactions by gif_id with count
  const groupedReactions = reactions.reduce((acc, reaction) => {
    const existing = acc.find((r) => r.gifId === reaction.gif_id);
    if (existing) {
      existing.count++;
      existing.reactions.push(reaction);
    } else {
      acc.push({
        gifId: reaction.gif_id,
        count: 1,
        reactions: [reaction],
      });
    }
    return acc;
  }, [] as Array<{ gifId: string; count: number; reactions: IncidentReaction[] }>);

  const sizeClass = compact ? 'w-8 h-8' : 'w-10 h-10';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Existing Reactions */}
      {groupedReactions.map((group) => {
        const gif = getGifById(group.gifId);
        if (!gif) return null;

        const canRemove = onRemove && group.reactions.some((r) => r.friend_id === currentFriendId);
        const userReaction = group.reactions.find((r) => r.friend_id === currentFriendId);

        return (
          <div
            key={group.gifId}
            className={`
              relative ${sizeClass} rounded-lg overflow-hidden bg-white/10 border border-white/20
              ${canRemove ? 'cursor-pointer group' : ''}
            `}
            onClick={() => canRemove && userReaction && onRemove(userReaction.id)}
          >
            <NextImage
              src={gif.url}
              alt={gif.alt}
              fill
              className="object-cover"
              unoptimized
            />
            {/* Count Badge */}
            {group.count > 1 && (
              <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] px-1 rounded-tl">
                {group.count}
              </span>
            )}
            {/* Remove overlay */}
            {canRemove && (
              <div className="absolute inset-0 bg-red-500/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <X className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        );
      })}

      {/* Add Button */}
      <button
        onClick={onAddClick}
        className={`
          ${sizeClass} rounded-lg bg-white/5 border border-dashed border-white/20
          hover:bg-white/10 hover:border-white/30 transition-colors
          flex items-center justify-center
        `}
      >
        <Plus className="w-4 h-4 text-white/50" />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/reactions/ReactionDisplay.tsx
git commit -m "$(cat <<'EOF'
feat: add ReactionDisplay component for showing reactions

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 4: Hall of Fame

### Task 13: Create useRecords Hook

**Files:**
- Create: `src/hooks/useRecords.ts`

- [ ] **Step 1: Create records hook**

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { Record, Friend, Incident, IconicMoment } from '@/types';

// Fetch hall of fame records
async function fetchRecords(): Promise<Record[]> {
  if (!hasValidCredentials) return [];

  const { data: friends } = await supabase.from('friends').select('*');
  const { data: incidents } = await supabase.from('incidents').select('*');
  const { data: streaks } = await supabase.from('streaks').select('*');

  if (!friends || !incidents) return [];

  const records: Record[] = [];

  // Longest late streak
  const longestStreak = streaks?.reduce((max, s) =>
    s.streak_type === 'late' && s.best_count > (max?.best_count || 0) ? s : max
  , null as typeof streaks[0] | null);
  if (longestStreak) {
    const friend = friends.find((f) => f.id === longestStreak.friend_id);
    if (friend) {
      records.push({
        type: 'longest_streak',
        friend,
        value: longestStreak.best_count,
        date: longestStreak.last_updated,
      });
    }
  }

  // Most minutes single incident
  const mostMinutes = incidents.reduce((max, i) =>
    (i.minutes_late || 0) > (max?.minutes_late || 0) ? i : max
  , null as Incident | null);
  if (mostMinutes) {
    const friend = friends.find((f) => f.id === mostMinutes.friend_id);
    if (friend) {
      records.push({
        type: 'most_minutes_single',
        friend,
        value: mostMinutes.minutes_late || 0,
        incident: mostMinutes,
        date: mostMinutes.created_at,
      });
    }
  }

  // Total minutes per friend
  const friendMinutes = new Map<string, number>();
  incidents.forEach((i) => {
    const current = friendMinutes.get(i.friend_id) || 0;
    friendMinutes.set(i.friend_id, current + (i.minutes_late || 0));
  });
  let maxTotalMinutes = 0;
  let maxTotalFriend: Friend | null = null;
  friendMinutes.forEach((total, friendId) => {
    if (total > maxTotalMinutes) {
      maxTotalMinutes = total;
      maxTotalFriend = friends.find((f) => f.id === friendId) || null;
    }
  });
  if (maxTotalFriend) {
    records.push({
      type: 'total_minutes',
      friend: maxTotalFriend,
      value: maxTotalMinutes,
      date: new Date().toISOString(),
    });
  }

  // Longest on-time streak
  const longestOnTime = streaks?.reduce((max, s) =>
    s.streak_type === 'on_time' && s.best_count > (max?.best_count || 0) ? s : max
  , null as typeof streaks[0] | null);
  if (longestOnTime && longestOnTime.best_count > 0) {
    const friend = friends.find((f) => f.id === longestOnTime.friend_id);
    if (friend) {
      records.push({
        type: 'longest_ontime',
        friend,
        value: longestOnTime.best_count,
        date: longestOnTime.last_updated,
      });
    }
  }

  return records;
}

// Fetch iconic moments
async function fetchIconicMoments(): Promise<IconicMoment[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('incidents')
    .select(`*, friend:friends(*)`)
    .eq('is_iconic', true)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((item) => ({
    incident: item as Incident,
    friend: item.friend as unknown as Friend,
  }));
}

// Hook: Get records
export function useRecords() {
  return useQuery({
    queryKey: ['hall-of-fame-records'],
    queryFn: fetchRecords,
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Get iconic moments
export function useIconicMoments() {
  return useQuery({
    queryKey: ['iconic-moments'],
    queryFn: fetchIconicMoments,
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useRecords.ts
git commit -m "$(cat <<'EOF'
feat: add useRecords hook for hall of fame data

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 14: Create useSeasons Hook

**Files:**
- Create: `src/hooks/useSeasons.ts`

- [ ] **Step 1: Create seasons hook**

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { Season, Reset } from '@/types';

// Fetch all seasons
async function fetchSeasons(): Promise<Season[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Fetch all resets
async function fetchResets(): Promise<Reset[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('resets')
    .select('*')
    .order('reset_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Perform a reset
async function performReset(triggeredBy: string | null): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  // 1. Get current stats snapshot
  const { data: friends } = await supabase.from('friends').select('*');
  const { data: incidents } = await supabase.from('incidents').select('*').is('archived_at', null);

  const statsSnapshot = {
    total_incidents: incidents?.length || 0,
    friends: friends?.map((f) => ({
      id: f.id,
      name: f.name,
      count: incidents?.filter((i) => i.friend_id === f.id).length || 0,
    })) || [],
  };

  // 2. Create reset record
  await supabase.from('resets').insert({
    triggered_by: triggeredBy,
    stats_snapshot: statsSnapshot,
  });

  // 3. End current season
  await supabase
    .from('seasons')
    .update({ is_active: false, end_date: new Date().toISOString() })
    .eq('is_active', true);

  // 4. Create new season
  const { data: newSeason } = await supabase
    .from('seasons')
    .insert({ name: null, is_active: true })
    .select()
    .single();

  // 5. Archive all incidents
  if (newSeason) {
    await supabase
      .from('incidents')
      .update({ archived_at: new Date().toISOString() })
      .is('archived_at', null);
  }

  // 6. Reset streaks
  await supabase
    .from('streaks')
    .update({ current_count: 0 });
}

// Hook: Get seasons
export function useSeasons() {
  return useQuery({
    queryKey: ['seasons'],
    queryFn: fetchSeasons,
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Get active season
export function useActiveSeason() {
  const { data: seasons = [] } = useSeasons();
  return seasons.find((s) => s.is_active) || null;
}

// Hook: Get resets
export function useResets() {
  return useQuery({
    queryKey: ['resets'],
    queryFn: fetchResets,
    enabled: hasValidCredentials,
    placeholderData: [],
  });
}

// Hook: Perform reset
export function usePerformReset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: performReset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seasons'] });
      queryClient.invalidateQueries({ queryKey: ['resets'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['streaks'] });
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useSeasons.ts
git commit -m "$(cat <<'EOF'
feat: add useSeasons hook for reset/season management

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 15: Create Hall of Fame Page

**Files:**
- Create: `src/app/hall-of-fame/page.tsx`

- [ ] **Step 1: Create hall of fame page**

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Star, History, Flame, Clock, Calendar, Award } from 'lucide-react';
import { useRecords, useIconicMoments } from '@/hooks/useRecords';
import { useResets } from '@/hooks/useSeasons';
import { FriendAvatar } from '@/components/friends/FriendAvatar';

type Tab = 'records' | 'iconic' | 'history';

const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: 'records', label: 'Records', icon: <Trophy className="w-4 h-4" /> },
  { value: 'iconic', label: 'Iconic', icon: <Star className="w-4 h-4" /> },
  { value: 'history', label: 'Historie', icon: <History className="w-4 h-4" /> },
];

const RECORD_INFO: Record<string, { label: string; icon: React.ReactNode; suffix: string }> = {
  longest_streak: { label: 'Langste Late Streak', icon: <Flame className="w-5 h-5 text-orange-400" />, suffix: 'x op rij' },
  most_minutes_single: { label: 'Meeste Minuten (Single)', icon: <Clock className="w-5 h-5 text-purple-400" />, suffix: ' min' },
  total_minutes: { label: 'Meeste Minuten (Totaal)', icon: <Clock className="w-5 h-5 text-blue-400" />, suffix: ' min' },
  longest_ontime: { label: 'Langste On-Time Streak', icon: <Award className="w-5 h-5 text-green-400" />, suffix: 'x op rij' },
};

export default function HallOfFamePage() {
  const [activeTab, setActiveTab] = useState<Tab>('records');
  const { data: records = [], isLoading: recordsLoading } = useRecords();
  const { data: iconicMoments = [], isLoading: iconicLoading } = useIconicMoments();
  const { data: resets = [], isLoading: resetsLoading } = useResets();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

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
          <div className="p-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Hall of Fame</h1>
            <p className="text-sm text-white/50">Legendarische prestaties</p>
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
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="glass-card rounded-2xl p-6">
        {/* Records Tab */}
        {activeTab === 'records' && (
          <div className="space-y-4">
            {recordsLoading ? (
              <div className="text-center py-8 text-white/50">Laden...</div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-white/50">Nog geen records</div>
            ) : (
              records.map((record) => {
                const info = RECORD_INFO[record.type];
                return (
                  <div
                    key={record.type}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="p-3 rounded-xl bg-yellow-500/10">
                      {info.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white/50">{info.label}</p>
                      <p className="text-xl font-bold text-white">
                        {record.value}{info.suffix}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <FriendAvatar name={record.friend.name} color={record.friend.color} size="sm" />
                      <span className="text-white/70">{record.friend.name}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Iconic Tab */}
        {activeTab === 'iconic' && (
          <div className="space-y-4">
            {iconicLoading ? (
              <div className="text-center py-8 text-white/50">Laden...</div>
            ) : iconicMoments.length === 0 ? (
              <div className="text-center py-8 text-white/50">
                Nog geen iconic moments. Markeer memorabele incidents als iconic!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {iconicMoments.map((moment) => (
                  <div
                    key={moment.incident.id}
                    className="aspect-square rounded-xl overflow-hidden relative bg-white/5 border border-white/10"
                  >
                    {moment.incident.photo_url && (
                      <img
                        src={moment.incident.photo_url}
                        alt="Iconic moment"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-sm text-white font-medium">{moment.friend.name}</p>
                      <p className="text-xs text-white/60">{formatDate(moment.incident.created_at)}</p>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {resetsLoading ? (
              <div className="text-center py-8 text-white/50">Laden...</div>
            ) : resets.length === 0 ? (
              <div className="text-center py-8 text-white/50">Nog geen resets uitgevoerd</div>
            ) : (
              resets.map((reset, index) => (
                <div
                  key={reset.id}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-white/50" />
                    <span className="text-white font-medium">
                      Seizoen {resets.length - index}
                    </span>
                    <span className="text-white/50 text-sm">
                      {formatDate(reset.reset_at)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-white/50">
                      Totaal incidents: <span className="text-white">{reset.stats_snapshot.total_incidents}</span>
                    </div>
                    <div className="text-white/50">
                      Deelnemers: <span className="text-white">{reset.stats_snapshot.friends.length}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/hall-of-fame/page.tsx
git commit -m "$(cat <<'EOF'
feat: add Hall of Fame page with records, iconic, history

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 16: Add Hall of Fame Link to Dashboard

**Files:**
- Modify: `src/components/dashboard/Dashboard.tsx`

- [ ] **Step 1: Add Crown icon to imports**

Update the lucide imports:

```tsx
import { UserPlus, Clock, Zap, Settings, Image as ImageIcon, Award, MapPin, BarChart3, Gamepad2, Crown } from 'lucide-react';
```

- [ ] **Step 2: Add Hall of Fame button after Games button**

```tsx
{/* Hall of Fame Button */}
<Link href="/hall-of-fame">
  <Button
    variant="ghost"
    className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all p-0"
    aria-label="Hall of Fame bekijken"
  >
    <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
  </Button>
</Link>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/Dashboard.tsx
git commit -m "$(cat <<'EOF'
feat: add hall of fame navigation button to dashboard

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 5: Milestone Slideshow

### Task 17: Create MilestoneSlideshow Component

**Files:**
- Create: `src/components/slideshow/MilestoneSlideshow.tsx`

- [ ] **Step 1: Create slideshow component**

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Play, Pause, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Incident, Friend, Milestone } from '@/types';

interface MilestoneSlideshowProps {
  friend: Friend;
  milestone: Milestone;
  incidents: Incident[];
  isOpen: boolean;
  onClose: () => void;
}

const SLIDE_DURATION = 5000; // 5 seconds per slide

export function MilestoneSlideshow({
  friend,
  milestone,
  incidents,
  isOpen,
  onClose,
}: MilestoneSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Only show incidents with photos
  const photosIncidents = incidents.filter((i) => i.photo_url);

  // Auto-advance slides
  useEffect(() => {
    if (!isPlaying || !isOpen || photosIncidents.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= photosIncidents.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [isPlaying, isOpen, photosIncidents.length]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  }, [isOpen]);

  const skip = useCallback(() => {
    if (currentIndex < photosIncidents.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  }, [currentIndex, photosIncidents.length, onClose]);

  if (!isOpen) return null;

  const currentIncident = photosIncidents[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Background Image with Ken Burns */}
      {currentIncident?.photo_url && (
        <div
          key={currentIndex}
          className="absolute inset-0 animate-ken-burns"
          style={{
            backgroundImage: `url(${currentIncident.photo_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: friend.color }}
            >
              {friend.name[0]}
            </div>
            <div>
              <p className="font-semibold text-white">{friend.name}</p>
              <p className="text-sm text-white/70">
                Milestone: {milestone.count}x {milestone.emoji}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 flex gap-1">
          {photosIncidents.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full overflow-hidden bg-white/30"
            >
              <div
                className={`h-full bg-white transition-all duration-300 ${
                  i < currentIndex ? 'w-full' :
                  i === currentIndex && isPlaying ? 'animate-progress' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Info */}
        {currentIncident && (
          <div className="p-6">
            <p className="text-white/70 text-sm">
              {new Date(currentIncident.created_at).toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            {currentIncident.location && (
              <p className="text-white text-lg font-medium mt-1">
                {currentIncident.location}
              </p>
            )}
            {currentIncident.minutes_late && (
              <p className="text-white/70">
                {currentIncident.minutes_late} minuten te laat
              </p>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="p-4 flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="text-white hover:bg-white/20"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-white hover:bg-white/20 w-12 h-12"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={skip}
            className="text-white hover:bg-white/20"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes ken-burns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          100% {
            transform: scale(1.1) translate(-2%, -2%);
          }
        }
        .animate-ken-burns {
          animation: ken-burns ${SLIDE_DURATION}ms ease-out forwards;
        }
        @keyframes progress {
          from { width: 0; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress ${SLIDE_DURATION}ms linear forwards;
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/slideshow/MilestoneSlideshow.tsx
git commit -m "$(cat <<'EOF'
feat: add MilestoneSlideshow with Ken Burns effect

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 6: Invite System

### Task 18: Create InviteButton Component

**Files:**
- Create: `src/components/invite/InviteButton.tsx`

- [ ] **Step 1: Create invite button with share**

```tsx
'use client';

import { useState } from 'react';
import { Share2, Copy, Check, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface InviteButtonProps {
  variant?: 'icon' | 'full';
}

export function InviteButton({ variant = 'icon' }: InviteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LateTable',
          text: 'Kom ook bij onze LateTable groep!',
          url: inviteUrl,
        });
      } catch (err) {
        // User cancelled or error
        console.error('Share failed:', err);
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      {variant === 'icon' ? (
        <Button
          variant="ghost"
          onClick={shareNative}
          className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all p-0"
          aria-label="Uitnodigen"
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
        </Button>
      ) : (
        <Button onClick={shareNative} className="gap-2">
          <Share2 className="w-4 h-4" />
          Uitnodigen
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="glass-modal w-[95vw] max-w-sm border-white/10 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-blue-400" />
              Deel de link
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-white/70">
              Deel deze link om anderen uit te nodigen voor LateTable:
            </p>

            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-sm text-white/80 truncate">
                {inviteUrl}
              </div>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* WhatsApp Share */}
            <Button
              onClick={() => {
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(`Kom ook bij onze LateTable groep! ${inviteUrl}`)}`,
                  '_blank'
                );
              }}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Deel via WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/invite/InviteButton.tsx
git commit -m "$(cat <<'EOF'
feat: add InviteButton with native share and WhatsApp

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 19: Add Invite Button to Dashboard

**Files:**
- Modify: `src/components/dashboard/Dashboard.tsx`

- [ ] **Step 1: Import InviteButton**

Add import:

```tsx
import { InviteButton } from '@/components/invite/InviteButton';
```

- [ ] **Step 2: Add InviteButton before Settings button**

```tsx
{/* Invite Button */}
<InviteButton />

{/* Settings Button */}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/Dashboard.tsx
git commit -m "$(cat <<'EOF'
feat: add invite button to dashboard header

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 7: Reset System in Settings

### Task 20: Add Reset Feature to Settings

**Files:**
- Modify: `src/components/settings/SettingsModal.tsx`

- [ ] **Step 1: Import reset hook and icons**

Add to imports:

```tsx
import { usePerformReset } from '@/hooks/useSeasons';
import { RotateCcw, AlertTriangle } from 'lucide-react';
```

- [ ] **Step 2: Add reset state and handler**

Add inside component:

```tsx
const [showResetConfirm, setShowResetConfirm] = useState(false);
const resetMutation = usePerformReset();

const handleReset = async () => {
  await resetMutation.mutateAsync(null);
  setShowResetConfirm(false);
};
```

- [ ] **Step 3: Add reset section to modal content**

Add before closing DialogContent:

```tsx
{/* Reset Section */}
<div className="mt-6 pt-6 border-t border-white/10">
  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
    <RotateCcw className="w-4 h-4 text-orange-400" />
    Reset
  </h3>
  <p className="text-sm text-white/50 mb-3">
    Start een nieuw seizoen. Alle counts worden gereset, maar de geschiedenis blijft bewaard.
  </p>

  {!showResetConfirm ? (
    <Button
      onClick={() => setShowResetConfirm(true)}
      variant="outline"
      className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
    >
      <RotateCcw className="w-4 h-4 mr-2" />
      Nieuw Seizoen Starten
    </Button>
  ) : (
    <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 space-y-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
        <p className="text-sm text-white/70">
          Weet je zeker dat je wilt resetten? Alle incident counts gaan naar 0.
          De volledige geschiedenis blijft bewaard in Hall of Fame.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={handleReset}
          disabled={resetMutation.isPending}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {resetMutation.isPending ? 'Bezig...' : 'Ja, Reset'}
        </Button>
        <Button
          onClick={() => setShowResetConfirm(false)}
          variant="outline"
        >
          Annuleren
        </Button>
      </div>
    </div>
  )}
</div>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/settings/SettingsModal.tsx
git commit -m "$(cat <<'EOF'
feat: add reset/new season feature to settings

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 8: Final Integration

### Task 21: Create Placeholder GIF Files

**Files:**
- Create: `public/gifs/reactions/.gitkeep`

- [ ] **Step 1: Create GIF directory structure**

```bash
mkdir -p public/gifs/reactions
touch public/gifs/reactions/.gitkeep
```

- [ ] **Step 2: Add note about GIF files**

Create `public/gifs/reactions/README.md`:

```markdown
# Reaction GIFs

Place your preset GIF files here. Expected files:

## Laugh (laugh-1.gif to laugh-5.gif)
## Shame (shame-1.gif to shame-5.gif)
## Shocked (shocked-1.gif to shocked-5.gif)
## Applause (applause-1.gif to applause-5.gif)
## Drama (drama-1.gif to drama-5.gif)

Total: 25 GIF files

Recommended sources for royalty-free GIFs:
- GIPHY (check license)
- Tenor (check license)
- Create your own
```

- [ ] **Step 3: Commit**

```bash
git add public/gifs/
git commit -m "$(cat <<'EOF'
chore: add placeholder for reaction GIF files

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 22: Verify Build

**Files:**
- None (verification only)

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: Build succeeds

- [ ] **Step 3: Fix any errors that appear**

If errors occur, fix them before proceeding.

---

### Task 23: Final Commit

- [ ] **Step 1: Verify all changes are committed**

```bash
git status
```

- [ ] **Step 2: Create summary commit if needed**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: complete fun features implementation

Adds:
- Games page with Spin Wheel, Coin Flip, Team Maker
- Hall of Fame with records, iconic moments, reset history
- GIF Reactions system (preset collection)
- Milestone Slideshow with Ken Burns effect
- Invite system with native share
- Reset/seasons system

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Summary

This plan implements all fun features in 23 tasks across 8 phases:

1. **Foundation** (Tasks 1-2): Types and database migration
2. **Games Page** (Tasks 3-8): Spin Wheel, Coin Flip, Team Maker
3. **GIF Reactions** (Tasks 9-12): Preset GIFs, picker, display
4. **Hall of Fame** (Tasks 13-16): Records, iconic moments, history
5. **Slideshow** (Task 17): Ken Burns milestone slideshow
6. **Invite** (Tasks 18-19): Share link component
7. **Reset** (Task 20): Settings integration
8. **Final** (Tasks 21-23): Cleanup and verification

Each task is bite-sized (2-5 minutes) with exact code and commands.
