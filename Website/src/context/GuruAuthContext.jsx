import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const GuruAuthContext = createContext(null);

export const GuruAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('guru_access_token');
    const storedUser = localStorage.getItem('guru_user');

    if (!token || !storedUser) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiService.getCurrentUser();
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        
        // Allow all authenticated users (all are auto-verified gurus in development)
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.login(credentials);

      if (response.success && response.data?.user) {
        const userData = response.data.user;
        
        // For now, allow all users to access the guru portal
        // TODO: Implement proper guru application workflow
        // In production, uncomment the role check below:
        // if (userData.role === 'guru' || userData.guruProfile?.applicationStatus === 'approved') {
        
        setUser(userData);
        setIsAuthenticated(true);
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
        
        return { success: true };
        
        // } else {
        //   throw new Error('Access denied. This portal is only for Gurus.');
        // }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.register(userData);

      if (response.success) {
        return { success: true, message: 'Registration successful! Please check your email to verify your account.' };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const applyForGuru = async (guruData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.applyForGuru(guruData);

      if (response.success) {
        // Refresh user data to get updated guru profile
        await checkAuthStatus();
        return { success: true, message: 'Guru application submitted successfully! We will review your application.' };
      } else {
        throw new Error(response.message || 'Application submission failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Application failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    applyForGuru,
    logout,
    clearError,
    checkAuthStatus,
  };

  return (
    <GuruAuthContext.Provider value={value}>
      {children}
    </GuruAuthContext.Provider>
  );
};

export const useGuruAuth = () => {
  const context = useContext(GuruAuthContext);
  if (!context) {
    throw new Error('useGuruAuth must be used within GuruAuthProvider');
  }
  return context;
};

export default GuruAuthContext;
