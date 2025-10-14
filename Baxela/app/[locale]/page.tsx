"use client";
import { useState } from 'react';
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
              <option value="zu">{langT('zu')}</option>
            </select>

            <label htmlFor="type">{t('incidentTypeLabel')}</label>
            <select id="type" name="type" value={formData.type} onChange={handleChange} disabled={isSubmitting}>
              <option value="Vote Buying">{t('types.voteBuying')}</option>
              <option value="Ballot Stuffing">{t('types.ballotStuffing')}</option>
              <option value="Intimidation">{t('types.intimidation')}</option>
              <option value="Tampering">{t('types.tampering')}</option>
              <option value="Misinformation">{t('types.misinformation')}</option>
              <option value="Other">{t('types.other')}</option>
            </select>

            <label htmlFor="severity">{t('severityLabel')}</label>
            <input type="range" id="severity" name="severity" min="1" max="5" value={formData.severity} onChange={handleChange} disabled={isSubmitting} />

            <label htmlFor="location">{t('locationLabel')}</label>
            <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required disabled={isSubmitting} />

            <label htmlFor="description">{t('descriptionLabel')}</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} required disabled={isSubmitting} />

            <div className={styles.actions}>
              <IDKitWidget
                app_id={process.env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`}
                action={process.env.NEXT_PUBLIC_WLD_ACTION!}
                onSuccess={handleVerify}
                handleVerify={handleVerify}
              >
                {({ open }) => (
                  <button type="button" onClick={open} disabled={isVerified} className={styles.button}>
                    {t('verifyButton')}
                  </button>
                )}
              </IDKitWidget>
              <button type="submit" disabled={!isVerified || isSubmitting} className={styles.button}>
                {isSubmitting ? t('submitting') : t('submitButton')}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}