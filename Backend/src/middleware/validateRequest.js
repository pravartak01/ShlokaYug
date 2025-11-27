const { validationResult, body, param, query } = require('express-validator');

// Generic validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location,
    }));

    return res.status(422).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: formattedErrors,
        timestamp: new Date().toISOString(),
      },
    });
  }

  next();
};

// Common validation rules
const validationRules = {
  // User validation rules
  userRegistration: [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
    body('username')
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        'Username must be 3-30 characters long and contain only letters, numbers, and underscores'
      ),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage(
        'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
      ),
    body('firstName')
      .isLength({ min: 1, max: 50 })
      .trim()
      .withMessage('First name is required and must be less than 50 characters'),
    body('lastName')
      .isLength({ min: 1, max: 50 })
      .trim()
      .withMessage('Last name is required and must be less than 50 characters'),
    body('preferredScript')
      .optional()
      .isIn(['devanagari', 'iast', 'bengali', 'gujarati', 'telugu'])
      .withMessage('Invalid script preference'),
  ],

  userLogin: [
    body('identifier').notEmpty().withMessage('Email or username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],

  userProfileUpdate: [
    body('firstName')
      .optional()
      .isLength({ min: 1, max: 50 })
      .trim()
      .withMessage('First name must be less than 50 characters'),
    body('lastName')
      .optional()
      .isLength({ min: 1, max: 50 })
      .trim()
      .withMessage('Last name must be less than 50 characters'),
    body('bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio must be less than 500 characters'),
    body('location')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Location must be less than 100 characters'),
    body('phoneNumber')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),
    body('dateOfBirth').optional().isISO8601().withMessage('Please provide a valid date of birth'),
    body('nativeLanguage')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Native language must be less than 50 characters'),
    body('learningGoals').optional().isArray().withMessage('Learning goals must be an array'),
    body('learningGoals.*')
      .isLength({ max: 100 })
      .withMessage('Each learning goal must be less than 100 characters'),
  ],

  // Shloka validation rules
  shlokaCreation: [
    body('title')
      .notEmpty()
      .isLength({ min: 1, max: 200 })
      .trim()
      .withMessage('Title is required and must be less than 200 characters'),
    body('content.sanskrit.devanagari')
      .notEmpty()
      .withMessage('Sanskrit text in Devanagari is required'),
    body('content.translation.english')
      .notEmpty()
      .isLength({ min: 1, max: 1000 })
      .trim()
      .withMessage('English translation is required and must be less than 1000 characters'),
    body('metadata.category').isArray().withMessage('Category must be an array'),
    body('metadata.tags').optional().isArray().withMessage('Tags must be an array'),
    body('metadata.difficulty')
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Difficulty must be beginner, intermediate, or advanced'),
    body('metadata.source')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Source must be less than 200 characters'),
  ],

  // Course validation rules
  courseCreation: [
    body('title')
      .notEmpty()
      .isLength({ min: 1, max: 200 })
      .trim()
      .withMessage('Course title is required and must be less than 200 characters'),
    body('description')
      .notEmpty()
      .isLength({ min: 1, max: 1000 })
      .trim()
      .withMessage('Course description is required and must be less than 1000 characters'),
    body('instructor.name')
      .notEmpty()
      .isLength({ min: 1, max: 100 })
      .trim()
      .withMessage('Instructor name is required'),
    body('structure.modules')
      .isArray({ min: 1 })
      .withMessage('Course must have at least one module'),
    body('enrollment.price.amount')
      .optional()
      .isNumeric({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('metadata.difficulty')
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  ],

  // Community post validation rules
  communityPostCreation: [
    body('content.title')
      .notEmpty()
      .isLength({ min: 1, max: 200 })
      .trim()
      .withMessage('Post title is required and must be less than 200 characters'),
    body('content.description')
      .optional()
      .isLength({ max: 1000 })
      .trim()
      .withMessage('Description must be less than 1000 characters'),
    body('type')
      .isIn(['recording', 'question', 'tip', 'achievement'])
      .withMessage('Invalid post type'),
    body('content.tags').optional().isArray().withMessage('Tags must be an array'),
    body('content.tags.*')
      .isLength({ max: 50 })
      .withMessage('Each tag must be less than 50 characters'),
  ],

  // Parameter validation rules
  mongoId: [param('id').isMongoId().withMessage('Invalid ID format')],

  // Query validation rules
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sort')
      .optional()
      .isIn([
        'createdAt',
        '-createdAt',
        'title',
        '-title',
        'difficulty',
        '-difficulty',
        'popularity',
        '-popularity',
      ])
      .withMessage('Invalid sort parameter'),
  ],

  shlokaQuery: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sort')
      .optional()
      .isIn([
        'createdAt',
        '-createdAt',
        'title',
        '-title',
        'difficulty',
        '-difficulty',
        'popularity',
        '-popularity',
      ])
      .withMessage('Invalid sort parameter'),
    query('category')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Category filter must be less than 50 characters'),
    query('difficulty')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Invalid difficulty filter'),
    query('search')
      .optional()
      .isLength({ max: 200 })
      .trim()
      .withMessage('Search query must be less than 200 characters'),
    query('tags')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Tags filter must be less than 200 characters'),
  ],

  // AI request validation
  aiCompose: [
    body('prompt')
      .notEmpty()
      .isLength({ min: 1, max: 500 })
      .trim()
      .withMessage('Prompt is required and must be less than 500 characters'),
    body('meter')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Meter must be less than 50 characters'),
    body('theme')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Theme must be less than 100 characters'),
    body('language')
      .optional()
      .isIn(['sanskrit', 'hindi', 'english'])
      .withMessage('Invalid language'),
    body('includeTranslation')
      .optional()
      .isBoolean()
      .withMessage('includeTranslation must be a boolean'),
  ],

  // Audio upload validation
  audioAnalysis: [
    body('shlokaId').isMongoId().withMessage('Valid shloka ID is required'),
    body('practiceMode').isIn(['guided', 'free', 'exam']).withMessage('Invalid practice mode'),
  ],

  // Password reset validation
  passwordReset: [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  ],

  passwordResetConfirm: [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage(
        'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
      ),
  ],

  // Email verification
  emailVerification: [body('token').notEmpty().withMessage('Verification token is required')],
};

// Combine validation rules with middleware
const createValidator = (rules) => [...rules, validateRequest];

module.exports = {
  validateRequest,
  validationRules,
  createValidator,
};
