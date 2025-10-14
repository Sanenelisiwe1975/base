"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Fix for default icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    const heatLayer = (L as any).heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 18,
      gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};

const Map = ({ incidents }) => {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    const geocodeIncident = async (incident) => {
      // Check if location is already GPS coordinates
      const gpsMatch = incident.location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
      if (gpsMatch) {
        return { ...incident, lat: parseFloat(gpsMatch[1]), lng: parseFloat(gpsMatch[2]) };
      }

      // Geocode location name using a free API
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(incident.location)}&format=json&limit=1`);
        const data = await response.json();
        if (data && data.length > 0) {
          return { ...incident, lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
      return null; // Return null if geocoding fails
    };

    const processIncidents = async () => {
      const geocodedPromises = incidents.map(geocodeIncident);
      const geocodedIncidents = (await Promise.all(geocodedPromises)).filter(Boolean);
      
      const heatPoints = geocodedIncidents.map(p => [p.lat, p.lng, p.severity / 5]); // lat, lng, intensity
      setPoints(geocodedIncidents);
    };

    if (incidents.length > 0) {
      processIncidents();
    } else {
      setPoints([]);
    }
  }, [incidents]);

  const center: [number, number] = [20, 0]; // Default center

  return (
    <MapContainer center={center} zoom={2} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {points.length > 0 && <HeatmapLayer points={points.map(p => [p.lat, p.lng, p.severity / 5])} />}
      {points.map((point, idx) => (
        <Marker key={idx} position={[point.lat, point.lng]}>
          <Popup>
            <strong>{point.type}</strong><br />
            Severity: {point.severity}/5<br />
            Location: {point.location}<br />
            Description: {point.description}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;