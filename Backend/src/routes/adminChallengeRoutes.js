/**
 * Admin Challenge Routes
 * Handles admin-only challenge management operations
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  createChallenge,
  getAllChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
  activateChallenge,
  getChallengeLeaderboard,
  getChallengeParticipants,
  issueCertificate,
  getChallengeAnalytics
} = require('../controllers/challengeController');

const { auth, requireRole } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const {
  createChallengeValidation,
  updateChallengeValidation,
  challengeIdValidation
} = require('../validators/challengeValidators');

const router = express.Router();

// Rate limiting for challenge operations
const challengeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many challenge requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  }
});

// Apply authentication and admin role requirement to all routes
router.use(auth);
router.use(requireRole(['admin', 'moderator']));
router.use(challengeRateLimit);

// @desc    Create new challenge
// @route   POST /api/v1/admin/challenges
// @access  Private/Admin
router.post(
  '/',
  createChallengeValidation,
  validateRequest,
  createChallenge
);

// @desc    Get all challenges with filtering and pagination
// @route   GET /api/v1/admin/challenges
// @access  Private/Admin
router.get(
  '/',
  getAllChallenges
);

// @desc    Get challenge analytics
// @route   GET /api/v1/admin/challenges/analytics
// @access  Private/Admin
router.get(
  '/analytics',
  getChallengeAnalytics
);

// @desc    Get single challenge by ID
// @route   GET /api/v1/admin/challenges/:id
// @access  Private/Admin
router.get(
  '/:id',
  challengeIdValidation,
  validateRequest,
  getChallengeById
);

// @desc    Update challenge
// @route   PUT /api/v1/admin/challenges/:id
// @access  Private/Admin
router.put(
  '/:id',
  challengeIdValidation,
  updateChallengeValidation,
  validateRequest,
  updateChallenge
);

// @desc    Delete challenge
// @route   DELETE /api/v1/admin/challenges/:id
// @access  Private/Admin
router.delete(
  '/:id',
  challengeIdValidation,
  validateRequest,
  deleteChallenge
);

// @desc    Activate challenge
// @route   POST /api/v1/admin/challenges/:id/activate
// @access  Private/Admin
router.post(
  '/:id/activate',
  challengeIdValidation,
  validateRequest,
  activateChallenge
);

// @desc    Get challenge leaderboard
// @route   GET /api/v1/admin/challenges/:id/leaderboard
// @access  Private/Admin
router.get(
  '/:id/leaderboard',
  challengeIdValidation,
  validateRequest,
  getChallengeLeaderboard
);

// @desc    Get challenge participants
// @route   GET /api/v1/admin/challenges/:id/participants
// @access  Private/Admin
router.get(
  '/:id/participants',
  challengeIdValidation,
  validateRequest,
  getChallengeParticipants
);

// @desc    Issue certificate to participant
// @route   POST /api/v1/admin/challenges/:challengeId/participants/:participantId/certificate
// @access  Private/Admin
router.post(
  '/:challengeId/participants/:participantId/certificate',
  challengeIdValidation,
  validateRequest,
  issueCertificate
);

// @desc    Get challenge-specific analytics
// @route   GET /api/v1/admin/challenges/:id/analytics
// @access  Private/Admin
router.get(
  '/:id/analytics',
  challengeIdValidation,
  validateRequest,
  getChallengeAnalytics
);

module.exports = router;