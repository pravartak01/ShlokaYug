/**
 * Message History Validation Middleware
 * Validates request data for message history operations
 */

const { body, param, query } = require('express-validator');

// Validation for saving a new message
const validateSaveMessage = [
  body('message_history')
    .notEmpty()
    .withMessage('Message history is required')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Message history must be between 1 and 10000 characters')
    .trim(),
    
  body('session_id')
    .optional()
    .isString()
    .withMessage('Session ID must be a string')
    .isLength({ min: 1, max: 200 })
    .withMessage('Session ID must be between 1 and 200 characters'),
    
  body('message_type')
    .optional()
    .isIn(['user_input', 'bot_response', 'analysis_result'])
    .withMessage('Message type must be one of: user_input, bot_response, analysis_result'),
    
  body('analysis_data')
    .optional()
    .isObject()
    .withMessage('Analysis data must be an object'),
    
  body('analysis_data.input_text')
    .optional()
    .isString()
    .withMessage('Input text must be a string')
    .isLength({ max: 5000 })
    .withMessage('Input text cannot exceed 5000 characters'),
    
  body('analysis_data.chandas_name')
    .optional()
    .isString()
    .withMessage('Chandas name must be a string')
    .isLength({ max: 100 })
    .withMessage('Chandas name cannot exceed 100 characters'),
    
  body('analysis_data.syllable_count')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Syllable count must be a positive integer up to 1000'),
    
  body('analysis_data.laghu_guru_pattern')
    .optional()
    .isString()
    .withMessage('Laghu guru pattern must be a string')
    .matches(/^[LG]*$/)
    .withMessage('Laghu guru pattern can only contain L and G characters'),
    
  body('analysis_data.confidence_score')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Confidence score must be a number between 0 and 1'),
    
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object'),
    
  body('context.conversation_topic')
    .optional()
    .isString()
    .withMessage('Conversation topic must be a string')
    .isLength({ max: 200 })
    .withMessage('Conversation topic cannot exceed 200 characters'),
    
  body('context.user_intent')
    .optional()
    .isString()
    .withMessage('User intent must be a string')
    .isLength({ max: 200 })
    .withMessage('User intent cannot exceed 200 characters'),
    
  body('response_time_ms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Response time must be a positive integer'),
    
  body('model_version')
    .optional()
    .isString()
    .withMessage('Model version must be a string')
    .isLength({ max: 50 })
    .withMessage('Model version cannot exceed 50 characters'),
    
  body('api_version')
    .optional()
    .isString()
    .withMessage('API version must be a string')
    .isLength({ max: 20 })
    .withMessage('API version cannot exceed 20 characters')
];

// Validation for getting user history
const validateGetHistory = [
  query('session_id')
    .optional()
    .isString()
    .withMessage('Session ID must be a string')
    .isLength({ min: 1, max: 200 })
    .withMessage('Session ID must be between 1 and 200 characters'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('Limit must be an integer between 1 and 500'),
    
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('message_type')
    .optional()
    .isIn(['user_input', 'bot_response', 'analysis_result'])
    .withMessage('Message type must be one of: user_input, bot_response, analysis_result'),
    
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
    
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query.start_date && new Date(value) <= new Date(req.query.start_date)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];

// Validation for getting recent sessions
const validateGetSessions = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be an integer between 1 and 50')
];

// Validation for getting session conversation
const validateGetSessionConversation = [
  param('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
    .isString()
    .withMessage('Session ID must be a string')
    .isLength({ min: 1, max: 200 })
    .withMessage('Session ID must be between 1 and 200 characters'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be an integer between 1 and 1000')
];

// Validation for rating a message
const validateRateMessage = [
  param('messageId')
    .notEmpty()
    .withMessage('Message ID is required')
    .isMongoId()
    .withMessage('Message ID must be a valid MongoDB ObjectId'),
    
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
    
  body('feedback')
    .optional()
    .isString()
    .withMessage('Feedback must be a string')
    .isLength({ max: 1000 })
    .withMessage('Feedback cannot exceed 1000 characters')
    .trim()
];

// Validation for deleting a message
const validateDeleteMessage = [
  param('messageId')
    .notEmpty()
    .withMessage('Message ID is required')
    .isMongoId()
    .withMessage('Message ID must be a valid MongoDB ObjectId')
];

// Validation for clearing user history
const validateClearHistory = [
  query('session_id')
    .optional()
    .isString()
    .withMessage('Session ID must be a string')
    .isLength({ min: 1, max: 200 })
    .withMessage('Session ID must be between 1 and 200 characters')
];

// Validation for chandas analysis data specifically
const validateChandasAnalysis = [
  body('analysis_data.syllable_breakdown')
    .optional()
    .isArray()
    .withMessage('Syllable breakdown must be an array'),
    
  body('analysis_data.syllable_breakdown.*.syllable')
    .optional()
    .isString()
    .withMessage('Each syllable must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('Each syllable must be between 1 and 50 characters'),
    
  body('analysis_data.syllable_breakdown.*.type')
    .optional()
    .isIn(['laghu', 'guru'])
    .withMessage('Syllable type must be either "laghu" or "guru"'),
    
  body('analysis_data.syllable_breakdown.*.position')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Syllable position must be a positive integer'),
    
  body('analysis_data.explanation')
    .optional()
    .isString()
    .withMessage('Explanation must be a string')
    .isLength({ max: 2000 })
    .withMessage('Explanation cannot exceed 2000 characters'),
    
  body('analysis_data.identification_process')
    .optional()
    .isArray()
    .withMessage('Identification process must be an array'),
    
  body('analysis_data.identification_process.*.step_number')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Step number must be a positive integer'),
    
  body('analysis_data.identification_process.*.step_name')
    .optional()
    .isString()
    .withMessage('Step name must be a string')
    .isLength({ max: 200 })
    .withMessage('Step name cannot exceed 200 characters'),
    
  body('analysis_data.identification_process.*.description')
    .optional()
    .isString()
    .withMessage('Step description must be a string')
    .isLength({ max: 1000 })
    .withMessage('Step description cannot exceed 1000 characters'),
    
  body('analysis_data.identification_process.*.result')
    .optional()
    .isString()
    .withMessage('Step result must be a string')
    .isLength({ max: 1000 })
    .withMessage('Step result cannot exceed 1000 characters')
];

module.exports = {
  validateSaveMessage,
  validateGetHistory,
  validateGetSessions,
  validateGetSessionConversation,
  validateRateMessage,
  validateDeleteMessage,
  validateClearHistory,
  validateChandasAnalysis
};