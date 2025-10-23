import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from '../locales/en/common.json';
import es from '../locales/es/common.json';
import fr from '../locales/fr/common.json';
import de from '../locales/de/common.json';
import pt from '../locales/pt/common.json';
import it from '../locales/it/common.json';
import ru from '../locales/ru/common.json';
import zh from '../locales/zh/common.json';
import ja from '../locales/ja/common.json';
import ko from '../locales/ko/common.json';
import ar from '../locales/ar/common.json';
import hi from '../locales/hi/common.json';
import nl from '../locales/nl/common.json';

const resources = {
  en: { common: en },
  es: { common: es },
  fr: { common: fr },
  de: { common: de },
  pt: { common: pt },
  it: { common: it },
  ru: { common: ru },
  zh: { common: zh },
  ja: { common: ja },
  ko: { common: ko },
  ar: { common: ar },
  hi: { common: hi },
  nl: { common: nl },
};

// Simple initialization without complex detection
i18n.use(initReactI18next).init({
  resources,
  fallbackLng: 'en',
  debug: false,
  
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  
  // Simplified configuration to avoid Set objects
  defaultNS: 'common',
  ns: ['common'],
  
  react: {
    useSuspense: false,
  },
  
  // Disable features that might cause Set objects
  saveMissing: false,
  updateMissing: false,
  missingKeyHandler: false,
});

export default i18n;