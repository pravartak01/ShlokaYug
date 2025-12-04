/**
 * Admin Routes - Platform Management API Endpoints
 * CRITICAL: Handles guru verification, content moderation, and user management
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import middleware
const { auth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { checkRole } = require('../middleware/roleCheck');

// Import admin controller
const adminController = require('../controllers/adminController');

// Import challenge controller for admin challenge routes
const challengeController = require('../controllers/challengeController');

// Import message controller for admin message management
const messageController = require('../controllers/messageController');

// Import validators
const {
  createChallengeValidation,
  updateChallengeValidation,
  challengeIdValidation
} = require('../validators/challengeValidators');

// =====================================
// MIDDLEWARE SETUP
// =====================================

// All admin routes require authentication and admin role
router.use(auth);
router.use(checkRole('admin'));

// =====================================
// DASHBOARD & ANALYTICS ROUTES
// =====================================

/**
 * @route   GET /api/v1/admin/dashboard/stats
 * @desc    Get admin dashboard statistics and platform overview
 * @access  Private (Admin only)
 */
router.get('/dashboard/stats', adminController.getDashboardStats);

// =====================================
// GURU MANAGEMENT ROUTES
// =====================================

/**
 * @route   GET /api/v1/admin/gurus
 * @desc    Get all guru applications with filtering capabilities
 * @access  Private (Admin only)
 */
router.get('/gurus',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    query('status')
      .optional()
      .isIn(['submitted', 'approved', 'rejected'])
      .withMessage('Status must be submitted, approved, or rejected')
  ],
  validateRequest,
  adminController.getAllGurus
);

/**
 * @route   GET /api/v1/admin/gurus/pending
 * @desc    Get pending guru applications for review
 * @access  Private (Admin only)
 */
router.get('/gurus/pending',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
  ],
  validateRequest,
  adminController.getPendingGuruApplications
);

/**
 * @route   GET /api/v1/admin/gurus/:userId/details
 * @desc    Get detailed guru application information for review
 * @access  Private (Admin only)
 */
router.get('/gurus/:userId/details',
  [
    param('userId')
      .isMongoId()
      .withMessage('Invalid user ID format')
  ],
  validateRequest,
  adminController.getGuruApplicationDetails
);

/**
 * @route   POST /api/v1/admin/gurus/:userId/review
 * @desc    Approve or reject guru application
 * @access  Private (Admin only)
 */
router.post('/gurus/:userId/review',
  [
    param('userId')
      .isMongoId()
      .withMessage('Invalid user ID format'),
    body('action')
      .isIn(['approve', 'reject'])
      .withMessage('Action must be either approve or reject'),
    body('notes')
      .notEmpty()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Review notes are required (10-1000 characters)'),
    body('credentials_verified')
      .optional()
      .isBoolean()
      .withMessage('Credentials verification flag must be boolean'),
    body('experience_verified')
      .optional()
      .isBoolean()
      .withMessage('Experience verification flag must be boolean')
  ],
  validateRequest,
  adminController.reviewGuruApplication
);

// =====================================
// USER MANAGEMENT ROUTES
// =====================================

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with filtering and search capabilities
 * @access  Private (Admin only)
 */
router.get('/users',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('role')
      .optional()
      .isIn(['student', 'guru', 'admin'])
      .withMessage('Invalid role filter'),
    query('status')
      .optional()
      .isIn(['active', 'suspended', 'banned'])
      .withMessage('Invalid status filter'),
    query('search')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Search query too long')
  ],
  validateRequest,
  adminController.getAllUsers
);

/**
 * @route   POST /api/v1/admin/users/:userId/moderate
 * @desc    Suspend, activate, or ban a user
 * @access  Private (Admin only)
 */
router.post('/users/:userId/moderate',
  [
    param('userId')
      .isMongoId()
      .withMessage('Invalid user ID format'),
    body('action')
      .isIn(['suspend', 'activate', 'ban'])
      .withMessage('Action must be suspend, activate, or ban'),
    body('reason')
      .notEmpty()
      .isLength({ min: 5, max: 500 })
      .withMessage('Reason is required (5-500 characters)'),
    body('duration')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Duration must be 1-365 days')
  ],
  validateRequest,
  adminController.moderateUser
);

