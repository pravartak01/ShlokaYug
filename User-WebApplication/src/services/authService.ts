/**
 * Authentication Service
 * Handles all authentication-related API calls for the web application
 */

import api, { STORAGE_KEYS, handleApiError } from '../config/api';
import type {
  User,
  LoginData,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  AuthResponse,
  ApiResponse,
} from '../types/auth';

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);

      // Store tokens and user data
      if (response.data.success) {
        this.storeAuthData(response.data.data);
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
        this.storeAuthData(response.data.data);
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
      this.clearAuthData();
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>('/auth/forgot-password', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>('/auth/verify-email', { token });

      // Update stored user data if verification successful
      if (response.data.success) {
        const userData = this.getStoredUser();
        if (userData) {
          userData.isEmailVerified = true;
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
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
  async resendVerification(): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>('/auth/resend-verification');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Change password (for logged in users)
   */
  async changePassword(data: ChangePasswordData): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>('/auth/change-password', data);
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
      const response = await api.get<{ success: boolean; data: { user: User } }>('/auth/profile');

      // Update stored user data
      if (response.data.success) {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.data.user));
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
      const response = await api.get<{
        success: boolean;
        data: { isAuthenticated: boolean; user?: User };
      }>('/auth/status');
      return {
        isAuthenticated: response.data.data.isAuthenticated,
        user: response.data.data.user,
      };
    } catch {
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
        this.storeAuthData(response.data.data);
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Store authentication data locally
   */
  private storeAuthData(data: AuthResponse['data']): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.tokens.access);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.tokens.refresh);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw new Error('Failed to store authentication data');
    }
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    try {
      const userDataString = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userDataString ? JSON.parse(userDataString) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  /**
   * Get stored access token
   */
  getStoredToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch {
      console.error('Error getting stored token');
      return null;
    }
  }

  /**
   * Check if user is logged in (has valid token)
   */
  isLoggedIn(): boolean {
    const token = this.getStoredToken();
    return !!token;
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
