/**
 * Course Service
 * Handles all course-related API calls
 */

import api from '../config/api';

export interface Course {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  instructor: {
    userId: string;
    name: string;
    credentials: string;
    specializations?: string[];
  };
  thumbnail?: string;
  pricing: {
    oneTime?: {
      amount: number;
      currency: string;
    };
    subscription?: {
      monthly?: {
        amount: number;
        currency: string;
      };
      yearly?: {
        amount: number;
        currency: string;
      };
    };
  };
  metadata: {
    category?: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    language: {
      instruction: string;
      content: string;
    };
    tags: string[];
    thumbnail?: string;
    isActive?: boolean;
    featured?: boolean;
  };
  structure: {
    totalUnits: number;
    totalLessons: number;
    totalLectures: number;
    totalDuration: number;
    units?: Array<{
      unitId: string;
      title: string;
      description?: string;
      order: number;
      estimatedDuration?: number;
      lessons?: Array<{
        lessonId: string;
        title: string;
        description?: string;
        order: number;
        estimatedDuration?: number;
        lectures?: Array<{
          lectureId: string;
          title: string;
          description?: string;
          order: number;
          content?: {
            videoUrl?: string;
            audioUrl?: string;
            thumbnailUrl?: string;
            duration?: number;
            materials?: Array<{
              type: 'pdf' | 'audio' | 'image' | 'text' | 'link';
              title: string;
              url: string;
              downloadable: boolean;
            }>;
            shlokaIds?: string[];
            transcript?: string;
            keyPoints?: string[];
          };
          metadata?: {
            difficulty?: string;
            tags?: string[];
            isFree?: boolean;
          };
        }>;
      }>;
    }>;
  };
  stats: {
    enrollment: {
      total: number;
    };
    ratings: {
      average: number | null;
      count: number;
    };
  };
  publishing: {
    status: 'draft' | 'published' | 'archived';
    lastModified?: Date;
  };
  isEnrolled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CourseFilters {
  category?: string[];
  difficulty?: string[];
  language?: string;
  priceType?: 'free' | 'paid' | 'all';
  search?: string;
  sort?: 'popular' | 'recent' | 'rating' | 'price-low' | 'price-high';
}

export interface Enrollment {
  _id: string;
  userId: string;
  courseId: Course | string; // Can be populated Course object or string ID
  course?: Course; // Alternative property name when populated
  enrollmentType: 'one_time_purchase' | 'subscription';
  progress?: {
    completionPercentage?: number;
    lecturesCompleted?: string[];
    sectionsProgress?: Array<{
      sectionId: string;
      completedLectures: string[];
      totalLectures: number;
    }>;
    totalWatchTime?: number;
    isCompleted?: boolean;
    lastAccessedLecture?: string;
  };
  payment?: {
    paymentId: string;
    amount: number;
    currency: string;
    status: string;
  };
  access?: {
    status: 'active' | 'expired' | 'suspended';
    grantedAt?: Date;
    expiresAt?: Date;
  };
  enrollmentDate?: string;
  enrolledAt?: string;
  lastAccessedAt?: string;
  isActive?: boolean;
  totalLectures?: number;
  completionPercentage?: number;
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
    
    const response = await api.get(`/courses?${params.toString()}`);
    return response.data;
  },

  // Get course by ID
  getCourseById: async (courseId: string) => {
    const response = await api.get(`/courses/${courseId}?includeContent=true`);
    return response.data;
  },

  // Enroll in a course
  enrollInCourse: async (courseId: string) => {
    const response = await api.post(`/enrollments/enroll`, { courseId });
    return response.data;
  },

  // Get user's enrolled courses
  getEnrolledCourses: async () => {
    const response = await api.get('/enrollments/my-courses');
    return response.data;
  },

  // Get course progress
  getCourseProgress: async (courseId: string) => {
    const response = await api.get(`/enrollments/course/${courseId}/progress`);
    return response.data;
  },

  // Create Razorpay order for course payment
  createPaymentOrder: async (courseId: string, amount: number) => {
    const response = await api.post('/payments/create-order', {
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
    const response = await api.post('/payments/verify', paymentData);
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
    const response = await api.post('/enrollments/lecture-complete', {
      courseId,
      lectureId,
    });
    return response.data;
  },

  // Get course certificate
  getCertificate: async (courseId: string) => {
    const response = await api.get(`/certificates/${courseId}`);
    return response.data;
  },

  // Get/Save notes for a lecture
  getNotes: async (courseId: string, lectureId: string) => {
    const response = await api.get(`/notes/${courseId}/${lectureId}`);
    return response.data;
  },

  saveNote: async (courseId: string, lectureId: string, content: string) => {
    const response = await api.post('/notes', {
      courseId,
      lectureId,
      content,
    });
    return response.data;
  },

  updateNote: async (noteId: string, content: string) => {
    const response = await api.put(`/notes/${noteId}`, { content });
    return response.data;
  },

  deleteNote: async (noteId: string) => {
    const response = await api.delete(`/notes/${noteId}`);
    return response.data;
  },
};

export default courseService;
