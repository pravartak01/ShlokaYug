const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');

// Import middleware
const { auth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Import controllers
const {
  getMySubscriptions,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  renewSubscription,
  updateSubscriptionPreferences,
  getSubscriptionAnalytics
} = require('../controllers/subscriptionController');

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

// Validation for enrollment ID parameter
const validateEnrollmentId = [
  param('enrollmentId')
    .notEmpty()
    .withMessage('Enrollment ID is required')
    .isMongoId()
    .withMessage('Enrollment ID must be a valid MongoDB ObjectId'),
  handleValidationErrors
];

// Validation for pause subscription
const validatePauseSubscription = [
  body('reason')
    .notEmpty()
    .withMessage('Pause reason is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Reason must be between 5 and 200 characters'),
  body('pauseDuration')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Pause duration must be between 1 and 365 days'),
  handleValidationErrors
];

// Validation for cancel subscription
const validateCancelSubscription = [
  body('reason')
    .notEmpty()
    .withMessage('Cancellation reason is required')
    .isIn([
      'too_expensive',
      'not_using',
      'technical_issues',
      'content_quality',
      'found_alternative',
      'temporary_break',
      'other'
    ])
    .withMessage('Invalid cancellation reason'),
  body('immediate')
    .optional()
    .isBoolean()
    .withMessage('Immediate must be a boolean'),
  body('feedback')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Feedback must be less than 500 characters'),
  handleValidationErrors
];

// Validation for renew subscription
const validateRenewSubscription = [
  body('billingCycle')
    .optional()
    .isIn(['monthly', 'quarterly', 'yearly'])
    .withMessage('Invalid billing cycle'),
  handleValidationErrors
];

// Validation for update subscription preferences
const validateUpdatePreferences = [
  body('billingCycle')
    .optional()
    .isIn(['monthly', 'quarterly', 'yearly'])
    .withMessage('Invalid billing cycle'),
  body('autoRenewal')
    .optional()
    .isBoolean()
    .withMessage('Auto renewal must be a boolean'),
  body('deviceLimit')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Device limit must be between 1 and 10'),
  handleValidationErrors
];

// Validation for analytics query parameters
const validateAnalyticsQuery = [
  query('period')
    .optional()
    .isIn(['day', 'week', 'month'])
    .withMessage('Period must be day, week, or month'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be valid ISO 8601 date'),
  query('courseId')
    .optional()
    .isMongoId()
    .withMessage('Course ID must be valid MongoDB ObjectId'),
  handleValidationErrors
];

// @desc    Get user's active subscriptions
// @route   GET /api/subscriptions/my-subscriptions
// @access  Private (Student only)
router.get('/my-subscriptions',
  auth,
  checkRole(['student']),
  query('status')
    .optional()
    .isIn(['active', 'trialing', 'paused', 'cancelled', 'expired', 'past_due'])
    .withMessage('Invalid status filter'),
  query('includeExpired')
    .optional()
    .isBoolean()
    .withMessage('Include expired must be a boolean'),
  handleValidationErrors,
  getMySubscriptions
);

// @desc    Pause subscription
// @route   POST /api/subscriptions/:enrollmentId/pause
// @access  Private (Student - own subscription only)
router.post('/:enrollmentId/pause',
  auth,
  checkRole(['student']),
  ...validateEnrollmentId,
  ...validatePauseSubscription,
  pauseSubscription
);

// @desc    Resume subscription
// @route   POST /api/subscriptions/:enrollmentId/resume
// @access  Private (Student - own subscription only)
router.post('/:enrollmentId/resume',
  auth,
  checkRole(['student']),
  ...validateEnrollmentId,
  resumeSubscription
);

// @desc    Cancel subscription
// @route   POST /api/subscriptions/:enrollmentId/cancel
// @access  Private (Student - own subscription only)
router.post('/:enrollmentId/cancel',
  auth,
  checkRole(['student']),
  ...validateEnrollmentId,
  ...validateCancelSubscription,
  cancelSubscription
);

// @desc    Renew subscription manually
// @route   POST /api/subscriptions/:enrollmentId/renew
// @access  Private (Student - own subscription only)
router.post('/:enrollmentId/renew',
  auth,
  checkRole(['student']),
  ...validateEnrollmentId,
  ...validateRenewSubscription,
  renewSubscription
);

// @desc    Update subscription preferences
// @route   PATCH /api/subscriptions/:enrollmentId/preferences
// @access  Private (Student - own subscription only)
router.patch('/:enrollmentId/preferences',
  auth,
  checkRole(['student']),
  ...validateEnrollmentId,
  ...validateUpdatePreferences,
  updateSubscriptionPreferences
);

// @desc    Get subscription details
// @route   GET /api/subscriptions/:enrollmentId
// @access  Private (Student - own subscription only)
router.get('/:enrollmentId',
  auth,
  checkRole(['student']),
  ...validateEnrollmentId,
  async (req, res) => {
    try {
      const { enrollmentId } = req.params;
      const userId = req.user.id;

      const EnrollmentEnhanced = require('../models/EnrollmentEnhanced');
      const enrollment = await EnrollmentEnhanced.findById(enrollmentId)
        .populate('courseId', 'title description instructor thumbnail duration pricing')
        .populate('userId', 'name email');

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found'
        });
      }

      // Verify ownership
      if (enrollment.userId._id.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Verify it's a subscription
      if (enrollment.enrollmentType !== 'subscription') {
        return res.status(400).json({
          success: false,
          message: 'This is not a subscription enrollment'
        });
      }

      // Calculate subscription metrics
      const totalPaid = enrollment.paymentHistory.reduce((sum, payment) => 
        sum + (payment.amount || 0), 0);
      
      const daysActive = Math.floor(
        (Date.now() - enrollment.enrollmentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Get payment history
      const PaymentTransaction = require('../models/PaymentTransaction');
      const payments = await PaymentTransaction.find({
        enrollmentId: enrollment._id,
        status: 'success'
      }).sort({ createdAt: -1 }).limit(10);

      // Calculate next billing amount
      const course = enrollment.courseId;
      const billingCycle = enrollment.subscription.billingCycle;
      let nextBillingAmount = course.pricing.subscription[billingCycle];
      
      if (enrollment.subscription.discountPercentage > 0) {
        nextBillingAmount = nextBillingAmount * (1 - enrollment.subscription.discountPercentage / 100);
      }

      const subscriptionDetails = {
        id: enrollment._id,
        course: {
          id: course._id,
          title: course.title,
          description: course.description,
          instructor: course.instructor.name,
          thumbnail: course.thumbnail,
          duration: course.duration
        },
        subscription: {
          status: enrollment.subscription.status,
          plan: enrollment.subscription.plan,
          billingCycle: enrollment.subscription.billingCycle,
          currentPeriodStart: enrollment.subscription.currentPeriodStart,
          currentPeriodEnd: enrollment.subscription.currentPeriodEnd,
          nextBillingDate: enrollment.subscription.nextBillingDate,
          nextBillingAmount,
          cancelAtPeriodEnd: enrollment.subscription.cancelAtPeriodEnd,
          cancelledAt: enrollment.subscription.cancelledAt,
          cancelReason: enrollment.subscription.cancelReason,
          pausedAt: enrollment.subscription.pausedAt,
          pauseReason: enrollment.subscription.pauseReason,
          pauseEndDate: enrollment.subscription.pauseEndDate,
          deviceLimit: enrollment.subscription.deviceLimit,
          trialEnd: enrollment.subscription.trialEnd,
          discountPercentage: enrollment.subscription.discountPercentage
        },
        enrollment: {
          enrollmentDate: enrollment.enrollmentDate,
          status: enrollment.status,
          progress: enrollment.progress,
          lastAccessedAt: enrollment.lastAccessedAt,
          certificateEligible: enrollment.certificateEligible,
          certificateIssued: enrollment.certificateIssued
        },
        devices: {
          registered: enrollment.devices.filter(d => d.isActive).map(device => ({
            id: device.deviceId,
            deviceInfo: device.deviceInfo,
            registeredAt: device.registeredAt,
            lastAccessedAt: device.lastAccessedAt,
            accessCount: device.accessCount
          })),
          limit: enrollment.subscription.deviceLimit,
          available: enrollment.subscription.deviceLimit - enrollment.devices.filter(d => d.isActive).length
        },
        metrics: {
          totalPaid,
          daysActive,
          totalPayments: payments.length,
          averagePayment: payments.length > 0 ? totalPaid / payments.length : 0
        },
        recentPayments: payments.map(payment => ({
          id: payment._id,
          amount: payment.amount.total,
          date: payment.completedAt || payment.createdAt,
          status: payment.status,
          method: payment.paymentMethod
        }))
      };

      res.status(200).json({
        success: true,
        message: 'Subscription details retrieved successfully',
        data: subscriptionDetails
      });

    } catch (error) {
      console.error('Get subscription details error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching subscription details',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @desc    Get subscription analytics for admin/guru
// @route   GET /api/subscriptions/analytics
// @access  Private (Admin/Guru)
router.get('/analytics',
  auth,
  checkRole(['admin', 'guru']),
  ...validateAnalyticsQuery,
  getSubscriptionAnalytics
);

// @desc    Get all subscriptions with filters (Admin/Guru)
// @route   GET /api/subscriptions/manage
// @access  Private (Admin/Guru)
router.get('/manage',
  auth,
  checkRole(['admin', 'guru']),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['active', 'trialing', 'paused', 'cancelled', 'expired', 'past_due'])
    .withMessage('Invalid status filter'),
  query('billingCycle')
    .optional()
    .isIn(['monthly', 'quarterly', 'yearly'])
    .withMessage('Invalid billing cycle filter'),
  query('courseId')
    .optional()
    .isMongoId()
    .withMessage('Course ID must be valid MongoDB ObjectId'),
  query('search')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Search term must be between 2 and 50 characters'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const userRole = req.user.role;
      const userId = req.user.id;
      const {
        page = 1,
        limit = 20,
        status,
        billingCycle,
        courseId,
        search,
        sortBy = 'enrollmentDate',
        sortOrder = 'desc'
      } = req.query;

      const EnrollmentEnhanced = require('../models/EnrollmentEnhanced');

      // Build filter
      const filter = { enrollmentType: 'subscription' };

      // If guru, only show their courses
      if (userRole === 'guru') {
        const Course = require('../models/Course');
        const guruCourses = await Course.find({ 'instructor._id': userId }).select('_id');
        filter.courseId = { $in: guruCourses.map(c => c._id) };
      }

      if (status) filter['subscription.status'] = status;
      if (billingCycle) filter['subscription.billingCycle'] = billingCycle;
      if (courseId) filter.courseId = new require('mongoose').Types.ObjectId(courseId);

      // Build sort object
      const sort = {};
      if (sortBy === 'enrollmentDate') {
        sort.enrollmentDate = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'nextBilling') {
        sort['subscription.nextBillingDate'] = sortOrder === 'asc' ? 1 : -1;
      } else if (sortBy === 'status') {
        sort['subscription.status'] = sortOrder === 'asc' ? 1 : -1;
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        populate: [
          { path: 'courseId', select: 'title instructor thumbnail' },
          { path: 'userId', select: 'name email' }
        ]
      };

      let subscriptions;
      if (search) {
        // Use text search or regex for searching
        const searchRegex = new RegExp(search, 'i');
        const searchFilter = {
          ...filter,
          $or: [
            { 'courseId.title': searchRegex },
            { 'userId.name': searchRegex },
            { 'userId.email': searchRegex }
          ]
        };
        
        subscriptions = await EnrollmentEnhanced.paginate(searchFilter, options);
      } else {
        subscriptions = await EnrollmentEnhanced.paginate(filter, options);
      }

      const subscriptionData = subscriptions.docs.map(enrollment => ({
        id: enrollment._id,
        user: {
          id: enrollment.userId._id,
          name: enrollment.userId.name,
          email: enrollment.userId.email
        },
        course: {
          id: enrollment.courseId._id,
          title: enrollment.courseId.title,
          instructor: enrollment.courseId.instructor.name,
          thumbnail: enrollment.courseId.thumbnail
        },
        subscription: {
          status: enrollment.subscription.status,
          billingCycle: enrollment.subscription.billingCycle,
          currentPeriodStart: enrollment.subscription.currentPeriodStart,
          currentPeriodEnd: enrollment.subscription.currentPeriodEnd,
          nextBillingDate: enrollment.subscription.nextBillingDate,
          cancelAtPeriodEnd: enrollment.subscription.cancelAtPeriodEnd,
          deviceLimit: enrollment.subscription.deviceLimit
        },
        enrollmentDate: enrollment.enrollmentDate,
        progress: enrollment.progress,
        activeDevices: enrollment.devices.filter(d => d.isActive).length,
        lastAccessedAt: enrollment.lastAccessedAt
      }));

      res.status(200).json({
        success: true,
        message: 'Subscriptions retrieved successfully',
        data: {
          subscriptions: subscriptionData,
          pagination: {
            currentPage: subscriptions.page,
            totalPages: subscriptions.totalPages,
            totalSubscriptions: subscriptions.totalDocs,
            hasNext: subscriptions.hasNextPage,
            hasPrev: subscriptions.hasPrevPage,
            limit: subscriptions.limit
          },
          filters: { status, billingCycle, courseId, search },
          sort: { sortBy, sortOrder }
        }
      });

    } catch (error) {
      console.error('Get subscriptions management error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching subscriptions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

module.exports = router;
