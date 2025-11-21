/**
 * API Configuration
 * Central configuration for all API calls
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend URL - Update this based on your environment
const BACKEND_URL = __DEV__ 
  ? 'http://10.245.97.46:5000/api/v1'  // Development - Using your machine's IP
  : 'https://api.shlokayug.com/api/v1'; // Production

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

export { BACKEND_URL };
export default api;
