"use client";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import styles from './dashboard.module.css';

// Dynamically import the Map component to prevent SSR issues with Leaflet
const Map = dynamic(() => import('./Map'), { ssr: false });
const UserLocationMap = dynamic(() => import('../../components/UserLocationMap').then(mod => ({ default: mod.UserLocationMap })), { ssr: false });

interface Incident {
  type: string;
  severity: number;
  location: string;
  description: string;
  mediaHash: string | null;
  mediaAnalysis: any;
  textAnalysis: any;
  timestamp: string;
}

export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Fetch the list of IPFS hashes from our API
        const hashesRes = await fetch('/api/incidents');
        if (!hashesRes.ok) {
          throw new Error('Failed to fetch incident list.');
        }
        const { hashes } = await hashesRes.json();

        if (hashes.length === 0) {
          setIncidents([]);
          return;
        }

        // 2. Fetch the JSON data for each hash from the IPFS gateway
        const incidentPromises = hashes.map((hash: string) =>
          fetch(`https://gateway.pinata.cloud/ipfs/${hash}`).then(res => {
            if (!res.ok) {
              console.error(`Failed to fetch data for hash: ${hash}`);
              return null; // Return null for failed fetches
            }
            return res.json();
          })
        );
        
        const settledIncidents = await Promise.all(incidentPromises);
        const validIncidents = settledIncidents
          .filter(incident => incident !== null) // Filter out any that failed
          .map(incident => ({ ...incident, severity: parseInt(incident.severity, 10) })); // Parse severity to a number
      
        setIncidents(validIncidents);
      
      } catch (err) {
        console.error("Error loading incidents:", err);
        // Instead of showing an error, treat this as "no incidents available"
        // This allows the dashboard to gracefully fall back to the global map
        setIncidents([]);
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Transparency Dashboard</h1>
        <Link href="/" className={styles.navLink}>&larr; Report an Incident</Link>
      </header>
      <main className={styles.main}>
        <div className={styles.mapContainer}>
          {isLoading && <p>Loading incident data...</p>}
          {!isLoading && incidents.length > 0 && <Map incidents={incidents} />}
          {!isLoading && incidents.length === 0 && (
            <UserLocationMap 
              className={styles.userLocationMap} 
              height="600px" 
            />
          )}
        </div>
        <div className={styles.summary}>
          <h2>{incidents.length > 0 ? 'Live Incidents' : 'Global Community'}</h2>
          <p>
            {isLoading
              ? 'Loading...'
              : incidents.length > 0
              ? `Tracking ${incidents.length} verified incident(s) on the decentralized network.`
              : 'No incidents to display at the moment. This could be due to no recent reports or temporary connectivity issues. Explore our global community of users below.'}
          </p>
          <p className={styles.disclaimer}>
            {incidents.length > 0
              ? 'This map displays real-time, user-submitted reports that have been permanently stored on IPFS.'
              : 'This map shows the global distribution of Baxela users. When incidents are reported, they will appear here with verified data from IPFS.'}
          </p>
        </div>
      </main>
    </div>
  );
}