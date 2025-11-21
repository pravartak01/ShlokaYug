/**
 * Authentication Context
 * Provides global authentication state and methods throughout the app
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import authService, { User, LoginData, RegisterData } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if token exists
      const isLoggedIn = await authService.isLoggedIn();
      
      if (isLoggedIn) {
        // Try to get stored user data first
        const storedUser = await authService.getStoredUser();
        
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
  };

  const login = async (data: LoginData) => {
    try {
      const response = await authService.login(data);
      setUser(response.data.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      setUser(response.data.user);
    } catch (error) {
      throw error;
    }
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

/**
 * Custom hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
