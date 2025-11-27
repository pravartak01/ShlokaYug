const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  googleAuth,
  changePassword,
  getProfile,
} = require('../controllers/authController');

const { auth: protect, requireEmailVerification, requireRole } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  verifyEmailValidation,
  refreshTokenValidation,
  googleAuthValidation,
  changePasswordValidation,
} = require('../validators/authValidators');

const router = express.Router();

// Rate limiting configurations
const registerRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    error: {
      message: 'Too many registration attempts, please try again later',
      code: 'RATE_LIMIT_REGISTRATION',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    error: {
      message: 'Too many login attempts, please try again later',
      code: 'RATE_LIMIT_LOGIN',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    error: {
      message: 'Too many password reset attempts, please try again later',
      code: 'RATE_LIMIT_PASSWORD_RESET',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ================================
// PUBLIC ROUTES (No Authentication)
// ================================

// POST /api/v1/auth/register - Register new user
router.post('/register', registerRateLimit, registerValidation, validateRequest, register);

// POST /api/v1/auth/login - Login user
router.post('/login', loginRateLimit, loginValidation, validateRequest, login);

// POST /api/v1/auth/refresh-token - Refresh access token
router.post('/refresh-token', refreshTokenValidation, validateRequest, refreshToken);

// POST /api/v1/auth/forgot-password - Request password reset
router.post(
  '/forgot-password',
  passwordResetRateLimit,
  forgotPasswordValidation,
  validateRequest,
  forgotPassword
);

// POST /api/v1/auth/reset-password - Reset password with token
router.post('/reset-password', resetPasswordValidation, validateRequest, resetPassword);

// POST /api/v1/auth/verify-email - Verify email address
router.post('/verify-email', verifyEmailValidation, validateRequest, verifyEmail);

// POST /api/v1/auth/google - Google OAuth authentication
router.post('/google', googleAuthValidation, validateRequest, googleAuth);

// ================================
// PROTECTED ROUTES (Authentication Required)
// ================================

// POST /api/v1/auth/logout - Logout user (invalidate token)
router.post('/logout', protect, logout);

// POST /api/v1/auth/resend-verification - Resend email verification
router.post('/resend-verification', protect, resendVerification);

// POST /api/v1/auth/change-password - Change password
router.post('/change-password', protect, changePasswordValidation, validateRequest, changePassword);

// GET /api/v1/auth/profile - Get user profile
router.get('/profile', protect, getProfile);

// ================================
// UTILITY ROUTES
// ================================

// GET /api/v1/auth/status - Check authentication status
router.get('/status', protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      isAuthenticated: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        subscription: req.user.subscription,
        isEmailVerified: req.user.verification.isEmailVerified,
      },
    },
  });
});

// GET /api/v1/auth/health - Health check for auth service
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication service is healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
