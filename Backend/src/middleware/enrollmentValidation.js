const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

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

// Custom validator for MongoDB ObjectId
const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

// Custom validator for device ID format
const isValidDeviceId = (value) => {
  return /^[a-f0-9]{16}$/.test(value);
};

// Validation for enrollment initiation
const validateInitiateEnrollment = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .custom(isValidObjectId)
    .withMessage('Course ID must be a valid MongoDB ObjectId'),
    
  body('enrollmentType')
    .optional()
    .isIn(['subscription', 'one_time'])
    .withMessage('Enrollment type must be either "subscription" or "one_time"'),

  body('deviceInfo')
    .optional()
    .isObject()
    .withMessage('Device info must be an object'),

  body('deviceInfo.platform')
    .optional()
    .isIn(['web', 'mobile', 'tablet', 'desktop'])
    .withMessage('Platform must be one of: web, mobile, tablet, desktop'),

  handleValidationErrors
];

// Validation for enrollment confirmation
const validateConfirmEnrollment = [
  body('razorpay_order_id')
    .notEmpty()
    .withMessage('Razorpay order ID is required')
    .isString()
    .withMessage('Razorpay order ID must be a string')
    .matches(/^order_[A-Za-z0-9]+$/)
    .withMessage('Invalid Razorpay order ID format'),

  body('razorpay_payment_id')
    .notEmpty()
    .withMessage('Razorpay payment ID is required')
    .isString()
    .withMessage('Razorpay payment ID must be a string')
    .matches(/^pay_[A-Za-z0-9]+$/)
    .withMessage('Invalid Razorpay payment ID format'),

  body('razorpay_signature')
    .notEmpty()
    .withMessage('Razorpay signature is required')
    .isString()
    .withMessage('Razorpay signature must be a string')
    .isLength({ min: 64, max: 128 })
    .withMessage('Invalid Razorpay signature length'),

  body('transactionId')
    .notEmpty()
    .withMessage('Transaction ID is required')
    .isString()
    .withMessage('Transaction ID must be a string')
    .matches(/^TXN_[0-9]+_[A-Z0-9]{6}$/)
    .withMessage('Invalid transaction ID format'),

  handleValidationErrors
];

// Validation for enrollment ID parameter
const validateEnrollmentId = [
  param('id')
    .notEmpty()
    .withMessage('Enrollment ID is required')
    .custom(isValidObjectId)
    .withMessage('Enrollment ID must be a valid MongoDB ObjectId'),

  handleValidationErrors
];

// Validation for device ID parameter
const validateDeviceId = [
  param('deviceId')
    .notEmpty()
    .withMessage('Device ID is required')
    .custom(isValidDeviceId)
    .withMessage('Device ID must be a valid 16-character hexadecimal string'),

  handleValidationErrors
];

// Validation for get enrollments query parameters
const validateGetEnrollments = [
  query('status')
    .optional()
    .isIn(['active', 'suspended', 'expired', 'cancelled', 'pending'])
    .withMessage('Status must be one of: active, suspended, expired, cancelled, pending'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sortBy')
    .optional()
    .isIn(['enrollmentDate', 'lastAccessed', 'status', 'progress'])
    .withMessage('Sort by must be one of: enrollmentDate, lastAccessed, status, progress'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either "asc" or "desc"'),

  handleValidationErrors
];

// Validation for access validation request
const validateAccessValidation = [
  body('lectureId')
    .optional()
    .isString()
    .withMessage('Lecture ID must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Lecture ID must be between 1 and 100 characters'),

  body('requestedAction')
    .optional()
    .isIn(['view', 'download', 'stream'])
    .withMessage('Requested action must be one of: view, download, stream'),

  handleValidationErrors
];

// Validation for device addition
const validateAddDevice = [
  body('deviceInfo')
    .optional()
    .isObject()
    .withMessage('Device info must be an object'),

  body('deviceInfo.platform')
    .optional()
    .isIn(['web', 'mobile', 'tablet', 'desktop'])
    .withMessage('Platform must be one of: web, mobile, tablet, desktop'),

  body('deviceInfo.browser')
    .optional()
    .isString()
    .withMessage('Browser must be a string')
    .isLength({ max: 50 })
    .withMessage('Browser name cannot exceed 50 characters'),

  body('deviceInfo.os')
    .optional()
    .isString()
    .withMessage('OS must be a string')
    .isLength({ max: 50 })
    .withMessage('OS name cannot exceed 50 characters'),

  body('deviceName')
    .optional()
    .isString()
    .withMessage('Device name must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Device name must be between 1 and 100 characters')
    .trim(),

  handleValidationErrors
];

// Validation for progress update
const validateProgressUpdate = [
  body('lectureId')
    .notEmpty()
    .withMessage('Lecture ID is required')
    .isString()
    .withMessage('Lecture ID must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Lecture ID must be between 1 and 100 characters'),

  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a non-negative integer'),

  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean'),

  body('progress')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),

  handleValidationErrors
];

// Validation for subscription management
const validateSubscriptionAction = [
  body('action')
    .notEmpty()
    .withMessage('Action is required')
    .isIn(['pause', 'resume', 'cancel', 'renew'])
    .withMessage('Action must be one of: pause, resume, cancel, renew'),

  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string')
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
    .trim(),

  body('effectiveDate')
    .optional()
    .isISO8601()
    .withMessage('Effective date must be a valid ISO 8601 date')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date < now) {
        throw new Error('Effective date cannot be in the past');
      }
      return true;
    }),

  handleValidationErrors
];

