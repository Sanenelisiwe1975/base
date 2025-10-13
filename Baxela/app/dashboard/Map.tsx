"use client";
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const getSeverityColor = (severity) => {
  if (severity >= 5) return 'red';
  if (severity >= 3) return 'orange';
  return 'yellow';
};

const Map = ({ incidents }) => {
  const defaultPosition = [34.0522, -118.2437]; // Default to Los Angeles

  return (
    <MapContainer center={defaultPosition} zoom={4} style={{ height: '100%', width: '100%', borderRadius: '8px' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {incidents.map(incident => (
        <CircleMarker
          key={incident.id}
          center={[incident.location.lat, incident.location.lon]}
          radius={5 + incident.severity * 2} // Radius based on severity
          pathOptions={{
            color: getSeverityColor(incident.severity),
            fillColor: getSeverityColor(incident.severity),
            fillOpacity: 0.5,
          }}
        >
          <Popup>
            <b>{incident.type}</b><br />
            Severity: {incident.severity}/5<br />
            Votes: {incident.votes}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

export default Map;