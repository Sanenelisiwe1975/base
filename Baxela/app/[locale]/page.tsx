"use client";
import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { IDKitWidget, ISuccessResult } from '@worldcoin/idkit';
import styles from './page.module.css';

export default function ReportPage() {
  const t = useTranslations('ReportPage');
  const langT = useTranslations('Languages');
  const router = useRouter();
  const pathname = usePathname();

  const [formData, setFormData] = useState({
    type: 'Vote Buying',
    severity: 3,
    location: '',
    description: '',
  });
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ success: boolean; ipfsHash?: string } | null>(null);

  // Media and analysis state
  const [media, setMedia] = useState<File | null>(null);
  const [mediaAnalysis, setMediaAnalysis] = useState<any>(null);
  const [textAnalysis, setTextAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    // The pathname includes the current locale, so we need to remove it
    const newPath = pathname.substring(3);
    router.push(`/${newLocale}${newPath}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'severity' ? parseInt(value, 10) : value }));
  };

  const handleVerify = (result: ISuccessResult) => {
    console.log('World ID Verification Success:', result);
    setIsVerified(true);
  };

  const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMedia(file);

    // Create a URL for the file
    const mediaUrl = URL.createObjectURL(file);

    // Analyze media for deepfakes
    const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
    const mediaRes = await fetch('/api/analyze-media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaUrl, mediaType })
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
    if (!isVerified) {
      alert('Please verify with World ID first.');
      return;
    }
    setIsSubmitting(true);
    setSubmissionResult(null);

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
    setIsVerified(false);
    setMedia(null);
    setMediaAnalysis(null);
    setTextAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentLocale = pathname.substring(1, 3);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('title')}</h1>
        <Link href="/dashboard" className={styles.navLink}>{t('viewDashboard')}</Link>
      </header>

      <main className={styles.main}>
        {submissionResult ? (
          <div className={styles.result}>
            <h2>{submissionResult.success ? t('successTitle') : t('failTitle')}</h2>
            <p>{submissionResult.success ? t('successMessage') : t('failMessage')}</p>
            {submissionResult.success && submissionResult.ipfsHash && (
              <p>
                {t('ipfsHash')}{' '}
                <a href={`https://gateway.pinata.cloud/ipfs/${submissionResult.ipfsHash}`} target="_blank" rel="noopener noreferrer">
                  {t('viewOnIpfs')}
                </a>
              </p>
            )}
            <button onClick={resetForm} className={styles.button}>{t('submitAnother')}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <label htmlFor="language">{t('languageLabel')}</label>
            <select id="language" name="language" value={currentLocale} onChange={handleLanguageChange} disabled={isSubmitting}>
              <option value="en">{langT('en')}</option>
              <option value="es">{langT('es')}</option>
              <option value="fr">{langT('fr')}</option>
              <option value="de">{langT('de')}</option>
              <option value="ja">{langT('ja')}</option>
              <option value="zh">{langT('zh')}</option>
              <option value="af">{langT('af')}</option>
              <option value="nr">{langT('nr')}</option>
              <option value="nso">{langT('nso')}</option>
              <option value="st">{langT('st')}</option>
              <option value="ss">{langT('ss')}</option>
              <option value="ts">{langT('ts')}</option>
              <option value="tn">{langT('tn')}</option>
              <option value="ve">{langT('ve')}</option>
              <option value="xh">{langT('xh')}</option>
            </select>

            <label htmlFor="media">{t('mediaLabel')}</label>
            <input
              type="file"
              id="media"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              ref={fileInputRef}
            />

            {mediaAnalysis && mediaAnalysis.isDeepfake && (
              <div className={styles.warning}>
                ⚠️ This media may be AI-generated or manipulated
              </div>
            )}

            <label htmlFor="description">{t('descriptionLabel')}</label>
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

            {/* Add other form fields and submit button here as needed */}
          </form>
        )}
      </main>
    </div>
  );
}