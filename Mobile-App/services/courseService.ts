/**
 * Course Service
 * Handles all course-related API calls
 */

import apiClient from './api';

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: {
    userId: string;
    name: string;
    credentials: string;
  };
  thumbnail?: string;
  pricing: {
    type: 'free' | 'paid';
    amount?: number;
    currency?: string;
  };
  metadata: {
    category: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    language: {
      instruction: string;
      content: string;
    };
    tags: string[];
  };
  structure: {
    totalUnits: number;
    totalLessons: number;
    totalLectures: number;
    totalDuration: number;
  };
  stats: {
    enrollments: number;
    rating: number;
    reviews: number;
  };
  publishing: {
    status: 'draft' | 'published' | 'archived';
  };
  isEnrolled?: boolean;
}

export interface CourseFilters {
  category?: string[];
  difficulty?: string[];
  language?: string;
  priceType?: 'free' | 'paid' | 'all';
  search?: string;
  sort?: 'popular' | 'recent' | 'rating' | 'price-low' | 'price-high';
}

const courseService = {
  // Get all published courses with filters
  getCourses: async (filters?: CourseFilters) => {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category?.length) params.append('category', filters.category.join(','));
    if (filters?.difficulty?.length) params.append('difficulty', filters.difficulty.join(','));
    if (filters?.language) params.append('language', filters.language);
    if (filters?.priceType && filters.priceType !== 'all') params.append('priceType', filters.priceType);
    if (filters?.sort) params.append('sort', filters.sort);
    
    const response = await apiClient.get(`/courses?${params.toString()}`);
    return response.data;
  },

  // Get course by ID
  getCourseById: async (courseId: string) => {
    const response = await apiClient.get(`/courses/${courseId}?includeContent=true`);
    return response.data;
  },

  // Enroll in a course
  enrollInCourse: async (courseId: string) => {
    const response = await apiClient.post(`/enrollments/enroll`, { courseId });
    return response.data;
  },

  // Get user's enrolled courses
  getEnrolledCourses: async () => {
    const response = await apiClient.get('/enrollments/my-courses');
    return response.data;
  },

  // Get course progress
  getCourseProgress: async (courseId: string) => {
    const response = await apiClient.get(`/enrollments/course/${courseId}/progress`);
    return response.data;
  },

  // Create Razorpay order for course payment
  createPaymentOrder: async (courseId: string, amount: number) => {
    const response = await apiClient.post('/payments/create-order', {
      courseId,
      amount,
      currency: 'INR',
    });
    return response.data;
  },

  // Verify Razorpay payment
  verifyPayment: async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    courseId: string;
  }) => {
    const response = await apiClient.post('/payments/verify', paymentData);
    return response.data;
  },

  // Get course categories
  getCategories: async () => {
    return [
      'vedic_chanting',
      'sanskrit_grammar',
      'mantra_meditation',
      'yoga_sutras',
      'bhagavad_gita',
      'upanishads',
      'ayurveda',
      'jyotish',
    ];
  },

  // Mark lecture as complete
  markLectureComplete: async (courseId: string, lectureId: string) => {
    const response = await apiClient.post('/enrollments/lecture-complete', {
      courseId,
      lectureId,
    });
    return response.data;
  },

  // Get course certificate
  getCertificate: async (courseId: string) => {
    const response = await apiClient.get(`/certificates/${courseId}`);
    return response.data;
  },

  // Get/Save notes for a lecture
  getNotes: async (courseId: string, lectureId: string) => {
    const response = await apiClient.get(`/notes/${courseId}/${lectureId}`);
    return response.data;
  },

  saveNote: async (courseId: string, lectureId: string, content: string) => {
    const response = await apiClient.post('/notes', {
      courseId,
      lectureId,
      content,
    });
    return response.data;
  },

  updateNote: async (noteId: string, content: string) => {
    const response = await apiClient.put(`/notes/${noteId}`, { content });
    return response.data;
  },

  deleteNote: async (noteId: string) => {
    const response = await apiClient.delete(`/notes/${noteId}`);
    return response.data;
  },

  // Force complete course (DEVELOPMENT ONLY)
  forceCompleteCourse: async (courseId: string) => {
    const response = await apiClient.post(`/enrollments/force-complete/${courseId}`);
    return response.data;
  },
};

export default courseService;
