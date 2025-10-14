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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVerify = async (result: ISuccessResult) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proof: result, action: 'submit-report' }),
      });

      if (response.ok) {
        console.log('Backend verification successful');
        setIsVerified(true);
      } else {
        const errorData = await response.json();
        console.error('Backend verification failed:', errorData);
        alert('Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error calling verification API:', error);
      alert('An error occurred during verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isVerified) {
      alert('Please complete the World ID verification process first.');
      return;
    }
    setIsSubmitting(true);
    console.log('Submitting incident report:', formData);
    // Simulate backend submission
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
      setFormData({ type: 'Vote Buying', severity: 3, location: '', description: '' });
      setIsVerified(false);
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1000);
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
            <select id="type" name="type" value={formData.type} onChange={handleChange} disabled={isSubmitting}>
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Provide a brief, factual description of the incident."
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
            ></textarea>

            <div className={styles.verificationSection}>
              <IDKitWidget
                app_id={process.env.NEXT_PUBLIC_WLD_APP_ID as string}
                action="submit-report"
                onSuccess={handleVerify}
              >
                {({ open }) => (
                  <button type="button" onClick={open} className={styles.worldIdButton} disabled={isSubmitting || isVerified}>
                    {isVerified ? '✓ Verified' : '1. Verify with World ID'}
                  </button>
                )}
              </IDKitWidget>

              <button type="submit" className={styles.submitButton} disabled={!isVerified || isSubmitting}>
                {isSubmitting ? 'Submitting...' : '2. Submit Report'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}