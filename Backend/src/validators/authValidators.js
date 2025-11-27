const { body, param } = require('express-validator');

// User registration validation
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),

  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3-20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),

  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('preferredScript')
    .optional()
    .isIn(['devanagari', 'iast', 'itrans'])
    .withMessage('Preferred script must be one of: devanagari, iast, itrans'),
];

// User login validation
const loginValidation = [
  body('identifier').trim().notEmpty().withMessage('Email or username is required'),

  body('password').notEmpty().withMessage('Password is required'),
];

// Forgot password validation
const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
];

// Reset password validation
const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
];

// Email verification validation
const verifyEmailValidation = [
  body('token').notEmpty().withMessage('Verification token is required'),
];

// Refresh token validation
const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

// Google auth validation
const googleAuthValidation = [
  body('tokenId').notEmpty().withMessage('Google token ID is required'),
];

// Change password validation
const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'New password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),

  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match new password');
    }
    return value;
  }),
];

// Profile update validation
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1-50 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('First name can only contain letters and spaces'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1-50 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),

  body('website').optional().isURL().withMessage('Website must be a valid URL'),

  body('preferredScript')
    .optional()
    .isIn(['devanagari', 'iast', 'itrans'])
    .withMessage('Preferred script must be one of: devanagari, iast, itrans'),

  body('timezone')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Timezone must be less than 50 characters'),

  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notifications setting must be a boolean'),

  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notifications setting must be a boolean'),

  body('notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notifications setting must be a boolean'),

  body('privacy.profileVisibility')
    .optional()
    .isIn(['public', 'friends', 'private'])
    .withMessage('Profile visibility must be one of: public, friends, private'),

  body('privacy.showProgress')
    .optional()
    .isBoolean()
    .withMessage('Show progress setting must be a boolean'),

  body('privacy.allowMessages')
    .optional()
    .isBoolean()
    .withMessage('Allow messages setting must be a boolean'),

  body('learningPreferences.difficultyLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty level must be one of: beginner, intermediate, advanced'),

  body('learningPreferences.learningPace')
    .optional()
    .isIn(['slow', 'normal', 'fast'])
    .withMessage('Learning pace must be one of: slow, normal, fast'),

  body('learningPreferences.dailyGoalMinutes')
    .optional()
    .isInt({ min: 5, max: 480 })
    .withMessage('Daily goal must be between 5-480 minutes'),
];

// Common username validation for availability check
const usernameValidation = [
  param('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3-20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
];

// Common email validation for availability check
const emailValidation = [
  param('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
];

// Two-factor authentication validation
const twoFactorValidation = [
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('2FA code must be 6 digits')
    .isNumeric()
    .withMessage('2FA code must contain only numbers'),
];

// Password strength validation (more detailed)
const passwordStrengthValidation = [
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8-128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)'
    )
    .custom((value) => {
      // Common password check
      const commonPasswords = [
        'password',
        '123456',
        'password123',
        'admin',
        'qwerty',
        'letmein',
        'welcome',
        'monkey',
        '123456789',
        '12345678',
      ];

      if (commonPasswords.includes(value.toLowerCase())) {
        throw new Error('Password is too common. Please choose a more secure password.');
      }

      // Sequential characters check
      if (/123456|abcdef|qwerty/.test(value.toLowerCase())) {
        throw new Error('Password should not contain sequential characters.');
      }

      return value;
    }),
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  verifyEmailValidation,
  refreshTokenValidation,
  googleAuthValidation,
  changePasswordValidation,
  updateProfileValidation,
  usernameValidation,
  emailValidation,
  twoFactorValidation,
  passwordStrengthValidation,
};
