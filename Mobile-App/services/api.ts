/**
 * API Configuration
 * Central configuration for all API calls
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your machine's local IP address - Update this when your IP changes
const LOCAL_IP = '10.245.97.46';

// For Android Emulator, use 10.0.2.2 to reach host's localhost
// For physical devices, use LOCAL_IP
const getDevIP = () => {
  // Uncomment the line below if using Android Emulator
  // if (Platform.OS === 'android') return '10.0.2.2';
  return LOCAL_IP;
};

// Main Backend URL (Port 5000) - For user auth, videos, courses, etc.
const BACKEND_URL = __DEV__ 
  ? `http://${getDevIP()}:5000/api/v1`  // Development
  : 'https://api.shlokayug.com/api/v1'; // Production

// AI Backend URL (Port 8000) - For chandas identification, AI features
const AI_BACKEND_URL = __DEV__
  ? `http://${getDevIP()}:8000/api/v1`  // Development
  : 'https://ai.shlokayug.com/api/v1'; // Production

// Base URL without /api/v1 for static files
const STATIC_URL = __DEV__
  ? `http://${getDevIP()}:5000`  // Development
  : 'https://api.shlokayug.com'; // Production

/**
 * Get full URL for uploaded files (thumbnails, images, etc.)
 * Handles both relative paths (/uploads/...) and full URLs
 */
export const getFullImageUrl = (path?: string | null): string | null => {
  if (!path) return null;
  
  // If it's already a full URL (http/https), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it's a relative path starting with /, prepend the static URL
  if (path.startsWith('/')) {
    return `${STATIC_URL}${path}`;
  }
  
  // Otherwise, assume it's relative and add both base and path
  return `${STATIC_URL}/${path}`;
};

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@shlokayug:accessToken',
  REFRESH_TOKEN: '@shlokayug:refreshToken',
  USER_DATA: '@shlokayug:userData',
};

/**
 * Create axios instance with default configuration
 */
const api: AxiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically adds authentication token to requests
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Check if request is multipart/form-data (for file uploads)
      const isMultipart = config.headers?.['Content-Type'] === 'multipart/form-data' ||
                          config.data instanceof FormData ||
                          (config.data && config.data._parts);
      
      if (isMultipart && config.headers) {
        // Let React Native handle the Content-Type with boundary
        delete config.headers['Content-Type'];
      }

      // Log request in development
      if (__DEV__) {
        console.log('🚀 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
        });
      }

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles token refresh and error responses
 */
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (__DEV__) {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log error in development
    if (__DEV__) {
      console.error('❌ API Error:', {
        url: originalRequest?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        
        if (refreshToken) {
          // Attempt to refresh token
          const response = await axios.post(`${BACKEND_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { access: newAccessToken, refresh: newRefreshToken } = response.data.data.tokens;

          // Store new tokens
          await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
          await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

          // Update authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          // Retry original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed - logout user
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
        ]);
        
        // You can emit an event here to navigate to login
        console.error('Token refresh failed - logging out');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API Error Handler
 * Standardizes error messages from API responses
 */
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error
    const errorData = error.response.data;
    
    if (errorData?.error?.message) {
      return errorData.error.message;
    }
    
    if (errorData?.message) {
      return errorData.message;
    }

    // Default error messages based on status code
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An unexpected error occurred.';
    }
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your internet connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred.';
  }
};

/**
 * Check if backend is reachable
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${BACKEND_URL.replace('/api/v1', '')}/health`, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

/**
 * Check if AI backend is reachable
 */
export const checkAIBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${AI_BACKEND_URL.replace('/api/v1', '')}/health`, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    console.error('AI Backend health check failed:', error);
    return false;
  }
};

/**
 * Create axios instance for AI Backend with default configuration
 */
const aiApi: AxiosInstance = axios.create({
  baseURL: AI_BACKEND_URL,
  timeout: 60000, // 60 seconds - AI requests may take longer
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * AI API Request Interceptor
 */
aiApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (__DEV__) {
      console.log('🤖 AI API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * AI API Response Interceptor
 */
aiApi.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log('✅ AI API Response:', {
        status: response.status,
        url: response.config.url,
      });
    }
    return response;
  },
  (error: AxiosError) => {
    if (__DEV__) {
      console.error('❌ AI API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
      });
    }
    return Promise.reject(error);
  }
);

export { BACKEND_URL, AI_BACKEND_URL, aiApi };
export default api;
