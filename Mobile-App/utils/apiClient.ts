import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import i18n from '../i18n.config';
import { API_BASE_URL } from '../constants/api';

/**
 * Enhanced API Client with Automatic Language Support
 * 
 * This client automatically:
 * - Adds language parameter to all requests
 * - Transforms multilingual responses to current language
 * - Handles localized error messages
 */

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:3000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add language to all requests
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const currentLanguage = i18n.language || 'en';
    
    // Add language to query params
    if (!config.params) {
      config.params = {};
    }
    config.params.lang = currentLanguage;
    
    // Add language to headers
    if (!config.headers) {
      config.headers = {};
    }
    config.headers['Accept-Language'] = currentLanguage;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle localized responses and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // If response has multilingual content, extract current language
    if (response.data && typeof response.data === 'object') {
      response.data = processMultilingualContent(response.data);
    }
    
    return response;
  },
  (error) => {
    // Translate error messages
    if (error.response) {
      const errorMessage = error.response.data?.message || error.message;
      error.message = translateErrorMessage(errorMessage);
    } else if (error.request) {
      error.message = i18n.t('errors.networkError');
    }
    
    return Promise.reject(error);
  }
);

/**
 * Process multilingual content in API responses
 */
const processMultilingualContent = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(item => processMultilingualContent(item));
  }
  
  if (data && typeof data === 'object') {
    const processed: any = {};
    
    for (const key in data) {
      const value = data[key];
      
      // Check if field is multilingual (has language keys)
      if (isMultilingualField(value)) {
        processed[key] = value[i18n.language] || value.en || '';
      } else if (typeof value === 'object') {
        processed[key] = processMultilingualContent(value);
      } else {
        processed[key] = value;
      }
    }
    
    return processed;
  }
  
  return data;
};

/**
 * Check if a field contains multilingual content
 */
const isMultilingualField = (value: any): boolean => {
  if (!value || typeof value !== 'object') return false;
  
  const langKeys = ['en', 'hi', 'sa', 'mr', 'te'];
  const keys = Object.keys(value);
  
  // If object has language keys, it's multilingual
  return langKeys.some(lang => keys.includes(lang));
};

/**
 * Translate error messages
 */
const translateErrorMessage = (message: string): string => {
  // Map common error messages to translation keys
  const errorMap: Record<string, string> = {
    'Network Error': 'errors.networkError',
    'Server Error': 'errors.serverError',
    'Invalid credentials': 'errors.invalidCredentials',
    'Required field': 'errors.requiredField',
    'Invalid email': 'errors.invalidEmail',
    'Password mismatch': 'errors.passwordMismatch',
    'Upload failed': 'errors.uploadFailed',
  };
  
  const translationKey = errorMap[message];
  return translationKey ? i18n.t(translationKey) : message;
};

/**
 * API Methods with Language Support
 */
export const api = {
  // GET request
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.get<T>(url, config).then(res => res.data);
  },
  
  // POST request
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.post<T>(url, data, config).then(res => res.data);
  },
  
  // PUT request
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.put<T>(url, data, config).then(res => res.data);
  },
  
  // PATCH request
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.patch<T>(url, data, config).then(res => res.data);
  },
  
  // DELETE request
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.delete<T>(url, config).then(res => res.data);
  },
};

export default apiClient;

/**
 * Usage Examples:
 * 
 * import { api } from './utils/apiClient';
 * 
 * // GET request - automatically adds lang parameter
 * const courses = await api.get('/courses');
 * 
 * // POST request - automatically adds lang parameter
 * const result = await api.post('/practice/submit', { audio: '...' });
 * 
 * // Multilingual responses are automatically transformed
 * // API returns: { title: { en: "Hello", hi: "नमस्ते" } }
 * // You get: { title: "नमस्ते" } (if Hindi is selected)
 */
