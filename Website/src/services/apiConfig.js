/**
 * API Configuration
 * Central configuration for all API calls and storage management
 */

import axios from 'axios';

// Backend API base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Storage keys for localStorage
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'shlokayug_access_token',
  REFRESH_TOKEN: 'shlokayug_refresh_token',
  USER_DATA: 'shlokayug_user',
};

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and haven't tried refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { access, refresh } = response.data.data.tokens;
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        clearAuthData();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Handle API errors and extract meaningful messages
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.message || 
                   error.response.data?.error || 
                   'An error occurred';
    return message;
  } else if (error.request) {
    // Request made but no response
    return 'Unable to connect to server. Please check your internet connection.';
  } else {
    // Error in setting up request
    return error.message || 'An unexpected error occurred';
  }
};

/**
 * Store authentication data in localStorage
 */
export const storeAuthData = (data) => {
  if (data.tokens) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.tokens.access);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.tokens.refresh);
  }
  if (data.user) {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
  }
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
};

/**
 * Get stored user data
 */
export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

/**
 * Get stored access token
 */
export const getStoredToken = () => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = () => {
  return !!getStoredToken();
};

export default api;
