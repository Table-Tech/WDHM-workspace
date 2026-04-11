'use client';

import { useState, useCallback } from 'react';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  isLoading: boolean;
}

interface UseCurrentLocationReturn extends LocationState {
  getCurrentLocation: () => Promise<{ latitude: number; longitude: number } | null>;
  clearLocation: () => void;
}

export function useCurrentLocation(): UseCurrentLocationReturn {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    isLoading: false,
  });

  const getCurrentLocation = useCallback(async (): Promise<{ latitude: number; longitude: number } | null> => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation wordt niet ondersteund door je browser',
        isLoading: false,
      }));
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setState({
            latitude,
            longitude,
            accuracy,
            error: null,
            isLoading: false,
          });
          resolve({ latitude, longitude });
        },
        (error) => {
          let errorMessage = 'Kon locatie niet ophalen';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Locatie toegang geweigerd';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Locatie niet beschikbaar';
              break;
            case error.TIMEOUT:
              errorMessage = 'Locatie ophalen duurde te lang';
              break;
          }
          setState(prev => ({
            ...prev,
            error: errorMessage,
            isLoading: false,
          }));
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // Cache for 1 minute
        }
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    setState({
      latitude: null,
      longitude: null,
      accuracy: null,
      error: null,
      isLoading: false,
    });
  }, []);

  return {
    ...state,
    getCurrentLocation,
    clearLocation,
  };
}
