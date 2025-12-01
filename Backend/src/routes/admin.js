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
        'GET /admin/gurus/pending', 
        'POST /admin/gurus/:id/review',
        'GET /admin/users',
        'POST /admin/users/:id/moderate',
        'GET /admin/content/moderation'
      ]
    }
  });
});

module.exports = router;