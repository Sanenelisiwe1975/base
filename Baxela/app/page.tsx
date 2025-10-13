"use client";
import { useState, useEffect } from 'react';
import styles from "./page.module.css";
import { Wallet } from "@coinbase/onchainkit/wallet";

export default function Home() {
  const [description, setDescription] = useState('');
  const [incidentType, setIncidentType] = useState('Vote Buying');
  const [severity, setSeverity] = useState(1);
  const [file, setFile] = useState(null);
  const [location, setLocation] = useState(null);
  const [timestamp, setTimestamp] = useState(null);

  useEffect(() => {
    // Set timestamp when component mounts
    setTimestamp(new Date().toISOString());

    // Get GPS location automatically
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location: ", error);
          alert("Could not retrieve location. Please ensure location services are enabled.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 1. (Simulated) Upload to IPFS/Arweave
    // In a real app, you'd use a library like ipfs-http-client or web3.storage
    const fileHash = file ? `0x...${file.name.substring(0, 8)}...hash` : null;
    console.log("Simulated IPFS Hash:", fileHash);

    const report = {
      description,
      incidentType,
      severity,
      location,
      timestamp,
      fileHash,
    };

    // 2. (Simulated) Record hash on Base
    // In a real app, you'd use viem/ethers to call a smart contract function
    console.log("Submitting report to blockchain:", report);
    const transactionHash = `0x...transaction...hash`;
    console.log("Simulated Transaction Hash:", transactionHash);

    alert(`Incident reported! Transaction Hash: ${transactionHash}`);
  };

  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <Wallet />
      </header>

      <div className={styles.content}>
        <h1 className={styles.title}>Election Monitoring System</h1>
        <Link href="/dashboard">View Transparency Dashboard &rarr;</Link>
        <p>Report an incident to protect election integrity.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="description">Incident Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you witnessed..."
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="incidentType">Incident Type</label>
            <select id="incidentType" value={incidentType} onChange={(e) => setIncidentType(e.target.value)}>
              <option>Vote Buying</option>
              <option>Ballot Stuffing</option>
              <option>Intimidation</option>
              <option>Tampering</option>
              <option>Misinformation</option>
              <option>Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="severity">Severity (1-5)</label>
            <select id="severity" value={severity} onChange={(e) => setSeverity(Number(e.target.value))}>
              <option value={1}>1 - Low</option>
              <option value={2}>2</option>
              <option value={3}>3 - Medium</option>
              <option value={4}>4</option>
              <option value={5}>5 - High</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="file">Upload Photo/Video Evidence</label>
            <input type="file" id="file" onChange={handleFileChange} />
          </div>

          <div className={styles.formGroup}>
            <label>GPS & Timestamp</label>
            {location ? (
              <p className={styles.metadata}>
                {`Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}`}
              </p>
            ) : (
              <p className={styles.metadata}>Retrieving location...</p>
            )}
            {timestamp && <p className={styles.metadata}>{new Date(timestamp).toLocaleString()}</p>}
          </div>

          <button type="submit" className={styles.submitButton}>Report Incident</button>
        </form>
      </div>
    </div>
  );
}