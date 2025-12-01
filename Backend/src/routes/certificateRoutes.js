/**
 * Certificate Routes
 * Handles certificate verification and management
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  verifyCertificate,
  downloadCertificate,
  getUserCertificates,
  shareCertificate
} = require('../controllers/challengeCertificateController');

const { auth, optionalAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const {
  verificationCodeValidation,
  certificateIdValidation
} = require('../validators/certificateValidators');

const router = express.Router();

// Rate limiting for certificate operations
const certificateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many certificate requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  }
});

// More restrictive rate limiting for verification (public endpoint)
const verificationRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // limit each IP to 20 verifications per 10 minutes
  message: {
    success: false,
    error: {
      message: 'Too many verification requests, please try again later',
      code: 'VERIFICATION_RATE_LIMIT'
    }
  }
});

// @desc    Verify certificate by verification code (Public)
// @route   GET /api/v1/certificates/verify/:verificationCode
// @access  Public
router.get(
  '/verify/:verificationCode',
  verificationRateLimit,
  verificationCodeValidation,
  validateRequest,
  verifyCertificate
);

// @desc    Get user's certificates
// @route   GET /api/v1/certificates/my-certificates
// @access  Private
router.get(
  '/my-certificates',
  auth,
  certificateRateLimit,
  getUserCertificates
);

// @desc    Download certificate
// @route   GET /api/v1/certificates/download/:certificateId
// @access  Private
router.get(
  '/download/:certificateId',
  auth,
  certificateRateLimit,
  certificateIdValidation,
  validateRequest,
  downloadCertificate
);

// @desc    Share certificate
// @route   POST /api/v1/certificates/:certificateId/share
// @access  Private
router.post(
  '/:certificateId/share',
  auth,
  certificateRateLimit,
  certificateIdValidation,
  validateRequest,
  shareCertificate
);

module.exports = router;