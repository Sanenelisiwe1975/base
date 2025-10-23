"use client";

import { useEffect, useRef, useState } from 'react';
import { useBaseAccount } from './FeatureAccess';
import { useLocation } from '../hooks/useLocation';

interface UserLocation {
  address: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  isOnline: boolean;
  lastSeen: number;
}

interface UserLocationMapProps {
  className?: string;
  height?: string;
}

export function UserLocationMap({ className = "", height = "600px" }: UserLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
  const [shareLocation, setShareLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { isConnected, address } = useBaseAccount();
  const { location, requestLocation, isPermissionGranted } = useLocation();

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        if (typeof window === 'undefined') return;

        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Load Leaflet JS
        const L = await import('leaflet');
        
        // Fix default icon issue
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        setIsMapLoaded(true);
      } catch (error) {
        console.error('Failed to load Leaflet:', error);
        setMapError('Failed to load map library');
      }
    };

    loadLeaflet();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const initializeMap = async () => {
      try {
        const L = await import('leaflet');
        
        // Create map instance
        mapInstanceRef.current = L.map(mapRef.current, {
          center: [20, 0], // Global view
          zoom: 2,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          dragging: true,
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(mapInstanceRef.current);

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize map:', error);
        setMapError('Failed to initialize map');
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isMapLoaded]);

  // Load user locations from localStorage and simulate some global users
  useEffect(() => {
    const loadUserLocations = () => {
      const savedLocations = localStorage.getItem('globalUserLocations');
      let locations: UserLocation[] = [];

      if (savedLocations) {
        try {
          locations = JSON.parse(savedLocations);
        } catch (error) {
          console.error('Failed to parse saved locations:', error);
        }
      }

      // Add some simulated global users for demonstration
      const simulatedUsers: UserLocation[] = [
        {
          address: '0x1234...5678',
          latitude: 40.7128,
          longitude: -74.0060,
          timestamp: Date.now() - 300000, // 5 minutes ago
          isOnline: true,
          lastSeen: Date.now() - 60000 // 1 minute ago
        },
        {
          address: '0x2345...6789',
          latitude: 51.5074,
          longitude: -0.1278,
          timestamp: Date.now() - 600000, // 10 minutes ago
          isOnline: true,
          lastSeen: Date.now() - 120000 // 2 minutes ago
        },
        {
          address: '0x3456...7890',
          latitude: 35.6762,
          longitude: 139.6503,
          timestamp: Date.now() - 900000, // 15 minutes ago
          isOnline: false,
          lastSeen: Date.now() - 1800000 // 30 minutes ago
        },
        {
          address: '0x4567...8901',
          latitude: -33.8688,
          longitude: 151.2093,
          timestamp: Date.now() - 1200000, // 20 minutes ago
          isOnline: true,
          lastSeen: Date.now() - 180000 // 3 minutes ago
        },
        {
          address: '0x5678...9012',
          latitude: 55.7558,
          longitude: 37.6176,
          timestamp: Date.now() - 1500000, // 25 minutes ago
          isOnline: false,
          lastSeen: Date.now() - 3600000 // 1 hour ago
        }
      ];

      // Add current user if connected and sharing location
      if (isConnected && address && location && shareLocation) {
        const currentUser: UserLocation = {
          address: address,
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: location.timestamp,
          isOnline: true,
          lastSeen: Date.now()
        };
        
        // Remove any existing entry for current user
        locations = locations.filter(loc => loc.address !== address);
        locations.unshift(currentUser);
      }

      // Merge with simulated users (avoid duplicates)
      simulatedUsers.forEach(simUser => {
        if (!locations.find(loc => loc.address === simUser.address)) {
          locations.push(simUser);
        }
      });

      setUserLocations(locations);
      
      // Save updated locations
      localStorage.setItem('globalUserLocations', JSON.stringify(locations));
    };

    loadUserLocations();
  }, [isConnected, address, location, shareLocation]);

  // Update markers on map
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;

    const updateMarkers = async () => {
      try {
        const L = await import('leaflet');

        // Clear existing markers
        markersRef.current.forEach(marker => {
          mapInstanceRef.current.removeLayer(marker);
        });
        markersRef.current = [];

        // Create custom icons for online/offline users
        const onlineIcon = L.divIcon({
          className: 'custom-user-marker online',
          html: `
            <div style="
              width: 20px;
              height: 20px;
              background-color: #22c55e;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              position: relative;
            ">
              <div style="
                position: absolute;
                top: -2px;
                right: -2px;
                width: 8px;
                height: 8px;
                background-color: #16a34a;
                border: 1px solid white;
                border-radius: 50%;
              "></div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const offlineIcon = L.divIcon({
          className: 'custom-user-marker offline',
          html: `
            <div style="
              width: 16px;
              height: 16px;
              background-color: #6b7280;
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              opacity: 0.7;
            "></div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        const currentUserIcon = L.divIcon({
          className: 'custom-user-marker current',
          html: `
            <div style="
              width: 24px;
              height: 24px;
              background-color: #3b82f6;
              border: 4px solid white;
              border-radius: 50%;
              box-shadow: 0 3px 6px rgba(0,0,0,0.3);
              position: relative;
            ">
              <div style="
                position: absolute;
                top: -3px;
                right: -3px;
                width: 10px;
                height: 10px;
                background-color: #1d4ed8;
                border: 2px solid white;
                border-radius: 50%;
                animation: pulse 2s infinite;
              "></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        // Add markers for each user location
        userLocations.forEach(userLoc => {
          const isCurrentUser = userLoc.address === address;
          const icon = isCurrentUser ? currentUserIcon : (userLoc.isOnline ? onlineIcon : offlineIcon);
          
          const marker = L.marker([userLoc.latitude, userLoc.longitude], { icon })
            .addTo(mapInstanceRef.current);

          const timeSinceLastSeen = Date.now() - userLoc.lastSeen;
          const lastSeenText = timeSinceLastSeen < 60000 
            ? 'Just now'
            : timeSinceLastSeen < 3600000 
            ? `${Math.floor(timeSinceLastSeen / 60000)} minutes ago`
            : `${Math.floor(timeSinceLastSeen / 3600000)} hours ago`;

          const popupContent = `
            <div style="min-width: 200px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <div style="
                  width: 12px;
                  height: 12px;
                  background-color: ${userLoc.isOnline ? '#22c55e' : '#6b7280'};
                  border-radius: 50%;
                "></div>
                <strong>${isCurrentUser ? 'You' : userLoc.address.slice(0, 6) + '...' + userLoc.address.slice(-4)}</strong>
              </div>
              <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                Status: ${userLoc.isOnline ? 'Online' : 'Offline'}
              </div>
              <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                Last seen: ${lastSeenText}
              </div>
              <div style="font-size: 12px; color: #666;">
                Location: ${userLoc.latitude.toFixed(4)}, ${userLoc.longitude.toFixed(4)}
              </div>
              ${isCurrentUser ? '<div style="font-size: 11px; color: #3b82f6; margin-top: 4px;">This is your location</div>' : ''}
            </div>
          `;

          marker.bindPopup(popupContent, {
            maxWidth: 250,
            className: 'user-location-popup'
          });

          markersRef.current.push(marker);
        });

        // Fit map to show all markers if there are any
        if (userLocations.length > 0) {
          const group = new L.featureGroup(markersRef.current);
          mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
        }

      } catch (error) {
        console.error('Failed to update markers:', error);
      }
    };

    updateMarkers();
  }, [userLocations, address, isMapLoaded]);

  const handleShareLocationToggle = async () => {
    if (!shareLocation && !location) {
      // Request location permission first
      await requestLocation();
    }
    setShareLocation(!shareLocation);
  };

  if (mapError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`} style={{ height }}>
        <div className="text-center p-6">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Map Error</h3>
          <p className="text-gray-600">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="rounded-lg overflow-hidden border border-gray-200"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading global user map...</p>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-20 max-w-xs">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Global User Activity</h3>
        
        <div className="space-y-2 text-xs text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Online users ({userLocations.filter(u => u.isOnline).length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full opacity-70"></div>
            <span>Offline users ({userLocations.filter(u => !u.isOnline).length})</span>
          </div>
          {isConnected && address && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Your location</span>
            </div>
          )}
        </div>

        {isConnected && (
          <div className="border-t pt-3">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={shareLocation}
                onChange={handleShareLocationToggle}
                className="rounded border-gray-300"
              />
              <span>Share my location</span>
            </label>
            {!isPermissionGranted && (
              <p className="text-xs text-amber-600 mt-1">
                Location permission required
              </p>
            )}
          </div>
        )}

        {!isConnected && (
          <div className="border-t pt-3">
            <p className="text-xs text-gray-500">
              Connect your Base Account to share your location and see other users
            </p>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-20 max-w-sm">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Community Map</h4>
        <p className="text-xs text-gray-600 mb-2">
          This map shows the global distribution of Baxela users who have opted to share their locations. 
          When incidents are reported, this view helps visualize our community's reach.
        </p>
        <div className="text-xs text-gray-500">
          Total active users: {userLocations.length}
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}