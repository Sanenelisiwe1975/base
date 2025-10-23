"use client";

import { useLocation } from "@/hooks/useLocation";
import { useState, useEffect } from "react";

interface LocationPermissionProps {
  onLocationGranted?: (location: { latitude: number; longitude: number }) => void;
  className?: string;
}

export function LocationPermission({ onLocationGranted, className = "" }: LocationPermissionProps) {
  const { 
    location, 
    error, 
    isLoading, 
    isPermissionGranted, 
    requestLocation 
  } = useLocation();
  
  const [hasRequestedOnce, setHasRequestedOnce] = useState(false);

  const handleRequestLocation = async () => {
    setHasRequestedOnce(true);
    await requestLocation();
  };

  // Call callback when location is obtained
  useEffect(() => {
    if (location && onLocationGranted) {
      onLocationGranted({
        latitude: location.latitude,
        longitude: location.longitude
      });
    }
  }, [location, onLocationGranted]);

  if (isPermissionGranted && location) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800">
              Location Access Granted
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Your location is being tracked for incident reporting.
            </p>
            <p className="text-xs text-green-600 mt-1">
              Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Location Access Error
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {error.message}
            </p>
            {error.code === 1 && (
              <div className="mt-3">
                <p className="text-xs text-red-600 mb-2">
                  To enable location access:
                </p>
                <ul className="text-xs text-red-600 list-disc list-inside space-y-1">
                  <li>Click the location icon in your browser's address bar</li>
                  <li>Select "Allow" for location permissions</li>
                  <li>Refresh the page and try again</li>
                </ul>
              </div>
            )}
            <button
              onClick={handleRequestLocation}
              disabled={isLoading}
              className="mt-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200"
            >
              {isLoading ? "Requesting..." : "Try Again"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            Location Access Required
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            This app needs access to your location to create accurate incident reports with geographic data.
          </p>
          <div className="mt-3">
            <h4 className="text-xs font-medium text-blue-800 mb-1">Why we need location:</h4>
            <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
              <li>Pin incidents to exact locations on the map</li>
              <li>Add location metadata to your reports</li>
              <li>Help emergency services find incidents quickly</li>
              <li>Generate location-based analytics</li>
            </ul>
          </div>
          <button
            onClick={handleRequestLocation}
            disabled={isLoading}
            className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Requesting Location...</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{hasRequestedOnce ? "Request Again" : "Enable Location Access"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}