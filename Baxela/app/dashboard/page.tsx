"use client";
import { useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from './dashboard.module.css';

// Dynamically import the Map component to ensure it's only rendered on the client side
const Map = dynamic(() => import('./Map'), { 
  ssr: false,
  loading: () => <p>Loading map...</p>
});

const initialIncidents = [
  { id: 1, type: 'Vote Buying', severity: 4, location: { lat: 34.0522, lon: -118.2437 }, timestamp: new Date().toISOString(), verified: true, votes: 12 },
  { id: 2, type: 'Intimidation', severity: 5, location: { lat: 40.7128, lon: -74.0060 }, timestamp: new Date().toISOString(), verified: false, votes: 5 },
  { id: 3, type: 'Ballot Stuffing', severity: 5, location: { lat: 41.8781, lon: -87.6298 }, timestamp: new Date().toISOString(), verified: true, votes: 28 },
  { id: 4, type: 'Misinformation', severity: 2, location: { lat: 34.0522, lon: -118.2437 }, timestamp: new Date().toISOString(), verified: false, votes: -3 },
  { id: 5, type: 'Tampering', severity: 3, location: { lat: 29.7604, lon: -95.3698 }, timestamp: new Date().toISOString(), verified: true, votes: 15 },
  { id: 6, type: 'Other', severity: 1, location: { lat: 39.9526, lon: -75.1652 }, timestamp: new Date().toISOString(), verified: false, votes: 1 },
];

const incidentTypes = ['All', 'Vote Buying', 'Ballot Stuffing', 'Intimidation', 'Tampering', 'Misinformation', 'Other'];

export default function Dashboard() {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const handleVote = (id, voteType) => {
    setIncidents(incidents.map(incident => 
      incident.id === id ? { ...incident, votes: incident.votes + (voteType === 'up' ? 1 : -1) } : incident
    ));
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      const typeMatch = filterType === 'All' || incident.type === filterType;
      const statusMatch = filterStatus === 'All' || (filterStatus === 'Verified' && incident.verified) || (filterStatus === 'Pending' && !incident.verified);
      return typeMatch && statusMatch;
    });
  }, [incidents, filterType, filterStatus]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Transparency Dashboard</h1>
        <Link href="/" className={styles.navLink}>&larr; Back to Report</Link>
      </header>

      <div className={styles.main}>
        <div className={styles.mapContainer}>
          <Map incidents={filteredIncidents} />
        </div>

        <div className={styles.incidentList}>
          <div className={styles.filterControls}>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              {incidentTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {filteredIncidents.map(incident => (
            <div key={incident.id} className={`${styles.incidentCard} ${incident.verified ? styles.verified : ''}`}>
              <div className={styles.cardHeader}>
                <h3>{incident.type}</h3>
                <span className={styles.timestamp}>{new Date(incident.timestamp).toLocaleTimeString()}</span>
              </div>
              <p>Severity: {incident.severity}/5</p>
              <p>Location: {incident.location.lat.toFixed(2)}, {incident.location.lon.toFixed(2)}</p>
              <p>Status: {incident.verified ? 'Verified' : 'Pending Verification'}</p>
              <div className={styles.votingSection}>
                <button onClick={() => handleVote(incident.id, 'up')}>⬆️</button>
                <span>{incident.votes}</span>
                <button onClick={() => handleVote(incident.id, 'down')}>⬇️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}