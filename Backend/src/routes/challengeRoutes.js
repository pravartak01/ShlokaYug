/**
 * User Challenge Routes
 * Handles user challenge participation
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  getActiveChallenges,
  getChallengeDetails,
  joinChallenge,
  startChallenge,
  submitChallengeResponse,
  completeChallenge,
  getUserChallenges,
  getLeaderboard
} = require('../controllers/userChallengeController');

const { auth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const {
  challengeIdValidation,
  challengeResponseValidation,
  challengeCompletionValidation
} = require('../validators/challengeValidators');

const router = express.Router();

// Rate limiting for challenge operations
const challengeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many challenge requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  }
});

// More restrictive rate limiting for challenge submissions
const submissionRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 submissions per 5 minutes
  message: {
    success: false,
    error: {
      message: 'Too many submissions, please slow down',
      code: 'SUBMISSION_RATE_LIMIT'
    }
  }
});

// Apply authentication to all routes
router.use(auth);

// @desc    Get active challenges
// @route   GET /api/v1/challenges
// @access  Private
router.get(
  '/',
  challengeRateLimit,
  getActiveChallenges
);

// @desc    Get user's challenge history
// @route   GET /api/v1/challenges/my-challenges
// @access  Private
router.get(
  '/my-challenges',
  challengeRateLimit,
  getUserChallenges
);

// @desc    Get challenge details
// @route   GET /api/v1/challenges/:id
// @access  Private
router.get(
  '/:id',
  challengeRateLimit,
  challengeIdValidation,
  validateRequest,
  getChallengeDetails
);

// @desc    Join/Register for challenge
// @route   POST /api/v1/challenges/:id/join
// @access  Private
router.post(
  '/:id/join',
  challengeRateLimit,
  challengeIdValidation,
  validateRequest,
  joinChallenge
);

// @desc    Start challenge attempt
// @route   POST /api/v1/challenges/:id/start
// @access  Private
router.post(
  '/:id/start',
  challengeRateLimit,
  challengeIdValidation,
  validateRequest,
  startChallenge
);

// @desc    Submit challenge response
// @route   POST /api/v1/challenges/:id/submit
// @access  Private
router.post(
  '/:id/submit',
  submissionRateLimit,
  challengeIdValidation,
  challengeResponseValidation,
  validateRequest,
  submitChallengeResponse
);

// @desc    Complete challenge
// @route   POST /api/v1/challenges/:id/complete
// @access  Private
router.post(
  '/:id/complete',
  submissionRateLimit,
  challengeIdValidation,
  challengeCompletionValidation,
  validateRequest,
  completeChallenge
);

// @desc    Get challenge leaderboard
// @route   GET /api/v1/challenges/:id/leaderboard
// @access  Private
router.get(
  '/:id/leaderboard',
  challengeRateLimit,
  challengeIdValidation,
  validateRequest,
  getLeaderboard
);

module.exports = router;