import React, { createContext, useContext } from 'react';
import apiService from '../services/apiService';

const ApiContext = createContext();

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export const ApiProvider = ({ children }) => {
  // Authentication APIs
  const login = async (credentials) => {
    try {
      const response = await apiService.post('/auth/login', {
        identifier: credentials.email || credentials.username,
        password: credentials.password
      });
      if (response.data.data.tokens) {
        localStorage.setItem('adminToken', response.data.data.tokens.access);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  };

  const verifyToken = async () => {
    try {
      const response = await apiService.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // User Management APIs
  const getUserStats = async () => {
    try {
      const response = await apiService.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getUsers = async (params = {}) => {
    try {
      const response = await apiService.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const moderateUser = async (userId, action) => {
    try {
      const response = await apiService.post(`/admin/users/${userId}/moderate`, { action });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Guru Management APIs
  const getGuruStats = async () => {
    try {
      const response = await apiService.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getGuruApplications = async (params = {}) => {
    try {
      const response = await apiService.get('/admin/gurus/pending', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getAllGurus = async (params = {}) => {
    try {
      const response = await apiService.get('/admin/gurus', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getPendingGurus = async () => {
    try {
      const response = await apiService.get('/admin/gurus/pending');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const reviewGuruApplication = async (guruId, reviewData) => {
    try {
      // Ensure the data matches the expected API format
      const formattedData = {
        action: reviewData.status === 'approved' ? 'approve' : 'reject',
        notes: reviewData.feedback || reviewData.notes || ''
      };
      const response = await apiService.post(`/admin/gurus/${guruId}/review`, formattedData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Challenge Management APIs
  const getChallenges = async () => {
    try {
      const response = await apiService.get('/admin/challenges');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const createChallenge = async (challengeData) => {
    try {
      const response = await apiService.post('/admin/challenges', challengeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateChallenge = async (challengeId, challengeData) => {
    try {
      const response = await apiService.put(`/admin/challenges/${challengeId}`, challengeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const deleteChallenge = async (challengeId) => {
    try {
      const response = await apiService.delete(`/admin/challenges/${challengeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const activateChallenge = async (challengeId) => {
    try {
      const response = await apiService.post(`/admin/challenges/${challengeId}/activate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getChallengeLeaderboard = async (challengeId) => {
    try {
      const response = await apiService.get(`/admin/challenges/${challengeId}/leaderboard`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const issueCertificate = async (challengeId, participantId) => {
    try {
      const response = await apiService.post(`/admin/challenges/${challengeId}/participants/${participantId}/certificate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Analytics APIs
  const getDashboardStats = async () => {
    try {
      const response = await apiService.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getChallengeAnalytics = async () => {
    try {
      const response = await apiService.get('/admin/challenges/analytics');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getPlatformAnalytics = async () => {
    try {
      const response = await apiService.get('/admin/analytics/platform');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Community Management APIs
  const getCommunityStats = async () => {
    try {
      const response = await apiService.get('/admin/community/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getReportedContent = async () => {
    try {
      const response = await apiService.get('/admin/content/reports');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const moderateContent = async (contentId, action) => {
    try {
      const response = await apiService.post(`/admin/content/${contentId}/moderate`, { action });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getCommunityPosts = async () => {
    try {
      const response = await apiService.get('/admin/community/posts');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const moderatePost = async (postId, action) => {
    try {
      const response = await apiService.post(`/admin/community/posts/${postId}/moderate`, { action });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getAnalytics = async (timeRange = 'last30days') => {
    try {
      const response = await apiService.get('/admin/analytics', { params: { timeRange } });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getSettings = async () => {
    try {
      const response = await apiService.get('/admin/settings');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateSettings = async (settings) => {
    try {
      const response = await apiService.put('/admin/settings', settings);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Content Moderation APIs
  const getPendingContent = async () => {
    try {
      const response = await apiService.get('/admin/content/pending');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getFlaggedContent = async () => {
    try {
      const response = await apiService.get('/admin/content/flagged');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const approveContent = async (contentId) => {
    try {
      const response = await apiService.post(`/admin/content/${contentId}/approve`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const rejectContent = async (contentId, reason) => {
    try {
      const response = await apiService.post(`/admin/content/${contentId}/reject`, { reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Payment Management APIs
  const getPaymentStats = async () => {
    try {
      const response = await apiService.get('/admin/payments/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getPaymentHistory = async (params = {}) => {
    try {
      const response = await apiService.get('/admin/payments', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const processRefund = async (paymentId, refundData) => {
    try {
      const response = await apiService.post(`/admin/payments/${paymentId}/refund`, refundData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getSubscriptions = async (params = {}) => {
    try {
      const response = await apiService.get('/admin/subscriptions', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateSubscription = async (subscriptionId, updateData) => {
    try {
      const response = await apiService.put(`/admin/subscriptions/${subscriptionId}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // System Management APIs
  const getSystemHealth = async () => {
    try {
      const response = await apiService.get('/admin/system/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const toggleMaintenanceMode = async (enabled) => {
    try {
      const response = await apiService.post('/admin/system/maintenance', { enabled });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getSystemLogs = async (params = {}) => {
    try {
      const response = await apiService.get('/admin/system/logs', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getPerformanceMetrics = async () => {
    try {
      const response = await apiService.get('/admin/system/metrics');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Course Management APIs
  const getCourses = async () => {
    try {
      const response = await apiService.get('/admin/courses');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const createCourse = async (courseData) => {
    try {
      const response = await apiService.post('/admin/courses', courseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateCourse = async (courseId, courseData) => {
    try {
      const response = await apiService.put(`/admin/courses/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      const response = await apiService.delete(`/admin/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const publishCourse = async (courseId) => {
    try {
      const response = await apiService.post(`/admin/courses/${courseId}/publish`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const unpublishCourse = async (courseId) => {
    try {
      const response = await apiService.post(`/admin/courses/${courseId}/unpublish`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Video Management APIs
  const getVideos = async () => {
    try {
      const response = await apiService.get('/admin/videos');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getShorts = async () => {
    try {
      const response = await apiService.get('/admin/shorts');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const moderateVideo = async (videoId, action) => {
    try {
      const response = await apiService.post(`/admin/videos/${videoId}/moderate`, { action });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const deleteVideo = async (videoId) => {
    try {
      const response = await apiService.delete(`/admin/videos/${videoId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getVideoAnalytics = async (videoId) => {
    try {
      const response = await apiService.get(`/admin/videos/${videoId}/analytics`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Assessment Management APIs
  const getAssessments = async () => {
    try {
      const response = await apiService.get('/admin/assessments');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const createAssessment = async (assessmentData) => {
    try {
      const response = await apiService.post('/admin/assessments', assessmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateAssessment = async (assessmentId, assessmentData) => {
    try {
      const response = await apiService.put(`/admin/assessments/${assessmentId}`, assessmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const deleteAssessment = async (assessmentId) => {
    try {
      const response = await apiService.delete(`/admin/assessments/${assessmentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getAssessmentStats = async (assessmentId) => {
    try {
      const response = await apiService.get(`/admin/assessments/${assessmentId}/stats`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Certificate Management APIs
  const getCertificates = async () => {
    try {
      const response = await apiService.get('/admin/certificates');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getCertificateTemplates = async () => {
    try {
      const response = await apiService.get('/admin/certificate-templates');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const createCertificateTemplate = async (templateData) => {
    try {
      const response = await apiService.post('/admin/certificate-templates', templateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateCertificateTemplate = async (templateId, templateData) => {
    try {
      const response = await apiService.put(`/admin/certificate-templates/${templateId}`, templateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const deleteCertificateTemplate = async (templateId) => {
    try {
      const response = await apiService.delete(`/admin/certificate-templates/${templateId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const revokeCertificate = async (certificateId) => {
    try {
      const response = await apiService.post(`/admin/certificates/${certificateId}/revoke`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const downloadCertificate = async (certificateId) => {
    try {
      const response = await apiService.get(`/admin/certificates/${certificateId}/download`, { responseType: 'blob' });
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Enrollment Management APIs
  const getEnrollments = async () => {
    try {
      const response = await apiService.get('/admin/enrollments');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const createEnrollment = async (enrollmentData) => {
    try {
      const response = await apiService.post('/admin/enrollments', enrollmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateEnrollment = async (enrollmentId, enrollmentData) => {
    try {
      const response = await apiService.put(`/admin/enrollments/${enrollmentId}`, enrollmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const cancelEnrollment = async (enrollmentId) => {
    try {
      const response = await apiService.post(`/admin/enrollments/${enrollmentId}/cancel`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getEnrollmentStats = async () => {
    try {
      const response = await apiService.get('/admin/enrollments/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    // Authentication
    login,
    logout,
    verifyToken,
    
    // User Management
    getUserStats,
    getUsers,
    moderateUser,
    
    // Guru Management
    getGuruStats,
    getAllGurus,
    getGuruApplications,
    getPendingGurus,
    reviewGuruApplication,
    
    // Challenge Management
    getChallenges,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    activateChallenge,
    getChallengeLeaderboard,
    issueCertificate,
    
    // Analytics
    getDashboardStats,
    getChallengeAnalytics,
    getPlatformAnalytics,
    getAnalytics,
    
    // Community Management
    getCommunityStats,
    getCommunityPosts,
    getReportedContent,
    moderateContent,
    moderatePost,
    
    // Content Moderation
    getPendingContent,
    getFlaggedContent,
    approveContent,
    rejectContent,
    
    // Payment Management
    getPaymentStats,
    getPaymentHistory,
    processRefund,
    getSubscriptions,
    updateSubscription,
    
    // System Management
    getSystemHealth,
    toggleMaintenanceMode,
    getSystemLogs,
    getPerformanceMetrics,
    
    // Course Management
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    publishCourse,
    unpublishCourse,
    
    // Video Management
    getVideos,
    getShorts,
    moderateVideo,
    deleteVideo,
    getVideoAnalytics,
    
    // Assessment Management
    getAssessments,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    getAssessmentStats,
    
    // Certificate Management
    getCertificates,
    getCertificateTemplates,
    createCertificateTemplate,
    updateCertificateTemplate,
    deleteCertificateTemplate,
    revokeCertificate,
    downloadCertificate,
    
    // Enrollment Management
    getEnrollments,
    createEnrollment,
    updateEnrollment,
    cancelEnrollment,
    getEnrollmentStats,
    
    // Settings
    getSettings,
    updateSettings,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};