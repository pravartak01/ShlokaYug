import axios from 'axios';

// Backend API base URL
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('guru_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and haven't tried refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('guru_refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          // Backend returns tokens in data.tokens.access format
          const { access, refresh } = response.data.data.tokens;
          localStorage.setItem('guru_access_token', access);
          localStorage.setItem('guru_refresh_token', refresh);

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('guru_access_token');
        localStorage.removeItem('guru_refresh_token');
        localStorage.removeItem('guru_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Service Methods
const apiService = {
  // Auth APIs
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.success && response.data.data) {
      const { user, tokens } = response.data.data;
      
      // Store tokens and user data (backend returns tokens.access and tokens.refresh)
      localStorage.setItem('guru_access_token', tokens.access);
      localStorage.setItem('guru_refresh_token', tokens.refresh);
      localStorage.setItem('guru_user', JSON.stringify(user));
    }
    return response.data;
  },

  register: async (userData) => {
    // Ensure firstName and lastName are in profile object for backend compatibility
    const payload = {
      email: userData.email,
      username: userData.username,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      preferredScript: userData.preferredScript || 'devanagari'
    };
    
    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  },

  applyForGuru: async (guruData) => {
    const response = await apiClient.post('/guru/apply', guruData);
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('guru_access_token');
      localStorage.removeItem('guru_refresh_token');
      localStorage.removeItem('guru_user');
    }
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await apiClient.post('/auth/reset-password', { token, password });
    return response.data;
  },

  // Course Management APIs
  createCourse: async (courseData) => {
    const response = await apiClient.post('/courses', courseData);
    return response.data;
  },

  getMyCourses: async () => {
    const response = await apiClient.get('/courses/instructor/my-courses');
    return response.data;
  },

  getCourseById: async (courseId, includeContent = false) => {
    const response = await apiClient.get(`/courses/${courseId}?includeContent=${includeContent}`);
    return response.data;
  },

  updateCourse: async (courseId, courseData) => {
    const response = await apiClient.put(`/courses/${courseId}`, courseData);
    return response.data;
  },

  deleteCourse: async (courseId) => {
    const response = await apiClient.delete(`/courses/${courseId}`);
    return response.data;
  },

  publishCourse: async (courseId) => {
    const response = await apiClient.patch(`/courses/${courseId}/publish`);
    return response.data;
  },

  unpublishCourse: async (courseId) => {
    const response = await apiClient.patch(`/courses/${courseId}/unpublish`);
    return response.data;
  },

  // Course Content APIs
  addUnit: async (courseId, unitData) => {
    const response = await apiClient.post(`/courses/${courseId}/units`, unitData);
    return response.data;
  },

  addLesson: async (courseId, unitId, lessonData) => {
    const response = await apiClient.post(`/courses/${courseId}/units/${unitId}/lessons`, lessonData);
    return response.data;
  },

  addLecture: async (courseId, unitId, lessonId, lectureData) => {
    const response = await apiClient.post(
      `/courses/${courseId}/units/${unitId}/lessons/${lessonId}/lectures`,
      lectureData
    );
    return response.data;
  },

  // Analytics APIs
  getCourseAnalytics: async (courseId) => {
    const response = await apiClient.get(`/courses/${courseId}/analytics`);
    return response.data;
  },

  getGuruStats: async () => {
    const response = await apiClient.get('/guru/stats');
    return response.data;
  },

  // Enrollment APIs
  getEnrollments: async (courseId) => {
    const response = await apiClient.get(`/enrollments/course/${courseId}`);
    return response.data;
  },

  getCourseEnrollments: async (courseId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/enrollments/search?courseId=${courseId}&${queryString}`);
    return response.data;
  },

  getEnrollmentAnalytics: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/enrollments/analytics?${queryString}`);
    return response.data;
  },

  getInstructorDashboardStats: async () => {
    const response = await apiClient.get('/guru/dashboard-stats');
    return response.data;
  },

  getRevenueStats: async (period = 'month') => {
    const response = await apiClient.get(`/guru/revenue?period=${period}`);
    return response.data;
  },

  getAllStudents: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/guru/students?${queryString}`);
    return response.data;
  },

  sendMessageToStudent: async (studentId, message) => {
    const response = await apiClient.post(`/messages/send`, { recipientId: studentId, content: message });
    return response.data;
  },

  issueCertificate: async (enrollmentId) => {
    const response = await apiClient.post(`/certificates/issue/${enrollmentId}`);
    return response.data;
  },

  // Upload APIs
  uploadVideo: async (formData, config = {}) => {
    const response = await apiClient.post('/courses/upload-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 600000, // 10 minutes timeout for video uploads
      ...config,
    });
    return response.data;
  },

  uploadCourseThumbnail: async (courseId, formData) => {
    const response = await apiClient.post(`/courses/${courseId}/thumbnail`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds timeout for thumbnail uploads
    });
    return response.data;
  },
};

export default apiService;
export { API_BASE_URL };
