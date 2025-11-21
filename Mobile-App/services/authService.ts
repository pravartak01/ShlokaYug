/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import api, { STORAGE_KEYS, handleApiError } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export interface User {
  id: string;
  email: string;
  username: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    preferredScript: string;
  };
  role: string;
  subscription: {
    plan: string;
    status: string;
    startDate?: string;
    endDate?: string;
  };
  gamification: {
    level: number;
    xp: number;
    coins: number;
    streak: number;
  };
  isEmailVerified: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: {
      access: string;
      refresh: string;
      expiresIn: string;
    };
  };
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      
      // Store tokens and user data
      if (response.data.success) {
        await this.storeAuthData(response.data.data);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      
      // Store tokens and user data
      if (response.data.success) {
        await this.storeAuthData(response.data.data);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate token
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    } finally {
      // Clear all stored auth data
      await this.clearAuthData();
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/auth/forgot-password', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/auth/verify-email', { token });
      
      // Update stored user data if verification successful
      if (response.data.success) {
        const userData = await this.getStoredUser();
        if (userData) {
          userData.isEmailVerified = true;
          await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        }
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Resend verification email
   */
  async resendVerification(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/auth/resend-verification');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Change password (for logged in users)
   */
  async changePassword(data: ChangePasswordData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/auth/change-password', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<User> {
    try {
      const response = await api.get('/auth/profile');
      
      // Update stored user data
      if (response.data.success) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(response.data.data.user)
        );
      }
      
      return response.data.data.user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Check authentication status
   */
  async checkAuthStatus(): Promise<{ isAuthenticated: boolean; user?: User }> {
    try {
      const response = await api.get('/auth/status');
      return {
        isAuthenticated: response.data.data.isAuthenticated,
        user: response.data.data.user,
      };
    } catch (error) {
      return { isAuthenticated: false };
    }
  }

  /**
   * Google OAuth authentication
   */
  async googleAuth(idToken: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/google', { idToken });
      
      // Store tokens and user data
      if (response.data.success) {
        await this.storeAuthData(response.data.data);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Store authentication data locally
   */
  private async storeAuthData(data: AuthResponse['data']): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, data.tokens.access],
        [STORAGE_KEYS.REFRESH_TOKEN, data.tokens.refresh],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(data.user)],
      ]);
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw new Error('Failed to store authentication data');
    }
  }

  /**
   * Clear all authentication data
   */
  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  /**
   * Get stored user data
   */
  async getStoredUser(): Promise<User | null> {
    try {
      const userDataString = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userDataString ? JSON.parse(userDataString) : null;
    } catch (error) {
      console.error('Error getting stored user');
      return null;
    }
  }

  /**
   * Get stored access token
   */
  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch {
      console.error('Error getting stored token');
      return null;
    }
  }

  /**
   * Check if user is logged in (has valid token)
   */
  async isLoggedIn(): Promise<boolean> {
    const token = await this.getStoredToken();
    return !!token;
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
