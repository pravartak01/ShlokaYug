import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  ApiResponse,
  UserStats,
  UpdateProfileFormData,
  LearningProgress
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              if (response.data?.tokens) {
                const { accessToken } = response.data.tokens;
                
                localStorage.setItem('accessToken', accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                
                return this.api(originalRequest);
              }
            }
          } catch {
            // Refresh failed, logout user
            this.clearTokens();
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Authentication endpoints
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', credentials);
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
    
    if (response.data.success && response.data.data?.tokens) {
      const { accessToken, refreshToken } = response.data.data.tokens;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
    
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.post('/auth/logout', {
        refreshToken
      });
      return response.data;
    } finally {
      this.clearTokens();
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/refresh', {
      refreshToken
    });
    
    if (response.data.success && response.data.data?.tokens) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await this.api.get('/auth/me');
    return response.data;
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.get(`/auth/verify-email/${token}`);
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post('/auth/forgot-password', {
      email
    });
    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.put(`/auth/reset-password/${token}`, {
      password
    });
    return response.data;
  }

  // User management endpoints
  async updateProfile(profileData: Partial<UpdateProfileFormData>): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await this.api.put('/user/profile', {
      name: profileData.name,
      avatar: profileData.avatar,
      profile: {
        level: profileData.level,
        favoriteMeters: profileData.favoriteMeters,
        preferences: {
          language: profileData.language,
          notifications: {
            email: profileData.emailNotifications,
            push: profileData.pushNotifications
          }
        }
      }
    });
    return response.data;
  }

  async updateLearningProgress(progress: Partial<LearningProgress>): Promise<ApiResponse<{ learningProgress: LearningProgress }>> {
    const response: AxiosResponse<ApiResponse<{ learningProgress: LearningProgress }>> = await this.api.put('/user/progress', progress);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.put('/user/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }

  async getUserStats(): Promise<ApiResponse<{ stats: UserStats }>> {
    const response: AxiosResponse<ApiResponse<{ stats: UserStats }>> = await this.api.get('/user/stats');
    return response.data;
  }

  async deleteAccount(password: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.delete('/user/account', {
      data: { password }
    });
    this.clearTokens();
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.get('/health');
    return response.data;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;