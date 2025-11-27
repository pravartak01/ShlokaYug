/**
 * Guru Routes - Separate from regular user routes
 * Handles guru application, authentication, and profile management
 */

const express = require('express');
const guruAuthController = require('../controllers/guruAuthController');
const { guruAuth } = require('../middleware/guruAuth');
const { validate } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');

const router = express.Router();

// Rate limiting for sensitive operations
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  }
});

const applicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 application submissions per hour
  message: {
    error: 'Too many application attempts, please try again later.'
  }
});

// Validation rules
// Validation rules
const guruApplicationValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
  body('phoneNumber')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('teachingExperience.totalYears')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Teaching experience must be a non-negative number'),
  
  body('subjects')
    .optional()
    .isArray()
    .withMessage('Subjects must be an array'),
  
  body('subjects.*')
    .optional()
    .isIn([
      'sanskrit-grammar', 'vedic-chanting', 'chandas-prosody', 'shloka-composition',
      'classical-literature', 'vedic-literature', 'bhagavad-gita', 'ramayana',
      'mahabharata', 'upanishads', 'puranas', 'ayurveda', 'jyotisha',
      'yoga-philosophy', 'meditation', 'other'
    ])
    .withMessage('Invalid subject selected'),
  
  validate // Add validate middleware at the end
];

const guruLoginValidation = [
  body('identifier')
    .notEmpty()
    .withMessage('Email or username is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validate // Add validate middleware at the end
];

const profileUpdateValidation = [
  body('profile.firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  
  body('profile.lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  
  body('profile.bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters'),
  
  body('profile.phoneNumber')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  validate // Add validate middleware at the end
];

const passwordUpdateValidation = [
  body('passwordCurrent')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  body('passwordConfirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  
  validate // Add validate middleware at the end
];

// PUBLIC ROUTES

/**
 * @swagger
 * /api/v1/guru/apply:
 *   post:
 *     summary: Apply to become a guru
 *     tags: [Guru Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               bio:
 *                 type: string
 *               teachingExperience:
 *                 type: object
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Guru application created successfully
 *       400:
 *         description: Validation error or guru already exists
 */
router.post('/apply', 
  applicationLimiter,
  guruApplicationValidation,
  guruAuthController.applyAsGuru
);

/**
 * @swagger
 * /api/v1/guru/login:
 *   post:
 *     summary: Guru login (only approved gurus)
 *     tags: [Guru Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or username
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Guru not approved yet
 */
router.post('/login',
  authLimiter,
  guruLoginValidation,
  guruAuthController.login
);

/**
 * @swagger
 * /api/v1/guru/forgot-password:
 *   post:
 *     summary: Forgot password
 *     tags: [Guru Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset token sent to email
 *       404:
 *         description: No guru with that email address
 */
router.post('/forgot-password', guruAuthController.forgotPassword);

/**
 * @swagger
 * /api/v1/guru/reset-password/{token}:
 *   patch:
 *     summary: Reset password with token
 *     tags: [Guru Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - passwordConfirm
 *             properties:
 *               password:
 *                 type: string
 *               passwordConfirm:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.patch('/reset-password/:token', guruAuthController.resetPassword);

// PROTECTED ROUTES (Require guru authentication)

/**
 * @swagger
 * /api/v1/guru/logout:
 *   post:
 *     summary: Guru logout
 *     tags: [Guru Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', guruAuth, guruAuthController.logout);

/**
 * @swagger
 * /api/v1/guru/me:
 *   get:
 *     summary: Get current guru profile
 *     tags: [Guru Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Guru profile retrieved successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/me', guruAuth, guruAuthController.getMe);

/**
 * @swagger
 * /api/v1/guru/me:
 *   patch:
 *     summary: Update guru profile
 *     tags: [Guru Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile:
 *                 type: object
 *               expertise:
 *                 type: object
 *               teachingPreferences:
 *                 type: object
 *               social:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 */
router.patch('/me',
  guruAuth,
  profileUpdateValidation,
  guruAuthController.updateMe
);

/**
 * @swagger
 * /api/v1/guru/profile/complete:
 *   patch:
 *     summary: Complete guru profile before submission
 *     tags: [Guru Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile completed successfully
 *       400:
 *         description: Cannot update profile in current status
 */
router.patch('/profile/complete',
  guruAuth,
  guruAuthController.completeProfile
);

/**
 * @swagger
 * /api/v1/guru/submit-application:
 *   post:
 *     summary: Submit guru application for admin review
 *     tags: [Guru Application]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Application submitted successfully
 *       400:
 *         description: Application already submitted or missing required fields
 */
router.post('/submit-application',
  guruAuth,
  guruAuthController.submitApplication
);

/**
 * @swagger
 * /api/v1/guru/application-status:
 *   get:
 *     summary: Get guru application status
 *     tags: [Guru Application]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Application status retrieved successfully
 */
router.get('/application-status',
  guruAuth,
  guruAuthController.getApplicationStatus
);

/**
 * @swagger
 * /api/v1/guru/update-password:
 *   patch:
 *     summary: Update guru password
 *     tags: [Guru Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - passwordCurrent
 *               - password
 *               - passwordConfirm
 *             properties:
 *               passwordCurrent:
 *                 type: string
 *               password:
 *                 type: string
 *               passwordConfirm:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Current password is wrong
 */
router.patch('/update-password',
  guruAuth,
  passwordUpdateValidation,
  guruAuthController.updatePassword
);

module.exports = router;