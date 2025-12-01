/**
 * Authentication Context
 * Provides global authentication state and methods throughout the website
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { getStoredUser, getStoredToken, isLoggedIn } from '../services/apiConfig';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isLoggedIn()) {
        // Try to get stored user data first
        const storedUser = getStoredUser();
        
        if (storedUser) {
          setUser(storedUser);
          
          // Verify token is still valid in background
          try {
            const freshUser = await authService.getProfile();
            if (freshUser) {
              setUser(freshUser);
            }
          } catch (err) {
            console.error('Token validation failed:', err);
            // Token invalid, clear user
            setUser(null);
            authService.clearAuthData();
          }
        } else {
          // No stored user, fetch from API
          try {
            const freshUser = await authService.getProfile();
            if (freshUser) {
              setUser(freshUser);
            }
          } catch (err) {
            console.error('Failed to fetch user profile:', err);
            setUser(null);
          }
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (data) => {
    try {
      setError(null);
      const response = await authService.login(data);
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return response;
      }
      
      throw new Error('Login failed');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const register = useCallback(async (data) => {
    try {
      setError(null);
      const response = await authService.register(data);
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return response;
      }
      
      throw new Error('Registration failed');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear user even if API fails
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await authService.getProfile();
      if (freshUser) {
        setUser(freshUser);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
      throw err;
    }
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
