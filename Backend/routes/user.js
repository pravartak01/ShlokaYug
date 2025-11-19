const express = require('express');
const {
  updateProfile,
  updateLearningProgress,
  changePassword,
  deleteAccount,
  getUserStats
} = require('../controllers/userController');

const { protect, requireEmailVerification } = require('../middleware/auth');
const {
  validateUpdateProfile,
  validateUpdateProgress,
  validateChangePassword,
  validateDeleteAccount
} = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// User profile routes
router.put('/profile', validateUpdateProfile, updateProfile);
router.put('/progress', validateUpdateProgress, updateLearningProgress);
router.put('/change-password', validateChangePassword, changePassword);
router.delete('/account', validateDeleteAccount, deleteAccount);
router.get('/stats', getUserStats);

module.exports = router;