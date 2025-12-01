/**
 * Authentication Types
 * Type definitions for authentication-related data
 */

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  preferredScript?: 'devanagari' | 'iast' | 'tamil' | 'telugu' | 'kannada' | 'malayalam';
}

export interface LoginData {
  identifier: string; // email or username
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  preferredScript: string;
}

export interface UserSubscription {
  plan: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

export interface UserGamification {
  level: number;
  xp: number;
  coins: number;
  streak: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  profile: UserProfile;
  role: string;
  subscription: UserSubscription;
  gamification: UserGamification;
  isEmailVerified: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  expiresIn: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: AuthTokens;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
