'use client';

import React, { useEffect, useState } from 'react';

interface TranslationProviderProps {
  children: React.ReactNode;
}

// Simple translation context without i18next to avoid Set objects
const TranslationContext = React.createContext<{
  t: (key: string) => string;
  language: string;
  changeLanguage: (lang: string) => void;
}>({
  t: (key: string) => key,
  language: 'en',
  changeLanguage: () => {},
});

export const useTranslation = () => React.useContext(TranslationContext);

export default function TranslationProvider({ children }: TranslationProviderProps) {
  const [language, setLanguage] = useState('en');

  // Simple translation function - returns key as fallback
  const t = (key: string): string => {
    // For now, just return the key. You can implement actual translations later
    return key;
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
  };

  useEffect(() => {
    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    const supportedLanguages = ['en', 'es', 'fr', 'de', 'pt', 'it', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'nl'];
    
    if (supportedLanguages.includes(browserLang)) {
      setLanguage(browserLang);
    }
  }, []);

  // Simple RTL detection
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(language);

  return (
    <TranslationContext.Provider value={{ t, language, changeLanguage }}>
      <div className={isRTL ? 'rtl' : 'ltr'} dir={isRTL ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </TranslationContext.Provider>
  );
}