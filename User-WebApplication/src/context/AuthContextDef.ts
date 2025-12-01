/**
 * Auth Context Types and Context Definition
 * Separated for Fast Refresh compatibility
 */

import { createContext } from 'react';
import type { User, LoginData, RegisterData } from '../types/auth';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
