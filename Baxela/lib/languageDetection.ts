// Language detection service based on user location
export interface LocationLanguageMap {
  [countryCode: string]: string;
}

// Mapping of country codes to primary languages
export const COUNTRY_LANGUAGE_MAP: LocationLanguageMap = {
  // English-speaking countries
  'US': 'en', 'GB': 'en', 'CA': 'en', 'AU': 'en', 'NZ': 'en', 'IE': 'en', 'ZA': 'en',
  
  // Spanish-speaking countries
  'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es', 'VE': 'es', 'CL': 'es',
  'EC': 'es', 'GT': 'es', 'CU': 'es', 'BO': 'es', 'DO': 'es', 'HN': 'es', 'PY': 'es',
  'SV': 'es', 'NI': 'es', 'CR': 'es', 'PA': 'es', 'UY': 'es', 'GQ': 'es',
  
  // French-speaking countries
  'FR': 'fr', 'BE': 'fr', 'CH': 'fr', 'CA': 'fr', 'LU': 'fr', 'MC': 'fr',
  'SN': 'fr', 'CI': 'fr', 'ML': 'fr', 'BF': 'fr', 'NE': 'fr', 'TD': 'fr',
  'MG': 'fr', 'CM': 'fr', 'CD': 'fr', 'CG': 'fr', 'GA': 'fr', 'CF': 'fr',
  
  // German-speaking countries
  'DE': 'de', 'AT': 'de', 'CH': 'de', 'LI': 'de', 'LU': 'de',
  
  // Portuguese-speaking countries
  'PT': 'pt', 'BR': 'pt', 'AO': 'pt', 'MZ': 'pt', 'GW': 'pt', 'CV': 'pt',
  'ST': 'pt', 'TL': 'pt', 'MO': 'pt',
  
  // Italian-speaking countries
  'IT': 'it', 'SM': 'it', 'VA': 'it', 'CH': 'it',
  
  // Russian-speaking countries
  'RU': 'ru', 'BY': 'ru', 'KZ': 'ru', 'KG': 'ru', 'TJ': 'ru',
  
  // Chinese-speaking regions
  'CN': 'zh', 'TW': 'zh', 'HK': 'zh', 'MO': 'zh', 'SG': 'zh',
  
  // Japanese
  'JP': 'ja',
  
  // Korean
  'KR': 'ko', 'KP': 'ko',
  
  // Arabic-speaking countries
  'SA': 'ar', 'AE': 'ar', 'EG': 'ar', 'IQ': 'ar', 'JO': 'ar', 'KW': 'ar',
  'LB': 'ar', 'LY': 'ar', 'MA': 'ar', 'OM': 'ar', 'QA': 'ar', 'SY': 'ar',
  'TN': 'ar', 'YE': 'ar', 'BH': 'ar', 'DZ': 'ar', 'SD': 'ar', 'PS': 'ar',
  
  // Hindi/Indian languages
  'IN': 'hi',
  
  // Dutch-speaking countries
  'NL': 'nl', 'BE': 'nl', 'SR': 'nl',
  
  // Swedish, Norwegian, Danish
  'SE': 'sv', 'NO': 'no', 'DK': 'da',
  
  // Finnish
  'FI': 'fi',
  
  // Polish
  'PL': 'pl',
  
  // Czech
  'CZ': 'cs',
  
  // Hungarian
  'HU': 'hu',
  
  // Romanian
  'RO': 'ro',
  
  // Greek
  'GR': 'el',
  
  // Turkish
  'TR': 'tr',
  
  // Hebrew
  'IL': 'he',
  
  // Thai
  'TH': 'th',
  
  // Vietnamese
  'VN': 'vi',
  
  // Indonesian
  'ID': 'id',
  
  // Malay
  'MY': 'ms',
  
  // Filipino
  'PH': 'tl',
  
  // Ukrainian
  'UA': 'uk',
  
  // Bulgarian
  'BG': 'bg',
  
  // Croatian
  'HR': 'hr',
  
  // Serbian
  'RS': 'sr',
  
  // Slovenian
  'SI': 'sl',
  
  // Slovak
  'SK': 'sk',
  
  // Lithuanian
  'LT': 'lt',
  
  // Latvian
  'LV': 'lv',
  
  // Estonian
  'EE': 'et',
};

// Supported languages in our application
export const SUPPORTED_LANGUAGES = [
  'en', 'es', 'fr', 'de', 'pt', 'it', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi', 'nl'
];

