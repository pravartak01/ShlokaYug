const { validationResult, body, param, query } = require('express-validator');

// Generic validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    return res.status(422).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: formattedErrors,
        timestamp: new Date().toISOString()
      }
    });
  }

  next();
};

// Video validation rules
const videoValidationRules = {
  // Video upload validation
  videoUpload: [
    body('title')
      .notEmpty()
      .isLength({ min: 1, max: 200 })
      .trim()
      .withMessage('Video title is required and must be less than 200 characters'),
    body('description')
      .optional()
      .isLength({ max: 5000 })
      .trim()
      .withMessage('Description must be less than 5000 characters'),
    body('category')
      .notEmpty()
      .isIn(['educational', 'entertainment', 'music', 'technology', 'sports', 'other'])
      .withMessage('Valid category is required'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('tags.*')
      .isLength({ max: 50 })
      .withMessage('Each tag must be less than 50 characters'),
    body('isShort')
      .optional()
      .isBoolean()
      .withMessage('isShort must be a boolean'),
    body('visibility')
      .optional()
      .isIn(['public', 'private', 'unlisted'])
      .withMessage('Invalid visibility setting'),
    body('allowComments')
      .optional()
      .isBoolean()
      .withMessage('allowComments must be a boolean'),
    body('ageRestricted')
      .optional()
      .isBoolean()
      .withMessage('ageRestricted must be a boolean'),
    body('language')
      .optional()
      .isLength({ max: 10 })
      .withMessage('Language code must be less than 10 characters')
  ],

  // Video update validation
  videoUpdate: [
    body('title')
      .optional()
      .isLength({ min: 1, max: 200 })
      .trim()
      .withMessage('Title must be less than 200 characters'),
    body('description')
      .optional()
      .isLength({ max: 5000 })
      .trim()
      .withMessage('Description must be less than 5000 characters'),
    body('category')
      .optional()
      .isIn(['educational', 'entertainment', 'music', 'technology', 'sports', 'other'])
      .withMessage('Invalid category'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('visibility')
      .optional()
      .isIn(['public', 'private', 'unlisted'])
      .withMessage('Invalid visibility setting'),
    body('allowComments')
      .optional()
      .isBoolean()
      .withMessage('allowComments must be a boolean')
  ],

  // Comment validation
  commentCreation: [
    body('text')
      .notEmpty()
      .isLength({ min: 1, max: 1000 })
      .trim()
      .withMessage('Comment text is required and must be less than 1000 characters'),
    body('parentCommentId')
      .optional()
      .isMongoId()
      .withMessage('Invalid parent comment ID')
  ],

  // Playlist validation
  playlistCreation: [
    body('title')
      .notEmpty()
      .isLength({ min: 1, max: 200 })
      .trim()
      .withMessage('Playlist title is required and must be less than 200 characters'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .trim()
      .withMessage('Description must be less than 1000 characters'),
    body('visibility')
      .optional()
      .isIn(['public', 'private', 'unlisted'])
      .withMessage('Invalid visibility setting')
  ],

  // Parameter validation
  mongoId: [
    param('videoId')
      .isMongoId()
      .withMessage('Invalid video ID format')
  ],

  commentId: [
    param('commentId')
      .isMongoId()
      .withMessage('Invalid comment ID format')
  ],

  playlistId: [
    param('playlistId')
      .isMongoId()
      .withMessage('Invalid playlist ID format')
  ],

  userId: [
    param('userId')
      .isMongoId()
      .withMessage('Invalid user ID format')
  ],

  // Query validation
  videoPagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    query('sort')
      .optional()
      .isIn(['createdAt', '-createdAt', 'views', '-views', 'likes', '-likes', 'title', '-title'])
      .withMessage('Invalid sort parameter'),
    query('category')
      .optional()
      .isIn(['educational', 'entertainment', 'music', 'technology', 'sports', 'other'])
      .withMessage('Invalid category filter'),
    query('duration')
      .optional()
      .isIn(['short', 'medium', 'long'])
      .withMessage('Invalid duration filter'),
    query('uploadDate')
      .optional()
      .isIn(['today', 'week', 'month', 'year'])
      .withMessage('Invalid upload date filter')
  ],

  searchValidation: [
    query('q')
      .notEmpty()
      .isLength({ min: 1, max: 200 })
      .trim()
      .withMessage('Search query is required and must be less than 200 characters'),
    query('type')
      .optional()
      .isIn(['video', 'channel', 'playlist'])
      .withMessage('Invalid search type'),
    query('duration')
      .optional()
      .isIn(['short', 'medium', 'long'])
      .withMessage('Invalid duration filter'),
    query('uploadDate')
      .optional()
      .isIn(['today', 'week', 'month', 'year'])
      .withMessage('Invalid upload date filter')
  ]
};

// Combine validation rules with middleware
const createValidator = (rules) => {
  return [...rules, validate];
};

module.exports = {
  validate,
  videoValidationRules,
  createValidator
};