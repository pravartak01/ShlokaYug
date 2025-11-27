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
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_access_token');
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
            const refreshToken = localStorage.getItem('auth_refresh_token');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              if (response.success && response.data?.tokens) {
                const { access } = response.data.tokens;
                
                localStorage.setItem('auth_access_token', access);
                originalRequest.headers.Authorization = `Bearer ${access}`;
                
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
    localStorage.removeItem('auth_access_token');
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('auth_user');
  }

  // Authentication endpoints
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', credentials);
    
    if (response.data.success && response.data.data?.tokens) {
      const { access, refresh } = response.data.data.tokens;
      localStorage.setItem('auth_access_token', access);
      localStorage.setItem('auth_refresh_token', refresh);
      localStorage.setItem('auth_user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
    
    if (response.data.success && response.data.data?.tokens) {
      const { access, refresh } = response.data.data.tokens;
      localStorage.setItem('auth_access_token', access);
      localStorage.setItem('auth_refresh_token', refresh);
      localStorage.setItem('auth_user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.post('/auth/logout');
      return response.data;
    } finally {
      this.clearTokens();
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/refresh-token', {
      refreshToken
    });
    
    if (response.data.success && response.data.data?.tokens) {
      const { access, refresh } = response.data.data.tokens;
      localStorage.setItem('auth_access_token', access);
      localStorage.setItem('auth_refresh_token', refresh);
    }
    
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await this.api.get('/auth/profile');
    return response.data;
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post('/auth/verify-email', { token });
    return response.data;
  }

  async resendVerification(): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post('/auth/resend-verification');
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post('/auth/forgot-password', {
      email
    });
    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/reset-password', {
      token,
      password
    });
    
    if (response.data.success && response.data.data?.tokens) {
      const { access, refresh } = response.data.data.tokens;
      localStorage.setItem('auth_access_token', access);
      localStorage.setItem('auth_refresh_token', refresh);
    }
    
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }

  async googleAuth(tokenId: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/google', {
      tokenId
    });
    
    if (response.data.success && response.data.data?.tokens) {
      const { access, refresh } = response.data.data.tokens;
      localStorage.setItem('auth_access_token', access);
      localStorage.setItem('auth_refresh_token', refresh);
      localStorage.setItem('auth_user', JSON.stringify(response.data.data.user));
    }
    
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

  // Guru-specific endpoints
  async applyForGuru(credentials: any, experience: any): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post('/guru/apply', {
      credentials,
      experience
    });
    return response.data;
  }

  // Course Management endpoints
  async createCourse(courseData: any): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post('/courses', courseData);
    return response.data;
  }

  async getCourses(params?: {
    status?: string;
    category?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.get('/courses', { params });
    return response.data;
  }

  async getCourseById(id: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.get(`/courses/${id}`);
    return response.data;
  }

  async updateCourse(id: string, courseData: any): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.put(`/courses/${id}`, courseData);
    return response.data;
  }

  async deleteCourse(id: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.delete(`/courses/${id}`);
    return response.data;
  }

  async publishCourse(id: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.patch(`/courses/${id}/publish`);
    return response.data;
  }

  async unpublishCourse(id: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.patch(`/courses/${id}/unpublish`);
    return response.data;
  }

  async getInstructorCourses(params?: { status?: string }): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.get('/courses/instructor/my-courses', { params });
    return response.data;
  }

  async getCourseAnalytics(id: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.get(`/courses/${id}/analytics`);
    return response.data;
  }

  // Course content management
  async addUnit(courseId: string, unitData: any): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post(`/courses/${courseId}/units`, unitData);
    return response.data;
  }

  async addLesson(courseId: string, unitId: string, lessonData: any): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post(
      `/courses/${courseId}/units/${unitId}/lessons`,
      lessonData
    );
    return response.data;
  }

  async addLecture(courseId: string, unitId: string, lessonId: string, lectureData: any): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post(
      `/courses/${courseId}/units/${unitId}/lessons/${lessonId}/lectures`,
      lectureData
    );
    return response.data;
  }

  // Enrollment endpoints
  async initiateEnrollment(courseId: string, enrollmentType: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post('/enrollments/initiate', {
      courseId,
      enrollmentType
    });
    return response.data;
  }

  async confirmEnrollment(paymentData: any): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post('/enrollments/confirm', paymentData);
    return response.data;
  }

  async getMyEnrollments(params?: { status?: string }): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.get('/enrollments/my-enrollments', { params });
    return response.data;
  }

  async getEnrollmentDetails(id: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.get(`/enrollments/${id}`);
    return response.data;
  }

  // Payment endpoints
  async createPaymentOrder(data: {
    courseId: string;
    amount: number;
    currency?: string;
    enrollmentType?: string;
  }): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post('/payments/create-order', data);
    return response.data;
  }

  async verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post('/payments/verify', data);
    return response.data;
  }

  async getPaymentStatus(id: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.get(`/payments/${id}/status`);
    return response.data;
  }

  // Subscription endpoints
  async getMySubscriptions(params?: { status?: string }): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.get('/subscriptions/my-subscriptions', { params });
    return response.data;
  }

  async pauseSubscription(enrollmentId: string, reason: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post(`/subscriptions/${enrollmentId}/pause`, {
      reason
    });
    return response.data;
  }

  async resumeSubscription(enrollmentId: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post(`/subscriptions/${enrollmentId}/resume`);
    return response.data;
  }

  async cancelSubscription(enrollmentId: string, reason: string, immediate?: boolean): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post(`/subscriptions/${enrollmentId}/cancel`, {
      reason,
      immediate
    });
    return response.data;
  }

  async renewSubscription(enrollmentId: string): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post(`/subscriptions/${enrollmentId}/renew`);
    return response.data;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;