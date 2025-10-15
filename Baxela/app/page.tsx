'use client';

import Link from 'next/link';
import styles from './landing.module.css';

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Baxela</h1>
        <nav className={styles.nav}>
          <Link href="/report" className={styles.navLink}>Report an Incident</Link>
          <Link href="/dashboard" className={styles.navLink}>View Dashboard</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h2 className={styles.heroTitle}>Democracy. Verified by You.</h2>
          <p className={styles.heroSubtitle}>A citizen-driven platform for transparent and secure election monitoring.</p>
        </section>

        <section className={styles.howItWorks}>
          <h3 className={styles.sectionTitle}>How It Works</h3>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h4 className={styles.stepTitle}>Report</h4>
              <p>Submit a report of an electoral irregularity with media evidence.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h4 className={styles.stepTitle}>Publish</h4>
              <p>Your report is published to a decentralized map on IPFS.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h4 className={styles.stepTitle}>View</h4>
              <p>Browse all verified reports on a public dashboard.</p>
            </div>
          </div>
        </section>

        <section className={styles.features}>
          <h3 className={styles.sectionTitle}>Key Features</h3>
          <div className={styles.featureGrid}>
            <div className={styles.feature}>
              <h4 className={styles.featureTitle}>Decentralized Storage</h4>
              <p>All reports are stored on IPFS, ensuring they are tamper-proof and permanently accessible.</p>
            </div>
            <div className={styles.feature}>
              <h4 className={styles.featureTitle}>AI Verification</h4>
              <p>AI-powered analysis of media and text helps to identify deepfakes and classify reports.</p>
            </div>
            <div className={styles.feature}>
              <h4 className={styles.featureTitle}>Map Transparency</h4>
              <p>A real-time map provides a clear and accessible overview of all reported incidents.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2025 Baxela. All rights reserved.</p>
      </footer>
    </div>
  );
}