'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { MapPin, ArrowLeft, Clock, Users, Locate } from 'lucide-react';
import { useIncidentLocations } from '@/hooks/useLocations';
import type { WorldMapHandle } from '@/components/map/WorldMap';

// Dynamic import - only loads on client
const WorldMap = dynamic(
  () => import('@/components/map/WorldMap').then((mod) => mod.WorldMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto mb-3" />
          <p className="text-gray-500">Kaart laden...</p>
        </div>
      </div>
    ),
  }
);

export default function MapPage() {
  const router = useRouter();
  const [mapReady, setMapReady] = useState(false);
  const { data: incidents = [], isLoading } = useIncidentLocations();
  const mapRef = useRef<WorldMapHandle>(null);

  useEffect(() => {
    setMapReady(true);
  }, []);

  const handleCenterOnNetherlands = () => {
    mapRef.current?.centerOnNetherlands();
  };

  // Stats
  const uniqueFriends = new Set(incidents.map((i) => i.friend.id)).size;
  const totalMinutesLate = incidents.reduce(
    (sum, i) => sum + (i.incident.minutes_late || 0),
    0
  );

  return (
    <main className="h-[100dvh] md:h-screen flex flex-col overflow-hidden bg-[#0f0f17]">
      {/* Header */}
      <header className="flex items-center justify-between p-3 sm:p-4 bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 sm:p-2 rounded-lg bg-black/40 hover:bg-black/60 border border-white/20 transition-colors backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="p-1.5 sm:p-2 rounded-xl bg-red-500/20 border border-red-500/30">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
            </div>
            <h1 className="text-base sm:text-lg font-semibold text-white">Te Laat Kaart</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-md border border-red-500/30 text-red-400 text-xs sm:text-sm">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{incidents.length}x</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-md border border-orange-500/30 text-orange-400 text-xs sm:text-sm">
            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{uniqueFriends}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-yellow-500/30 text-yellow-400 text-sm">
            <span>⏱️</span>
            <span>{totalMinutesLate} min</span>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <div className="flex-1 p-4 sm:p-6 md:p-10 flex items-center justify-center pb-20 md:pb-10">
        <div className="relative w-full h-full max-w-6xl max-h-[700px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black/30 backdrop-blur-sm">
          {/* Map */}
          <div className="absolute inset-0 z-0">
            {mapReady && (
              <WorldMap ref={mapRef} incidents={incidents} />
            )}
          </div>

          {/* UI Overlay */}
          <div className="absolute inset-0 z-[1000] pointer-events-none">
            {/* Center button */}
            <button
              onClick={handleCenterOnNetherlands}
              className="pointer-events-auto absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-black/60 hover:bg-black/70 backdrop-blur-md text-white font-medium rounded-lg shadow-lg border border-white/20 transition-all"
            >
              <Locate className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Nederland</span>
              <span>🇳🇱</span>
            </button>

            {/* Legend */}
            <div className="pointer-events-auto absolute bottom-4 left-4 bg-black/60 backdrop-blur-xl border border-white/20 rounded-lg p-3 shadow-lg text-sm hidden sm:block">
              <div className="flex items-center gap-2 text-white/80">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span>Te laat locatie</span>
              </div>
            </div>

            {/* Loading overlay */}
            {isLoading && (
              <div className="pointer-events-auto absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
