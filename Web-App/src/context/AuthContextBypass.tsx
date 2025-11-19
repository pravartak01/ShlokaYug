import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthContextType } from '../types';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component - Bypassed for demo
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set default user on app start - bypassing authentication
  useEffect(() => {
    const defaultUser: User = {
      id: 'demo-user-1',
      name: 'Sanskrit Learner',
      email: 'demo@shlokayug.com',
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      role: 'user',
      avatar: '🕉️',
      profile: {
        level: 'intermediate',
        favoriteMeters: ['Anushtubh', 'Gayatri', 'Trishtubh'],
        preferences: {
          language: 'english',
          notifications: {
            email: true,
            push: true
          }
        },
        learningProgress: {
          shlokasCompleted: 47,
          accuracy: 94,
          streakDays: 12,
          lastPracticeDate: new Date().toISOString()
        }
      }
    };
    
    setUser(defaultUser);
    setIsLoading(false);
  }, []);

  // Mock auth functions
  const login = async () => {
    // Bypassed - automatically redirect to dashboard
  };

  const register = async () => {
    // Bypassed - automatically redirect to dashboard
  };

  const logout = () => {
    // Bypassed
  };

  const forgotPassword = async () => {
    // Bypassed
  };

  const resetPassword = async () => {
    // Bypassed
  };

  const updateProfile = async () => {
    // Bypassed
  };

  const refreshToken = async () => {
    // Bypassed
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};