// =====================================
// CONTENT MODERATION ROUTES
// =====================================

/**
 * @route   GET /api/v1/admin/content/moderation
 * @desc    Get content moderation queue (courses, posts awaiting approval)
 * @access  Private (Admin only)
 */
router.get('/content/moderation',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    query('type')
      .optional()
      .isIn(['course', 'post', 'video'])
      .withMessage('Invalid content type filter')
  ],
  validateRequest,
  adminController.getContentModerationQueue
);

// =====================================
// PLATFORM MANAGEMENT ROUTES
// =====================================

/**
 * @route   GET /api/v1/admin/analytics/platform
 * @desc    Get detailed platform analytics and insights
 * @access  Private (Admin only)
 */
router.get('/analytics/platform', (req, res) => {
  // TODO: Implement comprehensive platform analytics
  res.status(200).json({
    success: true,
    message: 'Platform analytics endpoint - Coming soon',
    data: {
      userGrowth: 'Monthly user acquisition trends',
      revenueAnalytics: 'Revenue breakdown by course/guru',
      contentMetrics: 'Course completion rates, engagement',
      qualityMetrics: 'User satisfaction, content quality scores'
    }
  });
});

/**
 * @route   GET /api/v1/admin/reports/revenue
 * @desc    Get revenue reports and financial analytics
 * @access  Private (Admin only)
 */
router.get('/reports/revenue', (req, res) => {
  // TODO: Implement revenue reporting
  res.status(200).json({
    success: true,
    message: 'Revenue reports endpoint - Coming soon',
    data: {
      totalRevenue: 'Platform commission earnings',
      guruEarnings: 'Guru payout summaries',
      coursePerformance: 'Top performing courses by revenue',
      subscriptionMetrics: 'Subscription analytics'
    }
  });
});

// =====================================
// CHALLENGE MANAGEMENT ROUTES
// =====================================

/**
 * @route   GET /api/v1/admin/challenges
 * @desc    Get all challenges with filtering and pagination
 * @access  Private (Admin only)
 */
router.get('/challenges',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    query('status')
      .optional()
      .isIn(['draft', 'active', 'completed', 'cancelled'])
      .withMessage('Invalid status filter')
  ],
  validateRequest,
  challengeController.getAllChallenges
);

/**
 * @route   POST /api/v1/admin/challenges
 * @desc    Create new challenge
 * @access  Private (Admin only)
 */
router.post('/challenges',
  createChallengeValidation,
  validateRequest,
  challengeController.createChallenge
);

/**
 * @route   GET /api/v1/admin/challenges/:id
 * @desc    Get single challenge by ID
 * @access  Private (Admin only)
 */
router.get('/challenges/:id',
  challengeIdValidation,
  validateRequest,
  challengeController.getChallengeById
);

/**
 * @route   PUT /api/v1/admin/challenges/:id
 * @desc    Update challenge
 * @access  Private (Admin only)
 */
router.put('/challenges/:id',
  challengeIdValidation,
  updateChallengeValidation,
  validateRequest,
  challengeController.updateChallenge
);

/**
 * @route   DELETE /api/v1/admin/challenges/:id
 * @desc    Delete challenge
 * @access  Private (Admin only)
 */
router.delete('/challenges/:id',
  challengeIdValidation,
  validateRequest,
  challengeController.deleteChallenge
);

/**
 * @route   POST /api/v1/admin/challenges/:id/activate
 * @desc    Activate challenge
 * @access  Private (Admin only)
 */
router.post('/challenges/:id/activate',
  challengeIdValidation,
  validateRequest,
  challengeController.activateChallenge
);

/**
 * @route   GET /api/v1/admin/challenges/analytics
 * @desc    Get challenge analytics
 * @access  Private (Admin only)
 */
router.get('/challenges/analytics',
  challengeController.getChallengeAnalytics
);

// =====================================
// MESSAGE HISTORY MANAGEMENT ROUTES
// =====================================

/**
 * @route   GET /api/v1/admin/messages/overview
 * @desc    Get platform-wide message history overview and statistics
 * @access  Private (Admin only)
 */
