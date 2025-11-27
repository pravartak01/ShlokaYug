const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const { validateGoogleToken } = require('../services/googleAuthService');

// In-memory token storage (replace with Redis in production)
const blacklistedTokens = new Set();
const refreshTokens = new Map();

// Helper function to simulate Redis cache
const cache = {
  set: async (key, value, ttl) => {
    if (key.startsWith('blacklist:')) {
      blacklistedTokens.add(key.replace('blacklist:', ''));
    } else if (key.startsWith('refresh_token:')) {
      refreshTokens.set(key.replace('refresh_token:', ''), value);
    }
    return true;
  },
  get: async (key) => {
    if (key.startsWith('blacklist:')) {
      return blacklistedTokens.has(key.replace('blacklist:', '')) ? true : null;
    }
    if (key.startsWith('refresh_token:')) {
      return refreshTokens.get(key.replace('refresh_token:', '')) || null;
    }
    return null;
  },
  del: async (key) => {
    if (key.startsWith('blacklist:')) {
      blacklistedTokens.delete(key.replace('blacklist:', ''));
    } else if (key.startsWith('refresh_token:')) {
      refreshTokens.delete(key.replace('refresh_token:', ''));
    }
    return true;
  },
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, username, password, firstName, lastName, preferredScript } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
      return res.status(409).json({
        success: false,
        error: {
          message: `${field === 'email' ? 'Email' : 'Username'} is already registered`,
          code: 'USER_EXISTS',
          field,
        },
      });
    }

    // Create user - AUTO-APPROVE AS VERIFIED GURU FOR DEVELOPMENT
    const user = await User.create({
      email: email.toLowerCase(),
      username,
      password,
      role: 'guru', // Auto-assign guru role
      profile: {
        firstName,
        lastName,
        preferredScript: preferredScript || 'devanagari',
      },
      guruProfile: {
        applicationStatus: 'approved',
        verification: {
          isVerified: true,
          verifiedAt: new Date(),
          verificationNotes: 'Auto-approved for development',
        },
        credentials: [{
          type: 'certificate',
          title: 'Verified Sanskrit Teacher',
          institution: 'Auto-verified',
          year: new Date().getFullYear(),
          description: 'Auto-verified for development',
          isVerified: true
        }],
        experience: {
          years: 5,
          description: 'Auto-verified experienced teacher'
        },
      },
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    await sendVerificationEmail(user, verificationToken);

    // Generate JWT token
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token in Redis
    await cache.set(`refresh_token:${user._id}`, refreshToken, 30 * 24 * 60 * 60); // 30 days

    // Update login metadata
    user.metadata.loginCount += 1;
    user.metadata.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          profile: user.profile,
          role: user.role,
          subscription: user.subscription,
          isEmailVerified: user.verification.isEmailVerified,
        },
        tokens: {
          access: token,
          refresh: refreshToken,
          expiresIn: process.env.JWT_EXPIRE || '7d',
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Registration failed',
        code: 'REGISTRATION_ERROR',
      },
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find user by email or username
    const user = await User.findByIdentifier(identifier).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    // Check if account is banned
    if (user.metadata.bannedUntil && user.metadata.bannedUntil > new Date()) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Account is suspended',
          code: 'ACCOUNT_SUSPENDED',
          bannedUntil: user.metadata.bannedUntil,
          reason: user.metadata.banReason,
        },
      });
    }

    // Generate tokens
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token in Redis
    await cache.set(`refresh_token:${user._id}`, refreshToken, 30 * 24 * 60 * 60); // 30 days

    // Update login metadata
    user.metadata.loginCount += 1;
    user.metadata.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          profile: user.profile,
          role: user.role,
          subscription: user.subscription,
          gamification: user.gamification,
          isEmailVerified: user.verification.isEmailVerified,
        },
        tokens: {
          access: token,
          refresh: refreshToken,
          expiresIn: process.env.JWT_EXPIRE || '7d',
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Login failed',
        code: 'LOGIN_ERROR',
      },
    });
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const { token } = req;
    const userId = req.user._id;

    // Blacklist the current token
    await cache.set(`blacklist:${token}`, true, 7 * 24 * 60 * 60); // 7 days

    // Remove refresh token
    await cache.del(`refresh_token:${userId}`);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Logout failed',
        code: 'LOGOUT_ERROR',
      },
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Refresh token is required',
          code: 'REFRESH_TOKEN_REQUIRED',
        },
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

    // Check if refresh token exists in Redis
    const storedToken = await cache.get(`refresh_token:${decoded.id}`);
    if (!storedToken || storedToken !== token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN',
        },
      });
    }

    // Get user
    const user = await User.findById(decoded.id);
    if (!user || !user.metadata.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
    }

    // Generate new tokens
    const newAccessToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();

    // Update refresh token in Redis
    await cache.set(`refresh_token:${user._id}`, newRefreshToken, 30 * 24 * 60 * 60);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: {
          access: newAccessToken,
          refresh: newRefreshToken,
          expiresIn: process.env.JWT_EXPIRE || '7d',
        },
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: {
        message: 'Token refresh failed',
        code: 'REFRESH_TOKEN_ERROR',
      },
    });
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
      'metadata.isActive': true,
    });

    if (!user) {
      // Don't reveal if email exists for security
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(user, resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Password reset request failed',
        code: 'FORGOT_PASSWORD_ERROR',
      },
    });
  }
};

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Hash the token to match stored version
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      'verification.passwordResetToken': hashedToken,
      'verification.passwordResetExpires': { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid or expired reset token',
          code: 'INVALID_RESET_TOKEN',
        },
      });
    }

    // Set new password
    user.password = password;
    user.verification.passwordResetToken = undefined;
    user.verification.passwordResetExpires = undefined;

    await user.save();

    // Generate new tokens
    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token
    await cache.set(`refresh_token:${user._id}`, refreshToken, 30 * 24 * 60 * 60);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      data: {
        tokens: {
          access: accessToken,
          refresh: refreshToken,
          expiresIn: process.env.JWT_EXPIRE || '7d',
        },
      },
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Password reset failed',
        code: 'PASSWORD_RESET_ERROR',
      },
    });
  }
};