// Validation for enrollment cancellation
const validateCancelEnrollment = [
  body('reason')
    .notEmpty()
    .withMessage('Cancellation reason is required')
    .isString()
    .withMessage('Reason must be a string')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters')
    .trim(),

  body('requestRefund')
    .optional()
    .isBoolean()
    .withMessage('Request refund must be a boolean'),

  body('refundReason')
    .optional()
    .isString()
    .withMessage('Refund reason must be a string')
    .isLength({ max: 500 })
    .withMessage('Refund reason cannot exceed 500 characters')
    .trim(),

  handleValidationErrors
];

// Validation for enrollment search/filter
const validateEnrollmentSearch = [
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Search must be between 2 and 100 characters')
    .trim(),

  query('courseId')
    .optional()
    .custom(isValidObjectId)
    .withMessage('Course ID must be a valid MongoDB ObjectId'),

  query('guruId')
    .optional()
    .custom(isValidObjectId)
    .withMessage('Guru ID must be a valid MongoDB ObjectId'),

  query('enrollmentType')
    .optional()
    .isIn(['subscription', 'one_time'])
    .withMessage('Enrollment type must be either "subscription" or "one_time"'),

  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO 8601 date'),

  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query.dateFrom && value < req.query.dateFrom) {
        throw new Error('Date to must be after date from');
      }
      return true;
    }),

  handleValidationErrors
];

// Validation for guru enrollment analytics
const validateEnrollmentAnalytics = [
  query('period')
    .optional()
    .isIn(['day', 'week', 'month', 'quarter', 'year'])
    .withMessage('Period must be one of: day, week, month, quarter, year'),

  query('courseId')
    .optional()
    .custom(isValidObjectId)
    .withMessage('Course ID must be a valid MongoDB ObjectId'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query.startDate && value < req.query.startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  handleValidationErrors
];

// Middleware to check enrollment ownership or permission
const checkEnrollmentAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Admin has access to all enrollments
    if (userRole === 'admin') {
      return next();
    }

    const Enrollment = require('../models/EnrollmentEnhanced');
    const enrollment = await Enrollment.findById(id).select('userId guruId');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if user owns the enrollment or is the instructor
    const hasAccess = 
      enrollment.userId.toString() === userId ||
      enrollment.guruId.toString() === userId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this enrollment'
      });
    }

    // Store enrollment data for use in controller
    req.enrollmentAccess = {
      enrollmentId: enrollment._id,
      isOwner: enrollment.userId.toString() === userId,
      isInstructor: enrollment.guruId.toString() === userId
    };

    next();
  } catch (error) {
    console.error('Enrollment access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking enrollment access'
    });
  }
};

module.exports = {
  validateInitiateEnrollment,
  validateConfirmEnrollment,
  validateEnrollmentId,
  validateDeviceId,
  validateGetEnrollments,
  validateAccessValidation,
  validateAddDevice,
  validateProgressUpdate,
  validateSubscriptionAction,
  validateCancelEnrollment,
  validateEnrollmentSearch,
  validateEnrollmentAnalytics,
  checkEnrollmentAccess,
  handleValidationErrors
};