router.get('/messages/overview', async (req, res) => {
  try {
    const MessageHistory = require('../models/MessageHistory');
    
    // Get basic statistics
    const totalMessages = await MessageHistory.countDocuments();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayMessages = await MessageHistory.countDocuments({
      'conversation_metadata.timestamp': { $gte: todayStart }
    });
    
    const analysisMessages = await MessageHistory.countDocuments({
      'conversation_metadata.message_type': 'analysis_result'
    });
    
    // Get most analyzed chandas
    const chandasStats = await MessageHistory.aggregate([
      {
        $match: {
          'conversation_metadata.message_type': 'analysis_result',
          'conversation_metadata.analysis_data.chandas_name': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$conversation_metadata.analysis_data.chandas_name',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$conversation_metadata.analysis_data.confidence_score' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({
      success: true,
      message: 'Message history overview retrieved successfully',
      data: {
        totalMessages,
        todayMessages,
        analysisMessages,
        topChandas: chandasStats,
        messageTypes: {
          user_input: await MessageHistory.countDocuments({ 'conversation_metadata.message_type': 'user_input' }),
          bot_response: await MessageHistory.countDocuments({ 'conversation_metadata.message_type': 'bot_response' }),
          analysis_result: analysisMessages
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve message overview',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/v1/admin/messages/users/:userId/history
 * @desc    Get message history for a specific user (admin view)
 * @access  Private (Admin only)
 */
router.get('/messages/users/:userId/history',
  [
    param('userId')
      .isMongoId()
      .withMessage('Invalid user ID format'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 200 })
      .withMessage('Limit must be between 1 and 200'),
    query('session_id')
      .optional()
      .isString()
      .withMessage('Session ID must be a string')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 50, session_id } = req.query;
      
      const MessageHistory = require('../models/MessageHistory');
      
      const query = { user_id: userId };
      if (session_id) {
        query['conversation_metadata.session_id'] = session_id;
      }
      
      const messages = await MessageHistory.find(query)
        .sort({ 'conversation_metadata.timestamp': -1 })
        .limit(parseInt(limit))
        .populate('user_id', 'username profile.firstName profile.lastName email');
        
      res.status(200).json({
        success: true,
        message: 'User message history retrieved successfully',
        data: {
          userId,
          messages,
          totalMessages: messages.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user message history',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// =====================================
// SYSTEM HEALTH & MONITORING
// =====================================

/**
 * @route   GET /api/v1/admin/health
 * @desc    Admin service health check and system status
 * @access  Private (Admin only)
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin service is healthy',
    data: {
      service: 'admin',
      status: 'operational',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0'
    }
  });
});

// =====================================
// EMERGENCY CONTROLS
// =====================================

/**
 * @route   POST /api/v1/admin/emergency/platform-maintenance
 * @desc    Enable/disable platform maintenance mode
 * @access  Private (Admin only)
 */
router.post('/emergency/platform-maintenance',
  [
    body('enabled')
      .isBoolean()
      .withMessage('Enabled flag must be boolean'),
    body('message')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Maintenance message too long')
  ],
  validateRequest,
  (req, res) => {
    // TODO: Implement maintenance mode control
    const { enabled, message } = req.body;
    
    res.status(200).json({
      success: true,
      message: 'Maintenance mode control - Coming soon',
      data: {
        maintenanceEnabled: enabled,
        maintenanceMessage: message || 'Platform under maintenance'
      }
    });
  }
);

// =====================================
// ERROR HANDLING
// =====================================

// Handle 404 for admin routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Admin route ${req.originalUrl} not found`,
      code: 'ADMIN_ROUTE_NOT_FOUND',
      availableEndpoints: [
        'GET /admin/dashboard/stats',
        'GET /admin/gurus',
        'GET /admin/gurus/pending', 
        'POST /admin/gurus/:id/review',
        'GET /admin/users',
        'POST /admin/users/:id/moderate',
        'GET /admin/content/moderation',
        'GET /admin/challenges',
        'POST /admin/challenges',
        'PUT /admin/challenges/:id',
        'DELETE /admin/challenges/:id',
        'POST /admin/challenges/:id/activate'
      ]
    }
  });
});

module.exports = router;