// Language names for display
export const LANGUAGE_NAMES: { [key: string]: string } = {
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'pt': 'Português',
  'it': 'Italiano',
  'ru': 'Русский',
  'zh': '中文',
  'ja': '日本語',
  'ko': '한국어',
  'ar': 'العربية',
  'hi': 'हिन्दी',
  'nl': 'Nederlands'
};

export class LanguageDetectionService {
  private static instance: LanguageDetectionService;
  private currentLanguage: string = 'en';
  private detectedCountry: string | null = null;

  private constructor() {}

  static getInstance(): LanguageDetectionService {
    if (!LanguageDetectionService.instance) {
      LanguageDetectionService.instance = new LanguageDetectionService();
    }
    return LanguageDetectionService.instance;
  }

  /**
   * Detect language based on user's location coordinates
   */
  async detectLanguageFromLocation(latitude: number, longitude: number): Promise<string> {
    try {
      // Use reverse geocoding to get country from coordinates
      const country = await this.getCountryFromCoordinates(latitude, longitude);
      
      if (country) {
        this.detectedCountry = country;
        const language = COUNTRY_LANGUAGE_MAP[country.toUpperCase()];
        
        if (language && SUPPORTED_LANGUAGES.includes(language)) {
          this.currentLanguage = language;
          return language;
        }
      }
      
      // Fallback to browser language detection
      return this.detectLanguageFromBrowser();
    } catch (error) {
      console.warn('Error detecting language from location:', error);
      return this.detectLanguageFromBrowser();
    }
  }

  /**
   * Detect language from browser settings
   */
  detectLanguageFromBrowser(): string {
    try {
      // Get browser language
      const browserLang = navigator.language || navigator.languages?.[0] || 'en';
      const langCode = browserLang.split('-')[0].toLowerCase();
      
      if (SUPPORTED_LANGUAGES.includes(langCode)) {
        this.currentLanguage = langCode;
        return langCode;
      }
      
      // Fallback to English
      this.currentLanguage = 'en';
      return 'en';
    } catch (error) {
      console.warn('Error detecting browser language:', error);
      this.currentLanguage = 'en';
      return 'en';
    }
  }

  /**
   * Get country code from coordinates using a free geocoding service
   */
  private async getCountryFromCoordinates(latitude: number, longitude: number): Promise<string | null> {
    try {
      // Using a free geocoding service (no API key required)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }
      
      const data = await response.json();
      return data.countryCode || null;
    } catch (error) {
      console.warn('Error in reverse geocoding:', error);
      
      // Fallback: try another free service
      try {
        const response = await fetch(
          `https://geocode.xyz/${latitude},${longitude}?json=1`
        );
        
        if (response.ok) {
          const data = await response.json();
          return data.prov || data.country || null;
        }
      } catch (fallbackError) {
        console.warn('Fallback geocoding also failed:', fallbackError);
      }
      
      return null;
    }
  }

  /**
   * Get current detected language
   */
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Set language manually
   */
  setLanguage(language: string): void {
    if (SUPPORTED_LANGUAGES.includes(language)) {
      this.currentLanguage = language;
      // Store in localStorage for persistence
      localStorage.setItem('preferred-language', language);
    }
  }

  /**
   * Get language from localStorage if available
   */
  getStoredLanguage(): string | null {
    try {
      return localStorage.getItem('preferred-language');
    } catch (error) {
      return null;
    }
  }

  /**
   * Get detected country
   */
  getDetectedCountry(): string | null {
    return this.detectedCountry;
  }

  /**
   * Get all supported languages for language selector
   */
  getSupportedLanguages(): Array<{ code: string; name: string }> {
    return SUPPORTED_LANGUAGES.map(code => ({
      code,
      name: LANGUAGE_NAMES[code] || code.toUpperCase()
    }));
  }

  /**
   * Detect language with priority: stored > location > browser > default
   */
  async detectLanguage(latitude?: number, longitude?: number): Promise<string> {
    // 1. Check stored preference
    const storedLang = this.getStoredLanguage();
    if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang)) {
      this.currentLanguage = storedLang;
      return storedLang;
    }

    // 2. Try location-based detection if coordinates available
    if (latitude !== undefined && longitude !== undefined) {
      const locationLang = await this.detectLanguageFromLocation(latitude, longitude);
      if (locationLang !== 'en') { // Only use if we got a non-default result
        return locationLang;
      }
    }

    // 3. Fallback to browser detection
    return this.detectLanguageFromBrowser();
  }

  /**
   * Check if a language is RTL (Right-to-Left)
   */
  isRTL(language: string): boolean {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(language);
  }
}

// Export singleton instance
export const languageDetectionService = LanguageDetectionService.getInstance();