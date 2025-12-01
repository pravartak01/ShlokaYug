/**
 * API Configuration
 * Central configuration for all API calls in the web application
 */

import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios';

// Backend URL - Update this based on your environment
const isDevelopment = import.meta.env.DEV;
export const BACKEND_URL = isDevelopment
  ? 'http://localhost:5000/api/v1'  // Development
  : 'https://api.shlokayug.com/api/v1'; // Production

// Storage keys for localStorage
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'shlokayug:accessToken',
  REFRESH_TOKEN: 'shlokayug:refreshToken',
  USER_DATA: 'shlokayug:userData',
} as const;

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
  (config: InternalAxiosRequestConfig) => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log request in development
      if (isDevelopment) {
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
    if (isDevelopment) {
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
    if (isDevelopment) {
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
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (refreshToken) {
          // Attempt to refresh token
          const response = await axios.post(`${BACKEND_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { access: newAccessToken, refresh: newRefreshToken } = response.data.data.tokens;

          // Store new tokens
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

          // Update authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          // Retry original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed - logout user
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);

        // Redirect to login
        window.location.href = '/auth/login';
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
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error
      const errorData = error.response.data as { error?: { message?: string }; message?: string };

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
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred.';
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

export default api;
