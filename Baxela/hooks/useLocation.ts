import { useState, useEffect, useCallback } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export interface UseLocationReturn {
  location: LocationData | null;
  error: LocationError | null;
  isLoading: boolean;
  isPermissionGranted: boolean;
  requestLocation: () => Promise<void>;
  watchLocation: () => void;
  stopWatching: () => void;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<LocationError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Check if geolocation is supported
  const isGeolocationSupported = 'geolocation' in navigator;

  // Check permission status
  useEffect(() => {
    if (!isGeolocationSupported) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by this browser'
      });
      return;
    }

    // Check permission status if available
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setIsPermissionGranted(result.state === 'granted');
      });
    }
  }, [isGeolocationSupported]);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const locationData: LocationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp
    };
    
    setLocation(locationData);
    setError(null);
    setIsLoading(false);
    setIsPermissionGranted(true);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    const locationError: LocationError = {
      code: err.code,
      message: getErrorMessage(err.code)
    };
    
    setError(locationError);
    setIsLoading(false);
    
    if (err.code === err.PERMISSION_DENIED) {
      setIsPermissionGranted(false);
    }
  }, []);

  const requestLocation = useCallback(async (): Promise<void> => {
    if (!isGeolocationSupported) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by this browser'
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      options
    );
  }, [handleSuccess, handleError, isGeolocationSupported]);

  const watchLocation = useCallback(() => {
    if (!isGeolocationSupported || watchId !== null) return;

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000 // 30 seconds
    };

    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );

    setWatchId(id);
  }, [handleSuccess, handleError, isGeolocationSupported, watchId]);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    location,
    error,
    isLoading,
    isPermissionGranted,
    requestLocation,
    watchLocation,
    stopWatching
  };
}

function getErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return 'Location access denied by user. Please enable location permissions to use this feature.';
    case 2:
      return 'Location information is unavailable. Please check your device settings.';
    case 3:
      return 'Location request timed out. Please try again.';
    default:
      return 'An unknown error occurred while retrieving location.';
  }
}