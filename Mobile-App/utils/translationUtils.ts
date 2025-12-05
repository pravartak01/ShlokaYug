import i18n from '../i18n.config';

/**
 * Translation Utilities for Dynamic Content and API Responses
 * 
 * This file provides helper functions to translate dynamic content,
 * API responses, and handle content translation across the app.
 */

export type SupportedLanguage = 'en' | 'hi' | 'sa' | 'mr' | 'te';

/**
 * Get the current language
 */
export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language as SupportedLanguage) || 'en';
};

/**
 * Translate dynamic content based on current language
 * Expects content in format: { en: "...", hi: "...", sa: "...", mr: "...", te: "..." }
 */
export const translateContent = (
  content: Record<SupportedLanguage, string> | string
): string => {
  if (typeof content === 'string') {
    return content;
  }
  
  const currentLang = getCurrentLanguage();
  return content[currentLang] || content.en || '';
};

/**
 * Translate an array of content objects
 */
export const translateArray = <T extends Record<string, any>>(
  items: T[],
  keys: string[]
): T[] => {
  return items.map(item => {
    const translated = { ...item };
    keys.forEach(key => {
      if (item[key] && typeof item[key] === 'object') {
        translated[key] = translateContent(item[key]);
      }
    });
    return translated;
  });
};

/**
 * Format date/time based on current language
 */
export const formatDate = (date: Date): string => {
  const lang = getCurrentLanguage();
  const localeMap: Record<SupportedLanguage, string> = {
    en: 'en-US',
    hi: 'hi-IN',
    sa: 'sa-IN',
    mr: 'mr-IN',
    te: 'te-IN',
  };
  
  return new Intl.DateTimeFormat(localeMap[lang], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Format time based on current language
 */
export const formatTime = (date: Date): string => {
  const lang = getCurrentLanguage();
  const localeMap: Record<SupportedLanguage, string> = {
    en: 'en-US',
    hi: 'hi-IN',
    sa: 'sa-IN',
    mr: 'mr-IN',
    te: 'te-IN',
  };
  
  return new Intl.DateTimeFormat(localeMap[lang], {
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
};

/**
 * Format numbers based on current language
 */
export const formatNumber = (num: number): string => {
  const lang = getCurrentLanguage();
  const localeMap: Record<SupportedLanguage, string> = {
    en: 'en-US',
    hi: 'hi-IN',
    sa: 'sa-IN',
    mr: 'mr-IN',
    te: 'te-IN',
  };
  
  return new Intl.NumberFormat(localeMap[lang]).format(num);
};

/**
 * Add language parameter to API requests
 */
export const getApiLanguageParam = (): string => {
  return getCurrentLanguage();
};

/**
 * Transform API response to include only current language content
 * Useful when API returns multilingual content
 */
export const transformApiResponse = <T extends Record<string, any>>(
  data: T,
  translatableKeys: string[]
): T => {
  const transformed = { ...data };
  
  translatableKeys.forEach(key => {
    if (transformed[key] && typeof transformed[key] === 'object') {
      transformed[key] = translateContent(transformed[key]);
    }
  });
  
  return transformed;
};

/**
 * Translate API error messages
 */
export const translateError = (errorCode: string): string => {
  const errorMap: Record<string, string> = {
    'NETWORK_ERROR': i18n.t('errors.networkError'),
    'SERVER_ERROR': i18n.t('errors.serverError'),
    'INVALID_CREDENTIALS': i18n.t('errors.invalidCredentials'),
    'UPLOAD_FAILED': i18n.t('errors.uploadFailed'),
  };
  
  return errorMap[errorCode] || errorCode;
};

/**
 * Pluralize based on count and language
 */
export const pluralize = (key: string, count: number): string => {
  return i18n.t(key, { count });
};

/**
 * Get language-specific asset path
 * Example: getAssetPath('images/banner.png') => 'images/banner_hi.png' for Hindi
 */
export const getAssetPath = (basePath: string): string => {
  const lang = getCurrentLanguage();
  if (lang === 'en') return basePath;
  
  const ext = basePath.split('.').pop();
  const pathWithoutExt = basePath.replace(`.${ext}`, '');
  return `${pathWithoutExt}_${lang}.${ext}`;
};

/**
 * Check if content is available in current language
 */
export const hasTranslation = (content: Record<SupportedLanguage, string>): boolean => {
  const currentLang = getCurrentLanguage();
  return !!content[currentLang];
};

/**
 * Get fallback content if translation not available
 */
export const getContentWithFallback = (
  content: Partial<Record<SupportedLanguage, string>>
): string => {
  const currentLang = getCurrentLanguage();
  return content[currentLang] || content.en || content.hi || '';
};
