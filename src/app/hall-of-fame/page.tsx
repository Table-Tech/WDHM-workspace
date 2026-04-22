'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, ArrowLeft, Clock, Flame, Target, Calendar, Star, History } from 'lucide-react';
import { useRecords, useIconicMoments } from '@/hooks/useRecords';
import { useResets } from '@/hooks/useSeasons';
import { FriendAvatar } from '@/components/friends/FriendAvatar';
import type { HallOfFameRecord } from '@/types';

type Tab = 'records' | 'iconic' | 'history';

const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: 'records', label: 'Records', icon: <Trophy className="w-4 h-4" /> },
  { value: 'iconic', label: 'Iconic', icon: <Star className="w-4 h-4" /> },
  { value: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
];

function getRecordLabel(type: HallOfFameRecord['type']): string {
  switch (type) {
    case 'longest_streak':
      return 'Langste Te Laat Streak';
    case 'longest_ontime':
      return 'Langste Op Tijd Streak';
    case 'most_minutes_single':
      return 'Meeste Minuten (Enkel)';
    case 'total_minutes':
      return 'Totaal Minuten Te Laat';
    case 'most_monthly':
      return 'Meest Te Laat (Maand)';
    default:
      return 'Record';
  }
}

function getRecordIcon(type: HallOfFameRecord['type']) {
  switch (type) {
    case 'longest_streak':
      return <Flame className="w-5 h-5 text-orange-400" />;
    case 'longest_ontime':
      return <Target className="w-5 h-5 text-green-400" />;
    case 'most_minutes_single':
      return <Clock className="w-5 h-5 text-red-400" />;
    case 'total_minutes':
      return <Clock className="w-5 h-5 text-purple-400" />;
    case 'most_monthly':
      return <Calendar className="w-5 h-5 text-blue-400" />;
    default:
      return <Trophy className="w-5 h-5 text-yellow-400" />;
  }
}

function formatRecordValue(record: HallOfFameRecord): string {
  switch (record.type) {
    case 'longest_streak':
    case 'longest_ontime':
      return `${record.value}x`;
    case 'most_minutes_single':
    case 'total_minutes':
      return `${record.value} min`;
    case 'most_monthly':
      return `${record.value}x`;
    default:
      return `${record.value}`;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function HallOfFamePage() {
  const [activeTab, setActiveTab] = useState<Tab>('records');

  const { data: records = [], isLoading: recordsLoading } = useRecords();
  const { data: iconicMoments = [], isLoading: iconicLoading } = useIconicMoments();
  const { data: resets = [], isLoading: resetsLoading } = useResets();

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
          <div className="p-1.5 sm:p-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30 shrink-0">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Hall of Fame</h1>
            <p className="text-xs sm:text-sm text-white/50 truncate">Records & geschiedenis</p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`
              flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all border backdrop-blur-md
              ${activeTab === tab.value
                ? 'bg-yellow-600/80 border-yellow-400 text-white'
                : 'bg-black/40 border-white/20 text-white hover:bg-black/50 hover:border-white/30'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-black/50 backdrop-blur-xl border border-white/15 rounded-xl p-4 sm:p-6 shadow-xl">
        {/* Records Tab */}
        {activeTab === 'records' && (
          <div>
            {recordsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/50">Nog geen records</p>
                <p className="text-sm text-white/30 mt-1">
                  Voeg meer incidents toe om records te zien
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <div
                    key={`${record.type}-${record.friend.id}`}
                    className="flex items-center gap-4 p-4 bg-black/40 backdrop-blur-md border border-white/15 rounded-lg hover:bg-black/50 transition-colors"
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {getRecordIcon(record.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white">
                        {getRecordLabel(record.type)}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <FriendAvatar
                          name={record.friend.name}
                          color={record.friend.color}
                          size="sm"
                        />
                        <span className="text-sm text-white/70">
                          {record.friend.name}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 mt-1">
                        {formatDate(record.date)}
                      </p>
                    </div>

                    {/* Value */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-bold text-white">
                        {formatRecordValue(record)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Iconic Tab */}
        {activeTab === 'iconic' && (
          <div>
            {iconicLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : iconicMoments.length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/50">Nog geen iconische momenten</p>
                <p className="text-sm text-white/30 mt-1">
                  Markeer memorabele incidents als iconisch
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {iconicMoments.map((moment) => (
                  <div
                    key={moment.incident.id}
                    className="group relative aspect-square bg-black/40 backdrop-blur-md border border-white/15 rounded-lg overflow-hidden hover:ring-2 hover:ring-yellow-500/30 transition-all"
                  >
                    {/* Photo */}
                    {moment.incident.photo_url ? (
                      <Image
                        src={moment.incident.photo_url}
                        alt={`${moment.friend.name} incident`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Star className="w-12 h-12 text-white/20" />
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <FriendAvatar
                            name={moment.friend.name}
                            color={moment.friend.color}
                            size="sm"
                          />
                          <span className="text-sm font-medium text-white">
                            {moment.friend.name}
                          </span>
                        </div>
                        <p className="text-xs text-white/70">
                          {formatDate(moment.incident.created_at)}
                        </p>
                        {moment.incident.minutes_late && (
                          <p className="text-xs text-white/70 mt-1">
                            {moment.incident.minutes_late} min te laat
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Iconic badge */}
                    <div className="absolute top-2 right-2">
                      <div className="p-1.5 bg-black/60 backdrop-blur-md rounded-full border border-yellow-500/50">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            {resetsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : resets.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/50">Nog geen resets</p>
                <p className="text-sm text-white/30 mt-1">
                  Reset geschiedenis wordt hier weergegeven
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {resets.map((reset, index) => (
                  <div
                    key={reset.id}
                    className="p-4 bg-black/40 backdrop-blur-md border border-white/15 rounded-lg hover:bg-black/50 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <History className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            Seizoen {resets.length - index}
                          </h3>
                          <p className="text-xs text-white/50">
                            {formatDate(reset.reset_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          {reset.stats_snapshot.total_incidents}
                        </div>
                        <div className="text-xs text-white/50">incidents</div>
                      </div>
                    </div>

                    {/* Friend Stats */}
                    {reset.stats_snapshot.friends && reset.stats_snapshot.friends.length > 0 && (
                      <div className="space-y-2">
                        {reset.stats_snapshot.friends
                          .sort((a, b) => b.count - a.count)
                          .slice(0, 5)
                          .map((friend) => (
                            <div
                              key={friend.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-white/70">{friend.name}</span>
                              <span className="font-medium text-white">{friend.count}x</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
