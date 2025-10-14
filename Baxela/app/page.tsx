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
    language: 'en', // Default language
  });
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ success: boolean; ipfsHash?: string } | null>(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      alert('Please complete the World ID verification process first.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        console.log('Submission successful, IPFS Hash:', result.ipfsHash);
        setSubmissionResult({ success: true, ipfsHash: result.ipfsHash });
      } else {
        console.error('Submission failed:', result);
        setSubmissionResult({ success: false });
      }
    } catch (error) {
      console.error('Error submitting incident:', error);
      setSubmissionResult({ success: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmissionResult(null);
    setFormData({ type: 'Vote Buying', severity: 3, location: '', description: '', language: 'en' });
    setIsVerified(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Report an Incident</h1>
        <Link href="/dashboard" className={styles.navLink}>View Dashboard &rarr;</Link>
      </header>

      <main className={styles.main}>
        {submissionResult ? (
          <div className={styles.successMessage}>
            {submissionResult.success ? (
              <>
                <h2>Thank you!</h2>
                <p>Your incident report has been permanently stored on IPFS.</p>
                <p>
                  <strong>IPFS Hash:</strong>{' '}
                  <a 
                    href={`https://gateway.pinata.cloud/ipfs/${submissionResult.ipfsHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {submissionResult.ipfsHash}
                  </a>
                </p>
              </>
            ) : (
              <h2>Submission Failed</h2>
            )}
            <button onClick={resetForm} className={styles.submitButton}>Submit Another Report</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Form fields remain the same */}
            <label htmlFor="language">Language</label>
            <select id="language" name="language" value={formData.language} onChange={handleChange} disabled={isSubmitting}>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
              <option value="af">Afrikaans</option>
              <option value="nr">isiNdebele</option>
              <option value="nso">Sepedi</option>
              <option value="st">Sesotho</option>
              <option value="ss">siSwati</option>
              <option value="ts">Xitsonga</option>
              <option value="tn">Setswana</option>
              <option value="ve">Tshivenḓa</option>
              <option value="xh">isiXhosa</option>
              <option value="zu">isiZulu</option>
            </select>

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
              placeholder="e.g., 'Sekhukhune, Sk' or '40.7128, -74.0060'"
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