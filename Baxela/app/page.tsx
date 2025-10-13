"use client";
import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { IDKitWidget, ISuccessResult } from '@worldcoin/idkit';

export default function ReportPage() {
  const [formData, setFormData] = useState({
    type: 'Vote Buying',
    severity: 3,
    location: '',
    description: '',
  });
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVerify = (result: ISuccessResult) => {
    // In a real app, you'd want to send the proof to your backend for verification
    console.log('World ID Verification Success:', result);
    setIsVerified(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isVerified) {
      alert('Please verify your identity with World ID before submitting.');
      return;
    }
    console.log('Submitting incident report:', formData);
    // Here you would typically send the data to a backend or smart contract
    setIsSubmitted(true);
    // Reset form after submission
    setFormData({
      type: 'Vote Buying',
      severity: 3,
      location: '',
      description: '',
    });
    setIsVerified(false); // Require re-verification for new report
    setTimeout(() => setIsSubmitted(false), 5000); // Reset submission status message
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Report an Incident</h1>
        <Link href="/dashboard" className={styles.navLink}>View Dashboard &rarr;</Link>
      </header>

      <main className={styles.main}>
        {isSubmitted ? (
          <div className={styles.successMessage}>
            <h2>Thank you!</h2>
            <p>Your incident report has been submitted for verification.</p>
            <Link href="/dashboard">View it on the dashboard</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <label htmlFor="type">Incident Type</label>
            <select id="type" name="type" value={formData.type} onChange={handleChange}>
              <option>Vote Buying</option>
              <option>Ballot Stuffing</option>
              <option>Intimidation</option>
              <option>Tampering</option>
              <option>Misinformation</option>
              <option>Other</option>
            </select>

            <label htmlFor="severity">Perceived Severity (1-5)</label>
            <input
              type="range"
              id="severity"
              name="severity"
              min="1"
              max="5"
              value={formData.severity}
              onChange={handleChange}
            />
            <span>{formData.severity}</span>

            <label htmlFor="location">Location (City, State, or GPS)</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="e.g., 'New York, NY' or '40.7128, -74.0060'"
              value={formData.location}
              onChange={handleChange}
              required
            />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Provide a brief, factual description of the incident."
              value={formData.description}
              onChange={handleChange}
            ></textarea>

            <div className={styles.verificationSection}>
              <IDKitWidget
                app_id={process.env.NEXT_PUBLIC_WLD_APP_ID as string}
                action="submit-report"
                onSuccess={handleVerify}
              >
                {({ open }) => (
                  <button type="button" onClick={open} className={styles.worldIdButton}>
                    Verify with World ID
                  </button>
                )}
              </IDKitWidget>

              <button type="submit" className={styles.submitButton} disabled={!isVerified}>
                {isVerified ? 'Submit Report' : 'Verification Required'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}