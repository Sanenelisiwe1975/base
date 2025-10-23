"use client";

import { useEffect, useRef, useState } from 'react';
import { IPFSMetadata } from '@/lib/ipfs';

// Define incident data structure for the map
export interface MapIncident {
  id: string;
  hash: string;
  metadata: IPFSMetadata;
  position: [number, number]; // [latitude, longitude]
}

interface IncidentMapProps {
  incidents: MapIncident[];
  userLocation?: { latitude: number; longitude: number };
  onIncidentClick?: (incident: MapIncident) => void;
  className?: string;
  height?: string;
}

// Severity color mapping
const SEVERITY_COLORS = {
  low: '#10B981',      // green
  medium: '#F59E0B',   // yellow
  high: '#F97316',     // orange
  critical: '#EF4444'  // red
};

// Category icons (using emoji for simplicity, can be replaced with custom icons)
const CATEGORY_ICONS = {
  'Traffic Accident': '🚗',
  'Crime': '🚨',
  'Fire': '🔥',
  'Medical Emergency': '🚑',
  'Natural Disaster': '🌪️',
  'Infrastructure Issue': '🏗️',
  'Environmental Hazard': '☢️',
  'Public Safety': '⚠️',
  'Other': '📍'
};

export function IncidentMap({ 
  incidents, 
  userLocation, 
  onIncidentClick, 
  className = "",
  height = "500px" 
}: IncidentMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      try {
        // Dynamically import Leaflet to avoid SSR issues
        const L = (await import('leaflet')).default;
        
        // Import CSS
        await import('leaflet/dist/leaflet.css');

        if (!mapRef.current || mapInstanceRef.current) return;

        // Default center (can be user location or a default location)
        const defaultCenter: [number, number] = userLocation 
          ? [userLocation.latitude, userLocation.longitude]
          : [37.7749, -122.4194]; // San Francisco as default

        // Create map
        const map = L.map(mapRef.current).setView(defaultCenter, 12);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // Add user location marker if available
        if (userLocation) {
          const userIcon = L.divIcon({
            html: `<div style="
              width: 20px; 
              height: 20px; 
              background: #3B82F6; 
              border: 3px solid white; 
              border-radius: 50%; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>`,
            className: 'user-location-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup('Your Location')
            .openPopup();
        }

        mapInstanceRef.current = map;

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
        if (isMounted) {
          setMapError('Failed to load map. Please refresh the page.');
          setIsLoading(false);
        }
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation]);

  // Update incident markers
  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapInstanceRef.current || isLoading) return;

      try {
        const L = (await import('leaflet')).default;

        // Clear existing markers
        markersRef.current.forEach(marker => {
          mapInstanceRef.current.removeLayer(marker);
        });
        markersRef.current = [];

        // Add incident markers
        incidents.forEach(incident => {
          const { metadata, position } = incident;
          const severityColor = SEVERITY_COLORS[metadata.severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.medium;
          const categoryIcon = CATEGORY_ICONS[metadata.category as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.Other;

          // Create custom marker icon
          const markerIcon = L.divIcon({
            html: `
              <div style="
                position: relative;
                width: 40px;
                height: 40px;
                background: ${severityColor};
                border: 3px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                cursor: pointer;
              ">
                ${categoryIcon}
              </div>
            `,
            className: 'incident-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
          });

          // Create marker
          const marker = L.marker(position, { icon: markerIcon });

          // Create popup content
          const popupContent = `
            <div style="min-width: 250px; max-width: 300px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1F2937;">
                ${metadata.name}
              </h3>
              <div style="margin-bottom: 8px;">
                <span style="
                  display: inline-block;
                  padding: 2px 8px;
                  background: ${severityColor};
                  color: white;
                  border-radius: 12px;
                  font-size: 12px;
                  font-weight: 500;
                  margin-right: 8px;
                ">
                  ${metadata.severity.toUpperCase()}
                </span>
                <span style="
                  display: inline-block;
                  padding: 2px 8px;
                  background: #E5E7EB;
                  color: #374151;
                  border-radius: 12px;
                  font-size: 12px;
                ">
                  ${metadata.category}
                </span>
              </div>
              <p style="margin: 8px 0; font-size: 14px; color: #4B5563; line-height: 1.4;">
                ${metadata.description.length > 100 
                  ? metadata.description.substring(0, 100) + '...' 
                  : metadata.description}
              </p>
              <div style="margin-top: 8px; font-size: 12px; color: #6B7280;">
                <div>📅 ${new Date(metadata.timestamp).toLocaleString()}</div>
                <div>👤 ${metadata.reporterAddress.substring(0, 6)}...${metadata.reporterAddress.substring(-4)}</div>
                ${metadata.fileHashes.length > 0 ? `<div>📎 ${metadata.fileHashes.length} attachment(s)</div>` : ''}
              </div>
              <button 
                onclick="window.viewIncidentDetails('${incident.id}')"
                style="
                  margin-top: 12px;
                  width: 100%;
                  padding: 8px 16px;
                  background: #3B82F6;
                  color: white;
                  border: none;
                  border-radius: 6px;
                  font-size: 14px;
                  cursor: pointer;
                "
                onmouseover="this.style.background='#2563EB'"
                onmouseout="this.style.background='#3B82F6'"
              >
                View Details
              </button>
            </div>
          `;

          marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'incident-popup'
          });

          // Add click handler
          marker.on('click', () => {
            if (onIncidentClick) {
              onIncidentClick(incident);
            }
          });

          marker.addTo(mapInstanceRef.current);
          markersRef.current.push(marker);
        });

        // Fit map to show all markers if there are incidents
        if (incidents.length > 0) {
          const group = new L.featureGroup(markersRef.current);
          mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
        }

      } catch (error) {
        console.error('Failed to update markers:', error);
      }
    };

    updateMarkers();
  }, [incidents, isLoading, onIncidentClick]);

  // Global function for popup button clicks
  useEffect(() => {
    (window as any).viewIncidentDetails = (incidentId: string) => {
      const incident = incidents.find(i => i.id === incidentId);
      if (incident && onIncidentClick) {
        onIncidentClick(incident);
      }
    };

    return () => {
      delete (window as any).viewIncidentDetails;
    };
  }, [incidents, onIncidentClick]);

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
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="w-full rounded-lg overflow-hidden border border-gray-200"
        style={{ height }}
      />
      
      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000] max-w-xs">
        <h4 className="font-semibold text-gray-900 mb-3">Incident Severity</h4>
        <div className="space-y-2">
          {Object.entries(SEVERITY_COLORS).map(([severity, color]) => (
            <div key={severity} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-gray-700 capitalize">{severity}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
            <span className="text-sm text-gray-700">Your Location</span>
          </div>
        </div>
      </div>

      {/* Incident Count */}
      {incidents.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-gray-900">
              {incidents.length} incident{incidents.length !== 1 ? 's' : ''} reported
            </span>
          </div>
        </div>
      )}
    </div>
  );
}