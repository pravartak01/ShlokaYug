/**
 * Authentication Context Provider
 * Provides global authentication state and methods throughout the web app
 */

import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import authService from '../services/authService';
import type { User, LoginData, RegisterData } from '../types/auth';
import { AuthContext, type AuthContextType } from './AuthContextDef';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app start
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check if token exists
      const isLoggedIn = authService.isLoggedIn();

      if (isLoggedIn) {
        // Try to get stored user data first
        const storedUser = authService.getStoredUser();

        if (storedUser) {
          setUser(storedUser);

          // Verify token is still valid in background
          try {
            const freshUser = await authService.getProfile();
            setUser(freshUser);
          } catch (error) {
            // Token invalid, clear user
            console.error('Token validation failed:', error);
            setUser(null);
          }
        } else {
          // No stored user, fetch from API
          try {
            const freshUser = await authService.getProfile();
            setUser(freshUser);
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (data: LoginData) => {
    const response = await authService.login(data);
    setUser(response.data.user);
  };

  const register = async (data: RegisterData) => {
    const response = await authService.register(data);
    setUser(response.data.user);
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      // Even if API call fails, clear local data
      console.error('Logout error:', error);
      setUser(null);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const freshUser = await authService.getProfile();
      setUser(freshUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