// @desc    Verify email
// @route   POST /api/v1/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // Hash the token to match stored version
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      'verification.emailVerificationToken': hashedToken,
      'verification.emailVerificationExpires': { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid or expired verification token',
          code: 'INVALID_VERIFICATION_TOKEN',
        },
      });
    }

    // Verify email
    user.verification.isEmailVerified = true;
    user.verification.emailVerificationToken = undefined;
    user.verification.emailVerificationExpires = undefined;

    await user.save();

    // Award XP for email verification
    await user.addXP(50);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        xpEarned: 50,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Email verification failed',
        code: 'EMAIL_VERIFICATION_ERROR',
      },
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/v1/auth/resend-verification
// @access  Private
const resendVerification = async (req, res) => {
  try {
    const { user } = req;

    if (user.verification.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email is already verified',
          code: 'EMAIL_ALREADY_VERIFIED',
        },
      });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    await sendVerificationEmail(user, verificationToken);

    res.status(200).json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to resend verification email',
        code: 'RESEND_VERIFICATION_ERROR',
      },
    });
  }
};

// @desc    Google OAuth login
// @route   POST /api/v1/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Google token is required',
          code: 'GOOGLE_TOKEN_REQUIRED',
        },
      });
    }

    // Validate Google token
    const googleUser = await validateGoogleToken(tokenId);

    if (!googleUser) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid Google token',
          code: 'INVALID_GOOGLE_TOKEN',
        },
      });
    }

    // Check if user exists
    let user = await User.findOne({
      $or: [{ 'socialAuth.googleId': googleUser.sub }, { email: googleUser.email.toLowerCase() }],
    });

    if (user) {
      // Update Google ID if not set
      if (!user.socialAuth.googleId) {
        user.socialAuth.googleId = googleUser.sub;
        user.verification.isEmailVerified = true; // Google emails are pre-verified
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        email: googleUser.email.toLowerCase(),
        username: googleUser.email.split('@')[0], // Use email prefix as username
        profile: {
          firstName: googleUser.given_name || '',
          lastName: googleUser.family_name || '',
          avatar: googleUser.picture || null,
        },
        socialAuth: {
          googleId: googleUser.sub,
        },
        verification: {
          isEmailVerified: true, // Google emails are pre-verified
        },
      });
    }

    // Generate tokens
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token
    await cache.set(`refresh_token:${user._id}`, refreshToken, 30 * 24 * 60 * 60);

    // Update login metadata
    user.metadata.loginCount += 1;
    user.metadata.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          profile: user.profile,
          role: user.role,
          subscription: user.subscription,
          isEmailVerified: user.verification.isEmailVerified,
        },
        tokens: {
          access: token,
          refresh: refreshToken,
          expiresIn: process.env.JWT_EXPIRE || '7d',
        },
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Google authentication failed',
        code: 'GOOGLE_AUTH_ERROR',
      },
    });
  }
};

// @desc    Change password
// @route   POST /api/v1/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD',
        },
      });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    // Invalidate all existing tokens by removing refresh token
    await cache.del(`refresh_token:${user._id}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please login again.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Password change failed',
        code: 'PASSWORD_CHANGE_ERROR',
      },
    });
  }
};

// @desc    Get user profile
// @route   GET /api/v1/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get profile',
        code: 'GET_PROFILE_ERROR',
      },
    });
  }
};

// Helper function to send verification email
const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const emailData = {
    to: user.email,
    subject: 'Verify Your Email - ShlokaYug',
    template: 'emailVerification',
    context: {
      firstName: user.profile.firstName,
      verificationUrl,
      expiryHours: 24,
    },
  };

  await sendEmail(emailData);
};

// Helper function to send password reset email
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const emailData = {
    to: user.email,
    subject: 'Reset Your Password - ShlokaYug',
    template: 'passwordReset',
    context: {
      firstName: user.profile.firstName,
      resetUrl,
      expiryMinutes: 10,
    },
  };

  await sendEmail(emailData);
};

module.exports = {
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
};
