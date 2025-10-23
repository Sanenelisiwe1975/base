'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from './TranslationProvider';
import { languageDetectionService } from '../lib/languageDetection';

interface LanguageSelectorProps {
  className?: string;
}

export default function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

  const supportedLanguages = languageDetectionService.getSupportedLanguages();

  useEffect(() => {
    setCurrentLanguage(i18n.language);
    setDetectedCountry(languageDetectionService.getDetectedCountry());
  }, [i18n.language]);

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    languageDetectionService.setLanguage(languageCode);
    setCurrentLanguage(languageCode);
    setIsOpen(false);
  };

  const getCurrentLanguageName = () => {
    const lang = supportedLanguages.find(l => l.code === currentLanguage);
    return lang?.name || currentLanguage.toUpperCase();
  };

  const getLanguageFlag = (code: string) => {
    // Simple flag emoji mapping for major languages
    const flagMap: { [key: string]: string } = {
      'en': '🇺🇸',
      'es': '🇪🇸',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'pt': '🇵🇹',
      'it': '🇮🇹',
      'ru': '🇷🇺',
      'zh': '🇨🇳',
      'ja': '🇯🇵',
      'ko': '🇰🇷',
      'ar': '🇸🇦',
      'hi': '🇮🇳',
      'nl': '🇳🇱'
    };
    return flagMap[code] || '🌐';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Language Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        aria-label={t('language.selector.change')}
      >
        <span className="text-lg">{getLanguageFlag(currentLanguage)}</span>
        <span className="text-sm font-medium text-gray-700">
          {getCurrentLanguageName()}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">
                {t('language.selector.title')}
              </h3>
              {detectedCountry && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('language.selector.auto')}: {detectedCountry}
                </p>
              )}
            </div>

            {/* Language Options */}
            <div className="py-2">
              {supportedLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                    currentLanguage === language.code
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700'
                  }`}
                >
                  <span className="text-lg">{getLanguageFlag(language.code)}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{language.name}</div>
                    <div className="text-xs text-gray-500 uppercase">
                      {language.code}
                    </div>
                  </div>
                  {currentLanguage === language.code && (
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500">
                {t('language.selector.manual')}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Hook for easy language detection integration
export function useLanguageDetection() {
  const { i18n } = useTranslation();

  const detectAndSetLanguage = async (latitude?: number, longitude?: number) => {
    try {
      const detectedLanguage = await languageDetectionService.detectLanguage(
        latitude,
        longitude
      );
      
      if (detectedLanguage !== i18n.language) {
        await i18n.changeLanguage(detectedLanguage);
      }
      
      return detectedLanguage;
    } catch (error) {
      console.warn('Language detection failed:', error);
      return i18n.language;
    }
  };

  return {
    detectAndSetLanguage,
    currentLanguage: i18n.language,
    isRTL: languageDetectionService.isRTL(i18n.language),
    supportedLanguages: languageDetectionService.getSupportedLanguages(),
  };
}