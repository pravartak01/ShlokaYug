const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { name, avatar, profile } = req.body;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update basic info
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    
    // Update profile information
    if (profile) {
      if (profile.level) user.profile.level = profile.level;
      if (profile.favoriteMeters) user.profile.favoriteMeters = profile.favoriteMeters;
      if (profile.preferences) {
        if (profile.preferences.language) {
          user.profile.preferences.language = profile.preferences.language;
        }
        if (profile.preferences.notifications) {
          user.profile.preferences.notifications = {
            ...user.profile.preferences.notifications,
            ...profile.preferences.notifications
          };
        }
      }
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          profile: user.profile
        }
      }
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Update learning progress
// @route   PUT /api/user/progress
// @access  Private
exports.updateLearningProgress = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { shlokasCompleted, accuracy, streakDays } = req.body;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update learning progress
    const currentProgress = user.profile.learningProgress;
    const lastPracticeDate = currentProgress.lastPracticeDate;
    const today = new Date();
    
    // Check if practice is on consecutive days for streak
    let newStreakDays = streakDays !== undefined ? streakDays : currentProgress.streakDays;
    
    if (lastPracticeDate) {
      const daysDiff = Math.floor((today - lastPracticeDate) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        // Consecutive day - increment streak
        newStreakDays = currentProgress.streakDays + 1;
      } else if (daysDiff > 1) {
        // Streak broken - reset to 1
        newStreakDays = 1;
      }
      // If daysDiff === 0, it's the same day, keep current streak
    } else {
      // First practice
      newStreakDays = 1;
    }
    
    user.profile.learningProgress = {
      shlokasCompleted: shlokasCompleted !== undefined ? shlokasCompleted : currentProgress.shlokasCompleted,
      accuracy: accuracy !== undefined ? accuracy : currentProgress.accuracy,
      streakDays: newStreakDays,
      lastPracticeDate: today
    };
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Learning progress updated successfully',
      data: {
        learningProgress: user.profile.learningProgress
      }
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/user/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check current password
    const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    
    // Clear all refresh tokens for security
    user.refreshTokens = [];
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/user/account
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);
    
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }
    
    // Delete user
    await User.findByIdAndDelete(userId);
    
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
    
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/user/stats
// @access  Private
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const stats = {
      totalShlokasCompleted: user.profile.learningProgress.shlokasCompleted,
      currentAccuracy: user.profile.learningProgress.accuracy,
      currentStreak: user.profile.learningProgress.streakDays,
      level: user.profile.level,
      favoriteMetersCount: user.profile.favoriteMeters.length,
      memberSince: user.createdAt,
      lastPractice: user.profile.learningProgress.lastPracticeDate
    };
    
    res.status(200).json({
      success: true,
      data: { stats }
    });
    
  } catch (error) {
    next(error);
  }
};