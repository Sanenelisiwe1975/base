"use client";
import { useState } from 'react';
import Image from "next/image";
import styles from "./page.module.css";
import { Wallet } from "@coinbase/onchainkit/wallet";

export default function Home() {
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('low');
  const [file, setFile] = useState(null);
  const [location, setLocation] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log({ description, severity, file, location });
  };

  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <Wallet />
      </header>

      <div className={styles.content}>
        <h1 className={styles.title}>Election Monitoring System</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="description">Incident Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="severity">Severity</label>
            <select id="severity" value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="file">Upload Photo/Video</label>
            <input type="file" id="file" onChange={handleFileChange} />
          </div>
          <div className={styles.formGroup}>
            <button type="button" onClick={getLocation}>Get GPS Location</button>
            {location && (
              <p>
                Latitude: {location.latitude}, Longitude: {location.longitude}
              </p>
            )}
          </div>
          <button type="submit" className={styles.submitButton}>Report Incident</button>
        </form>
      </div>
    </div>
  );
}