/**
 * Certificate Validators
 * Validation schemas for certificate-related operations
 */

const { body, param, query } = require('express-validator');

// Certificate ID validation
const certificateIdValidation = [
  param('certificateId')
    .trim()
    .notEmpty()
    .withMessage('Certificate ID is required')
    .isLength({ min: 10, max: 50 })
    .withMessage('Invalid certificate ID format')
];

// Verification code validation
const verificationCodeValidation = [
  param('verificationCode')
    .trim()
    .notEmpty()
    .withMessage('Verification code is required')
    .isLength({ min: 8, max: 20 })
    .withMessage('Invalid verification code format')
    .isAlphanumeric()
    .withMessage('Verification code must be alphanumeric')
];

// Certificate sharing validation
const certificateSharingValidation = [
  body('platform')
    .optional()
    .isIn(['linkedin', 'twitter', 'facebook', 'email', 'other'])
    .withMessage('Invalid sharing platform'),

  body('makePublic')
    .optional()
    .isBoolean()
    .withMessage('Make public must be a boolean')
];

// Certificate query validation
const certificateQueryValidation = [
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
    .isIn(['pending', 'generated', 'issued', 'revoked', 'expired'])
    .withMessage('Invalid certificate status'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'achievement.completionDate', 'achievement.score', 'metadata.downloadCount'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
];

// Certificate template validation
const certificateTemplateValidation = [
  body('templateId')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Template ID must be between 3 and 50 characters'),

  body('backgroundColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Background color must be a valid hex color'),

  body('primaryColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Primary color must be a valid hex color'),

  body('secondaryColor')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Secondary color must be a valid hex color'),

  body('fontFamily')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Font family must be between 3 and 50 characters'),

  body('borderStyle')
    .optional()
    .isIn(['none', 'simple', 'decorative', 'ornate'])
    .withMessage('Invalid border style'),

  body('logoUrl')
    .optional()
    .isURL()
    .withMessage('Logo URL must be a valid URL'),

  body('backgroundImageUrl')
    .optional()
    .isURL()
    .withMessage('Background image URL must be a valid URL')
];

// Certificate issuance validation (for admin)
const certificateIssuanceValidation = [
  param('challengeId')
    .isMongoId()
    .withMessage('Invalid challenge ID format'),

  param('participantId')
    .isMongoId()
    .withMessage('Invalid participant ID format'),

  body('customMessage')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Custom message cannot exceed 500 characters'),

  body('certificateTemplate')
    .optional()
    .isObject()
    .withMessage('Certificate template must be an object')
];

module.exports = {
  certificateIdValidation,
  verificationCodeValidation,
  certificateSharingValidation,
  certificateQueryValidation,
  certificateTemplateValidation,
  certificateIssuanceValidation
};