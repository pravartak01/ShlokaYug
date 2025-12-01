/**
 * Authentication Service
 * Handles all authentication-related API calls for the website
 */

import api, { 
  handleApiError, 
  storeAuthData, 
  clearAuthData, 
  getStoredUser, 
  getStoredToken,
  STORAGE_KEYS 
} from './apiConfig';

/**
 * Register a new user
 */
export const register = async (data) => {
  try {
    const payload = {
      email: data.email.trim().toLowerCase(),
      username: data.username.trim(),
      password: data.password,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      preferredScript: data.preferredScript || 'devanagari',
    };

    const response = await api.post('/auth/register', payload);
    
    if (response.data.success && response.data.data) {
      storeAuthData(response.data.data);
    }
    
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Login user with email/username and password
 */
export const login = async (data) => {
  try {
    const payload = {
      identifier: data.identifier.trim(),
      password: data.password,
    };

    const response = await api.post('/auth/login', payload);
    
    if (response.data.success && response.data.data) {
      storeAuthData(response.data.data);
    }
    
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    clearAuthData();
  }
};

/**
 * Request password reset email
 */
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { 
      email: email.trim().toLowerCase() 
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/auth/reset-password', { 
      token, 
      newPassword 
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (token) => {
  try {
    const response = await api.post('/auth/verify-email', { token });
    
    if (response.data.success) {
      const userData = getStoredUser();
      if (userData) {
        userData.isEmailVerified = true;
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      }
    }
    
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Resend verification email
 */
export const resendVerification = async () => {
  try {
    const response = await api.post('/auth/resend-verification');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Change password (for logged in users)
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post('/auth/change-password', { 
      currentPassword, 
      newPassword 
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get current user profile
 */
export const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    
    if (response.data.success && response.data.data) {
      localStorage.setItem(
        STORAGE_KEYS.USER_DATA, 
        JSON.stringify(response.data.data.user)
      );
      return response.data.data.user;
    }
    
    return null;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/auth/profile', profileData);
    
    if (response.data.success && response.data.data) {
      localStorage.setItem(
        STORAGE_KEYS.USER_DATA, 
        JSON.stringify(response.data.data.user)
      );
    }
    
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Check authentication status
 */
export const checkAuthStatus = async () => {
  try {
    const response = await api.get('/auth/status');
    return {
      isAuthenticated: response.data.data?.isAuthenticated || false,
      user: response.data.data?.user || null,
    };
  } catch {
    return { isAuthenticated: false, user: null };
  }
};

/**
 * Google OAuth authentication
 */
export const googleAuth = async (idToken) => {
  try {
    const response = await api.post('/auth/google', { idToken });
    
    if (response.data.success && response.data.data) {
      storeAuthData(response.data.data);
    }
    
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Export helper functions
export { getStoredUser, getStoredToken, clearAuthData };

// Default export as service object
const authService = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  changePassword,
  getProfile,
  updateProfile,
  checkAuthStatus,
  googleAuth,
  getStoredUser,
  getStoredToken,
  clearAuthData,
};

export default authService;
