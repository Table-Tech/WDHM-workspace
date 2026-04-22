'use client';

import { useState } from 'react';
import {
  Settings,
  Users,
  Calendar,
  Receipt,
  LayoutDashboard,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { SpreadsheetProvider } from '@/contexts/SpreadsheetContext';
import { InstellingenTab } from './InstellingenTab';
import { KlantenMRRTab } from './KlantenMRRTab';
import { MaandoverzichtTab } from './MaandoverzichtTab';
import { EenmaligeInkomstenTab } from './EenmaligeInkomstenTab';
import { DashboardTab } from './DashboardTab';

type TabId = 'instellingen' | 'klanten' | 'maandoverzicht' | 'eenmalig' | 'dashboard';

interface Tab {
  id: TabId;
  label: string;
  icon: typeof Settings;
}

const TABS: Tab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'klanten', label: 'Klanten', icon: Users },
  { id: 'maandoverzicht', label: 'Maandoverzicht', icon: Calendar },
  { id: 'eenmalig', label: 'Eenmalig', icon: Receipt },
  { id: 'instellingen', label: 'Instellingen', icon: Settings },
];

function SpreadsheetContent() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  const renderTab = () => {
    switch (activeTab) {
      case 'instellingen':
        return <InstellingenTab />;
      case 'klanten':
        return <KlantenMRRTab />;
      case 'maandoverzicht':
        return <MaandoverzichtTab />;
      case 'eenmalig':
        return <EenmaligeInkomstenTab />;
      case 'dashboard':
        return <DashboardTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Compact Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Left: Back + Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4 text-zinc-400" />
              </Link>
              <div className="flex items-center gap-2">
                <Image src="/logo.jpeg" alt="Logo" width={28} height={28} className="rounded-lg" />
                <span className="text-sm font-semibold text-white">TechTable</span>
                <span className="text-xs text-zinc-500">Financieel 2026</span>
              </div>
            </div>

            {/* Tabs */}
            <nav className="flex items-center gap-0.5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1600px] mx-auto px-4 py-4">
        {renderTab()}
      </main>
    </div>
  );
}

export function Spreadsheet() {
  return (
    <SpreadsheetProvider>
      <SpreadsheetContent />
    </SpreadsheetProvider>
  );
}
