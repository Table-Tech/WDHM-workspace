'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MapPin, ArrowLeft, Plus, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddTripModal } from '@/components/map/AddTripModal';
import { useIncidentLocations, useTeamTrips } from '@/hooks/useLocations';

// Dynamic import for Leaflet (client-side only)
const MapView = dynamic(
  () => import('@/components/map/MapView').then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-white/5 rounded-xl flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50" />
      </div>
    ),
  }
);

export default function MapPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showTrips, setShowTrips] = useState(true);

  const { data: incidentLocations = [], isLoading: incidentsLoading } = useIncidentLocations();
  const { data: teamTrips = [], isLoading: tripsLoading } = useTeamTrips();

  const isLoading = incidentsLoading || tripsLoading;

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-green-500/20 border border-green-500/30">
              <MapPin className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Wereldkaart</h1>
              <p className="text-sm text-white/50">
                {incidentLocations.length} locaties, {teamTrips.length} uitjes
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-500 border-0 gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Uitje Toevoegen</span>
        </Button>
      </header>

      {/* Filter Toggles */}
      <div className="flex items-center gap-2 px-4 sm:px-6 pb-4">
        <button
          onClick={() => setShowIncidents(!showIncidents)}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all
            ${showIncidents
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-white/5 text-white/50 border border-white/10'
            }
          `}
        >
          {showIncidents ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          Te Laat ({incidentLocations.length})
        </button>
        <button
          onClick={() => setShowTrips(!showTrips)}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all
            ${showTrips
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-white/5 text-white/50 border border-white/10'
            }
          `}
        >
          {showTrips ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          Uitjes ({teamTrips.length})
        </button>
      </div>

      {/* Map Container */}
      <div className="flex-1 px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="h-full min-h-[400px] rounded-xl overflow-hidden border border-white/10">
          {isLoading ? (
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50" />
            </div>
          ) : (
            <MapView
              incidentLocations={incidentLocations}
              teamTrips={teamTrips}
              showIncidents={showIncidents}
              showTrips={showTrips}
            />
          )}
        </div>
      </div>

      {/* Empty State */}
      {!isLoading && incidentLocations.length === 0 && teamTrips.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-6 bg-black/50 rounded-xl pointer-events-auto">
            <MapPin className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/70 mb-2">Nog geen locaties</p>
            <p className="text-sm text-white/50 mb-4">
              Voeg een team uitje toe of registreer een te laat met GPS
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-500 border-0 gap-2"
            >
              <Plus className="w-4 h-4" />
              Eerste Uitje Toevoegen
            </Button>
          </div>
        </div>
      )}

      {/* Add Trip Modal */}
      <AddTripModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </main>
  );
}
