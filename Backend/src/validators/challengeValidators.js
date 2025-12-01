/**
 * Challenge Validators
 * Validation schemas for challenge-related operations
 */

const { body, param, query } = require('express-validator');

// Challenge ID validation
const challengeIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid challenge ID format')
    .notEmpty()
    .withMessage('Challenge ID is required')
];

// Create challenge validation
const createChallengeValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Challenge title must be between 3 and 100 characters')
    .notEmpty()
    .withMessage('Challenge title is required'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Challenge description must be between 10 and 1000 characters')
    .notEmpty()
    .withMessage('Challenge description is required'),

  body('instructions')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Challenge instructions cannot exceed 2000 characters'),

  body('type')
    .isIn(['shloka_recitation', 'chandas_analysis', 'translation', 'pronunciation', 'memorization', 'comprehension', 'practice_streak', 'community_engagement'])
    .withMessage('Invalid challenge type'),

  body('requirements.difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid difficulty level'),

  body('requirements.category')
    .optional()
    .isIn(['bhagavad_gita', 'ramayana', 'vedas', 'upanishads', 'puranas', 'general'])
    .withMessage('Invalid category'),

  body('requirements.targetCount')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Target count must be a positive integer'),

  body('requirements.accuracy')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Accuracy must be between 0 and 100'),

  body('requirements.timeLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Time limit must be at least 1 minute'),

  body('startDate')
    .isISO8601()
    .withMessage('Invalid start date format')
    .custom((value) => {
      const startDate = new Date(value);
      const now = new Date();
      if (startDate < now) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),

  body('endDate')
    .isISO8601()
    .withMessage('Invalid end date format')
    .custom((value, { req }) => {
      const endDate = new Date(value);
      const startDate = new Date(req.body.startDate);
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('rewards.points')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reward points must be a non-negative integer'),

  body('rewards.certificate.enabled')
    .optional()
    .isBoolean()
    .withMessage('Certificate enabled must be a boolean'),

  body('settings.maxParticipants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max participants must be at least 1'),

  body('settings.allowRetries')
    .optional()
    .isBoolean()
    .withMessage('Allow retries must be a boolean'),

  body('settings.maxRetries')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max retries must be at least 1'),

  body('settings.isPublic')
    .optional()
    .isBoolean()
    .withMessage('Is public must be a boolean'),

  body('settings.autoGradingEnabled')
    .optional()
    .isBoolean()
    .withMessage('Auto grading enabled must be a boolean')
];

// Update challenge validation
const updateChallengeValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Challenge title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Challenge description must be between 10 and 1000 characters'),

  body('instructions')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Challenge instructions cannot exceed 2000 characters'),

  body('type')
    .optional()
    .isIn(['shloka_recitation', 'chandas_analysis', 'translation', 'pronunciation', 'memorization', 'comprehension', 'practice_streak', 'community_engagement'])
    .withMessage('Invalid challenge type'),

  body('requirements.difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid difficulty level'),

  body('requirements.category')
    .optional()
    .isIn(['bhagavad_gita', 'ramayana', 'vedas', 'upanishads', 'puranas', 'general'])
    .withMessage('Invalid category'),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),

  body('rewards.points')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reward points must be a non-negative integer'),

  body('settings.maxParticipants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max participants must be at least 1'),

  body('settings.allowRetries')
    .optional()
    .isBoolean()
    .withMessage('Allow retries must be a boolean'),

  body('settings.maxRetries')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max retries must be at least 1'),

  body('settings.isPublic')
    .optional()
    .isBoolean()
    .withMessage('Is public must be a boolean')
];

// Challenge response submission validation
const challengeResponseValidation = [
  body('questionId')
    .trim()
    .notEmpty()
    .withMessage('Question ID is required'),

  body('answer')
    .exists()
    .withMessage('Answer is required'),

  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a non-negative integer')
];

// Challenge completion validation
const challengeCompletionValidation = [
  body('finalAnswers')
    .optional()
    .isArray()
    .withMessage('Final answers must be an array'),

  body('finalAnswers.*.questionId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Question ID is required for each answer'),

  body('finalAnswers.*.answer')
    .optional()
    .exists()
    .withMessage('Answer is required for each question')
];

// Query parameter validations
const challengeQueryValidation = [
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
    .withMessage('Invalid status'),

  query('type')
    .optional()
    .isIn(['shloka_recitation', 'chandas_analysis', 'translation', 'pronunciation', 'memorization', 'comprehension', 'practice_streak', 'community_engagement'])
    .withMessage('Invalid type'),

  query('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid difficulty'),

  query('category')
    .optional()
    .isIn(['bhagavad_gita', 'ramayana', 'vedas', 'upanishads', 'puranas', 'general'])
    .withMessage('Invalid category'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'startDate', 'endDate', 'title', 'totalParticipants'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

module.exports = {
  challengeIdValidation,
  createChallengeValidation,
  updateChallengeValidation,
  challengeResponseValidation,
  challengeCompletionValidation,
  challengeQueryValidation
};