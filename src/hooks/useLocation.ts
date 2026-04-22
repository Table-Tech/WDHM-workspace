'use client';

import { useState, useCallback } from 'react';

interface LocationResult {
  latitude: number;
  longitude: number;
  address: string | null;
}

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  accuracy: number | null;
  error: string | null;
  isLoading: boolean;
}

interface UseCurrentLocationReturn extends LocationState {
  getCurrentLocation: () => Promise<LocationResult | null>;
  clearLocation: () => void;
}

// Reverse geocoding using OpenStreetMap Nominatim (free, no API key needed)
async function getAddressFromCoords(latitude: number, longitude: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'nl', // Dutch language preference
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.address) {
      // Build a nice readable address
      const parts: string[] = [];

      // Add street with house number
      if (data.address.road) {
        let street = data.address.road;
        if (data.address.house_number) {
          street += ' ' + data.address.house_number;
        }
        parts.push(street);
      }

      // Add neighborhood/suburb or village
      if (data.address.neighbourhood) {
        parts.push(data.address.neighbourhood);
      } else if (data.address.suburb) {
        parts.push(data.address.suburb);
      }

      // Add city/town/village
      if (data.address.city) {
        parts.push(data.address.city);
      } else if (data.address.town) {
        parts.push(data.address.town);
      } else if (data.address.village) {
        parts.push(data.address.village);
      }

      if (parts.length > 0) {
        return parts.join(', ');
      }

      // Fallback to display_name if no structured address
      return data.display_name?.split(',').slice(0, 3).join(',') || null;
    }

    return null;
  } catch (error) {
    console.error('Error getting address:', error);
    return null;
  }
}

export function useCurrentLocation(): UseCurrentLocationReturn {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    address: null,
    accuracy: null,
    error: null,
    isLoading: false,
  });

  const getCurrentLocation = useCallback(async (): Promise<LocationResult | null> => {
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
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          // Get address from coordinates
          const address = await getAddressFromCoords(latitude, longitude);

          setState({
            latitude,
            longitude,
            address,
            accuracy,
            error: null,
            isLoading: false,
          });

          resolve({ latitude, longitude, address });
        },
        (error) => {
          let errorMessage = 'Kon locatie niet ophalen';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Locatie toegang geweigerd. Sta locatie toe in je browser.';
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
          timeout: 15000,
          maximumAge: 60000, // Cache for 1 minute
        }
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    setState({
      latitude: null,
      longitude: null,
      address: null,
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
