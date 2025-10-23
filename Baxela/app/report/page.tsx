'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import styles from './report.module.css';

export default function ReportPage() {
  const [formData, setFormData] = useState({
    type: 'Vote Buying',
    severity: 3,
    location: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ success: boolean; ipfsHash?: string } | null>(null);

  // Media and analysis state
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaAnalysis, setMediaAnalysis] = useState<any>(null);
  const [textAnalysis, setTextAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'severity' ? parseInt(value, 10) : value }));
  };

  const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMedia(file);

    // Create a URL for the file preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Analyze media for deepfakes
    const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
    const mediaFormData = new FormData();
    mediaFormData.append('media', file);
    mediaFormData.append('mediaType', mediaType);

    const mediaRes = await fetch('/api/analyze-media', {
      method: 'POST',
      body: mediaFormData,
    });

    const mediaAnalysisResult = await mediaRes.json();
    setMediaAnalysis(mediaAnalysisResult);
  };

  const handleDescriptionChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    handleChange(e);

    // Analyze text
    const textRes = await fetch('/api/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const textAnalysisResult = await textRes.json();
    setTextAnalysis(textAnalysisResult);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const submitFormData = new FormData();
      if (media) {
        submitFormData.append('media', media);
      }
      submitFormData.append('type', formData.type);
      submitFormData.append('severity', formData.severity.toString());
      submitFormData.append('location', formData.location);
      submitFormData.append('description', formData.description);

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: submitFormData,
      });

      const result = await response.json();
      if (response.ok) {
        console.log('Submission successful, IPFS Hash:', result.ipfsHash);
        setSubmissionResult({ success: true, ipfsHash: result.ipfsHash });
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionResult({ success: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmissionResult(null);
    setFormData({ type: 'Vote Buying', severity: 3, location: '', description: '' });
    setMedia(null);
    setMediaPreview(null);
    setMediaAnalysis(null);
    setTextAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Report Incident</h1>
        <Link href="/dashboard" className={styles.navLink}>View Dashboard</Link>
      </header>

      <main className={styles.main}>
        {submissionResult ? (
          <div className={styles.result}>
            <h2>{submissionResult.success ? 'Submission Successful' : 'Submission Failed'}</h2>
            <p>{submissionResult.success ? 'Your report has been submitted.' : 'There was an error submitting your report.'}</p>
            {submissionResult.success && submissionResult.ipfsHash && (
              <p>
                IPFS Hash:{' '}
                <a href={`https://gateway.pinata.cloud/ipfs/${submissionResult.ipfsHash}`} target="_blank" rel="noopener noreferrer">
                  View on IPFS
                </a>
              </p>
            )}
            <button onClick={resetForm} className={styles.button}>Submit Another Report</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="media">Media (Photo or Video)</label>
              <input
                type="file"
                id="media"
                accept="image/*,video/*"
                onChange={handleMediaChange}
                ref={fileInputRef}
              />
              {mediaPreview && (
                <div className={styles.mediaPreview}>
                  {media?.type.startsWith('image/') ? (
                    <img src={mediaPreview} alt="Media preview" />
                  ) : (
                    <video src={mediaPreview} controls />
                  )}
                </div>
              )}
              {mediaAnalysis && mediaAnalysis.isDeepfake && (
                <div className={styles.warning}>
                  ⚠️ This media may be AI-generated or manipulated
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleDescriptionChange}
                required
              />
              {textAnalysis && (
                <div className={styles.analysis}>
                  Detected category: {textAnalysis?.classification}
                  (Confidence: {Math.round((textAnalysis?.confidence ?? 0) * 100)}%)
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="type">Type of Irregularity</label>
              <select id="type" name="type" value={formData.type} onChange={handleChange}>
                <option>Vote Buying</option>
                <option>Voter Intimidation</option>
                <option>Ballot Stuffing</option>
                <option>Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="severity">Severity (1-5)</label>
              <input
                type="range"
                id="severity"
                name="severity"
                min="1"
                max="5"
                value={formData.severity}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="location">Location (City or Address)</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const { latitude, longitude } = position.coords;
                          setFormData(prev => ({
                            ...prev,
                            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                          }));
                        },
                        (error) => {
                          console.error('Error getting location:', error);
                          alert('Unable to get your location. Please enter it manually.');
                        }
                      );
                    } else {
                      alert('Geolocation is not supported by this browser.');
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  📍 Use Current Location
                </button>
              </div>
            </div>

            <button type="submit" className={styles.button} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}