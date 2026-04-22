'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { IncidentLocation, TeamTrip } from '@/types';

// Client-side only check using useSyncExternalStore (avoids setState in effect)
const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

// Fix for default marker icons in webpack/next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Red marker for incidents
const incidentIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Blue marker for trips
const tripIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface MapViewProps {
  incidentLocations: IncidentLocation[];
  teamTrips: TeamTrip[];
  showIncidents?: boolean;
  showTrips?: boolean;
  onTripClick?: (trip: TeamTrip) => void;
  worldView?: boolean; // Start with full world view like Risk
}

// Component to fit bounds
function FitBounds({ locations }: { locations: Array<{ lat: number; lng: number }> }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [locations, map]);

  return null;
}

export function MapView({
  incidentLocations,
  teamTrips,
  showIncidents = true,
  showTrips = true,
  onTripClick,
  worldView = true,
}: MapViewProps) {
  const isMounted = useIsMounted();

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-white/5 rounded-xl flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50" />
      </div>
    );
  }

  // Collect all locations for bounds fitting
  const allLocations: Array<{ lat: number; lng: number }> = [];

  if (showIncidents) {
    incidentLocations.forEach((loc) => {
      allLocations.push({ lat: loc.latitude, lng: loc.longitude });
    });
  }

  if (showTrips) {
    teamTrips.forEach((trip) => {
      allLocations.push({ lat: trip.latitude, lng: trip.longitude });
    });
  }

  // World center for Risk-like view, or Netherlands for local view
  const defaultCenter: [number, number] = worldView ? [20, 0] : [52.1326, 5.2913];
  const defaultZoom = worldView ? 2 : 7;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      className="w-full h-full rounded-xl"
      style={{ background: '#1a1a2e' }}
      minZoom={2}
      maxZoom={18}
      worldCopyJump={true}
    >
      {/* Risk-style political world map showing all countries and continents */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Only fit bounds when there are markers and not in world view mode */}
      {!worldView && allLocations.length > 0 && <FitBounds locations={allLocations} />}

      {/* Incident Markers */}
      {showIncidents && incidentLocations.map((loc) => (
        <Marker
          key={loc.incident_id}
          position={[loc.latitude, loc.longitude]}
          icon={incidentIcon}
        >
          <Popup className="map-popup">
            <div className="min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{ backgroundColor: loc.friend.color }}
                >
                  {loc.friend.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{loc.friend.name}</p>
                  <p className="text-xs text-gray-500">Te laat!</p>
                </div>
              </div>
              {loc.incident.location && (
                <p className="text-sm text-gray-600 mb-1">{loc.incident.location}</p>
              )}
              {loc.incident.minutes_late && (
                <p className="text-sm text-red-600 font-medium">
                  {loc.incident.minutes_late} minuten te laat
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(loc.incident.created_at)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Trip Markers */}
      {showTrips && teamTrips.map((trip) => (
        <Marker
          key={trip.id}
          position={[trip.latitude, trip.longitude]}
          icon={tripIcon}
          eventHandlers={{
            click: () => onTripClick?.(trip),
          }}
        >
          <Popup className="map-popup">
            <div className="min-w-[200px]">
              <p className="font-semibold text-gray-900 mb-1">{trip.name}</p>
              {trip.description && (
                <p className="text-sm text-gray-600 mb-2">{trip.description}</p>
              )}
              {trip.address && (
                <p className="text-xs text-gray-500 mb-1">{trip.address}</p>
              )}
              {trip.trip_date && (
                <p className="text-xs text-blue-600">
                  {formatDate(trip.trip_date)}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
