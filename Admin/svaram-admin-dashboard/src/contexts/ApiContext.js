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