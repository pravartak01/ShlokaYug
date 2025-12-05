/**
 * API Configuration Constants
 */

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  
  // User
  PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile/update',
  CHANGE_PASSWORD: '/user/change-password',
  
  // Courses
  COURSES: '/courses',
  COURSE_DETAIL: (id: string) => `/courses/${id}`,
  ENROLL: (id: string) => `/courses/${id}/enroll`,
  
  // Lessons
  LESSONS: (courseId: string) => `/courses/${courseId}/lessons`,
  LESSON_DETAIL: (courseId: string, lessonId: string) => `/courses/${courseId}/lessons/${lessonId}`,
  COMPLETE_LESSON: (courseId: string, lessonId: string) => `/courses/${courseId}/lessons/${lessonId}/complete`,
  
  // Practice
  PRACTICE_SESSIONS: '/practice/sessions',
  SUBMIT_PRACTICE: '/practice/submit',
  PRACTICE_FEEDBACK: (id: string) => `/practice/${id}/feedback`,
  
  // Community
  POSTS: '/community/posts',
  POST_DETAIL: (id: string) => `/community/posts/${id}`,
  CREATE_POST: '/community/posts/create',
  LIKE_POST: (id: string) => `/community/posts/${id}/like`,
  COMMENT: (id: string) => `/community/posts/${id}/comment`,
  
  // Videos
  VIDEOS: '/videos',
  VIDEO_DETAIL: (id: string) => `/videos/${id}`,
  
  // Shlokas
  SHLOKAS: '/shlokas',
  SHLOKA_DETAIL: (id: string) => `/shlokas/${id}`,
  FAVORITE_SHLOKA: (id: string) => `/shlokas/${id}/favorite`,
  
  // Voice Analysis
  VOICE_ANALYZE: '/v1/voice/analyze',
};
