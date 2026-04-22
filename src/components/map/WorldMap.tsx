'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { IncidentLocation } from '@/types';

// Netherlands center coordinates
const NETHERLANDS_CENTER: [number, number] = [52.1326, 5.2913];
const NETHERLANDS_ZOOM = 8;

export interface WorldMapHandle {
  centerOnNetherlands: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

interface WorldMapProps {
  incidents: IncidentLocation[];
  onIncidentClick?: (incident: IncidentLocation) => void;
}

export const WorldMap = forwardRef<WorldMapHandle, WorldMapProps>(function WorldMap({
  incidents,
  onIncidentClick,
}, ref) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    centerOnNetherlands: () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(NETHERLANDS_CENTER, NETHERLANDS_ZOOM, {
          duration: 1.5,
        });
      }
    },
    zoomIn: () => {
      mapInstanceRef.current?.zoomIn();
    },
    zoomOut: () => {
      mapInstanceRef.current?.zoomOut();
    },
  }));

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map centered on Netherlands
    const map = L.map(mapRef.current, {
      center: NETHERLANDS_CENTER,
      zoom: NETHERLANDS_ZOOM,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: false, // We'll position it ourselves
    });

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Clean, modern map tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Add/update markers when incidents change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for each incident
    incidents.forEach((incident) => {
      // Clean red marker
      const markerIcon = L.divIcon({
        className: 'custom-late-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-size: 12px;">⏰</span>
          </div>
          ${incident.incident.photo_url ? `
            <div style="
              position: absolute;
              top: -4px;
              right: -4px;
              width: 14px;
              height: 14px;
              background: #22c55e;
              border-radius: 50%;
              border: 2px solid white;
              font-size: 7px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">📷</div>
          ` : ''}
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([incident.latitude, incident.longitude], {
        icon: markerIcon,
      }).addTo(map);

      // Format date
      const date = new Date(incident.incident.created_at).toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      // Clean popup content
      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui, sans-serif;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <div style="
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: ${incident.friend.color};
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 600;
              font-size: 16px;
            ">${incident.friend.name.charAt(0).toUpperCase()}</div>
            <div>
              <div style="font-weight: 600; color: #1f2937;">${incident.friend.name}</div>
              <div style="color: #ef4444; font-size: 12px;">Te laat</div>
            </div>
          </div>
          ${incident.incident.photo_url ? `
            <img src="${incident.incident.photo_url}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;" />
          ` : ''}
          <div style="background: #f3f4f6; border-radius: 6px; padding: 8px; font-size: 13px;">
            ${incident.incident.minutes_late ? `<div style="color: #dc2626; font-weight: 500;">🕐 ${incident.incident.minutes_late} min te laat</div>` : ''}
            ${incident.incident.location ? `<div style="color: #6b7280; margin-top: 4px;">📍 ${incident.incident.location}</div>` : ''}
          </div>
          <div style="text-align: center; color: #9ca3af; font-size: 11px; margin-top: 8px;">${date}</div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280 });

      if (onIncidentClick) {
        marker.on('click', () => onIncidentClick(incident));
      }

      markersRef.current.push(marker);
    });
  }, [incidents, onIncidentClick]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full"
      style={{ background: '#e5e7eb' }}
    />
  );
});
