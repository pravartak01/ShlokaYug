const { body, param, query } = require('express-validator');

/**
 * Course Validation Middleware
 * Provides validation rules for all course-related operations
 */

// ============================================================================
// COURSE CREATION & UPDATE VALIDATIONS
// ============================================================================

// Simplified validation - minimal checks for development
const createCourseValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Course title is required'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Course description is required'),

  body('category')
    .notEmpty()
    .withMessage('Category is required'),

  body('level')
    .notEmpty()
    .withMessage('Course level is required'),

  body('language')
    .notEmpty()
    .withMessage('Language is required'),

  // All other fields are optional with no strict validation
  body('shortDescription').optional(),
  body('subCategory').optional(),
  body('duration').optional(),
  body('pricing').optional(),
  body('tags').optional(),
  body('learningObjectives').optional(),
  body('prerequisites').optional(),
  body('targetAudience').optional(),
];

const updateCourseValidation = [
  param('id').isMongoId().withMessage('Invalid course ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Description must be between 50 and 5000 characters'),

  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Short description cannot exceed 300 characters'),

  body('category')
    .optional()
    .isIn([
      'vedic_chanting',
      'sanskrit_language',
      'philosophy',
      'rituals_ceremonies',
      'yoga_meditation',
      'ayurveda',
      'music_arts',
      'scriptures',
      'other',
    ])
    .withMessage('Invalid category'),

  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid level'),

  body('language')
    .optional()
    .isIn(['hindi', 'english', 'sanskrit', 'mixed'])
    .withMessage('Invalid language'),

  body('pricing.type')
    .optional()
    .isIn(['free', 'one_time', 'subscription'])
    .withMessage('Invalid pricing type'),

  body('pricing.amount')
    .optional()
    .isFloat({ min: 1, max: 100000 })
    .withMessage('Amount must be between ₹1 and ₹100,000'),

  body('tags').optional().isArray({ max: 10 }).withMessage('Maximum 10 tags allowed'),

  body('learningObjectives')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Maximum 20 learning objectives allowed'),

  body('prerequisites')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 prerequisites allowed'),
];

// ============================================================================
// CONTENT MANAGEMENT VALIDATIONS
// ============================================================================

const addUnitValidation = [
  param('id').isMongoId().withMessage('Invalid course ID'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Unit title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('order').optional().isInt({ min: 1 }).withMessage('Order must be a positive integer'),
];

const addLessonValidation = [
  param('courseId').isMongoId().withMessage('Invalid course ID'),

  param('unitId').isMongoId().withMessage('Invalid unit ID'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Lesson title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('order').optional().isInt({ min: 1 }).withMessage('Order must be a positive integer'),
];

const addLectureValidation = [
  param('courseId').isMongoId().withMessage('Invalid course ID'),

  param('unitId').isMongoId().withMessage('Invalid unit ID'),

  param('lessonId').isMongoId().withMessage('Invalid lesson ID'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Lecture title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('type')
    .optional()
    .isIn(['video', 'audio', 'text', 'interactive', 'quiz', 'assignment'])
    .withMessage('Invalid lecture type'),

  body('duration.minutes')
    .optional()
    .isInt({ min: 0, max: 600 })
    .withMessage('Duration must be between 0 and 600 minutes'),

  body('order').optional().isInt({ min: 1 }).withMessage('Order must be a positive integer'),

  body('content.videoUrl')
    .if(body('type').equals('video'))
    .optional()
    .isURL()
    .withMessage('Invalid video URL'),

  body('content.audioUrl')
    .if(body('type').equals('audio'))
    .optional()
    .isURL()
    .withMessage('Invalid audio URL'),

  body('content.textContent')
    .if(body('type').equals('text'))
    .optional()
    .isLength({ max: 50000 })
    .withMessage('Text content cannot exceed 50,000 characters'),

  body('resources').optional().isArray({ max: 20 }).withMessage('Maximum 20 resources allowed'),

  body('resources.*.title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Resource title must be between 2 and 100 characters'),

  body('resources.*.type')
    .optional()
    .isIn(['pdf', 'doc', 'image', 'audio', 'video', 'link'])
    .withMessage('Invalid resource type'),

  body('resources.*.url').optional().isURL().withMessage('Invalid resource URL'),
];

// ============================================================================
// QUERY PARAMETER VALIDATIONS
// ============================================================================

const getCourseValidation = [
  param('id').isMongoId().withMessage('Invalid course ID'),

  query('includeContent')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('includeContent must be true or false'),
];

const getAllCoursesValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search term must be between 2 and 100 characters'),

  query('category')
    .optional()
    .isIn([
      'vedic_chanting',
      'sanskrit_language',
      'philosophy',
      'rituals_ceremonies',
      'yoga_meditation',
      'ayurveda',
      'music_arts',
      'scriptures',
      'other',
    ])
    .withMessage('Invalid category'),

  query('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid level'),

  query('language')
    .optional()
    .isIn(['hindi', 'english', 'sanskrit', 'mixed'])
    .withMessage('Invalid language'),

  query('pricing')
    .optional()
    .isIn(['free', 'paid', 'one_time', 'subscription'])
    .withMessage('Invalid pricing filter'),

  query('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),

  query('instructor').optional().isMongoId().withMessage('Invalid instructor ID'),

  query('sortBy')
    .optional()
    .isIn([
      'createdAt',
      'title',
      'pricing.amount',
      'analytics.ratings.average',
      'analytics.enrollmentCount',
    ])
    .withMessage('Invalid sort field'),

  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),

  query('featured')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Featured must be true or false'),

  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Minimum rating must be between 0 and 5'),

  query('minDuration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum duration must be a positive integer'),

  query('maxDuration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum duration must be a positive integer'),
];

const getInstructorCoursesValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'title', 'analytics.enrollmentCount'])
    .withMessage('Invalid sort field'),

  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
];

const getCourseAnalyticsValidation = [
  param('id').isMongoId().withMessage('Invalid course ID'),

  query('period')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Period must be 7d, 30d, 90d, or 1y'),
];

// ============================================================================
// PUBLISH/UNPUBLISH VALIDATIONS
// ============================================================================

const publishCourseValidation = [param('id').isMongoId().withMessage('Invalid course ID')];

const unpublishCourseValidation = [param('id').isMongoId().withMessage('Invalid course ID')];

const deleteCourseValidation = [param('id').isMongoId().withMessage('Invalid course ID')];

// ============================================================================
// EXPORT VALIDATION GROUPS
// ============================================================================

module.exports = {
  // Course CRUD
  createCourseValidation,
  updateCourseValidation,
  getCourseValidation,
  getAllCoursesValidation,
  deleteCourseValidation,

  // Content Management
  addUnitValidation,
  addLessonValidation,
  addLectureValidation,

  // Publishing
  publishCourseValidation,
  unpublishCourseValidation,

  // Instructor Dashboard
  getInstructorCoursesValidation,
  getCourseAnalyticsValidation,
};
