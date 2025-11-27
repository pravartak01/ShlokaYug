/**
 * Progress Routes - Learning Progress Tracking API
 * Handles all progress-related endpoints for the LMS
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { auth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const progressController = require('../controllers/progressController');

// Validation middleware
const validateProgressUpdate = [
  body('courseId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid course ID is required'),
  body('unitId')
    .notEmpty()
    .withMessage('Unit ID is required'),
  body('lessonId')
    .notEmpty()
    .withMessage('Lesson ID is required'),
  body('lectureId')
    .notEmpty()
    .withMessage('Lecture ID is required'),
  body('action')
    .isIn(['start', 'progress', 'complete'])
    .withMessage('Action must be start, progress, or complete'),
  body('watchTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Watch time must be a positive integer'),
  body('totalDuration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total duration must be a positive integer'),
  body('currentPosition')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current position must be a positive integer')
];

const validateCourseId = [
  param('courseId')
    .isMongoId()
    .withMessage('Valid course ID is required')
];

const validateLectureComplete = [
  param('lectureId')
    .isMongoId()
    .withMessage('Valid lecture ID is required'),
  body('courseId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid course ID is required'),
  body('unitId')
    .notEmpty()
    .withMessage('Unit ID is required'),
  body('lessonId')
    .notEmpty()
    .withMessage('Lesson ID is required')
];

const validateBookmark = [
  body('courseId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid course ID is required'),
  body('lectureId')
    .notEmpty()
    .withMessage('Lecture ID is required'),
  body('timestamp')
    .isInt({ min: 0 })
    .withMessage('Timestamp must be a positive integer'),
  body('note')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Note must be a string with max 500 characters')
];

/**
 * @route   POST /api/v1/progress/update
 * @desc    Update learning progress (watch time, completion)
 * @access  Private (Student)
 */
router.post('/update', 
  auth,
  checkRole(['student']),
  validateProgressUpdate,
  progressController.updateLearningProgress
);

/**
 * @route   GET /api/v1/progress/course/:courseId
 * @desc    Get detailed progress for a specific course
 * @access  Private (Student)
 */
router.get('/course/:courseId',
  auth,
  checkRole(['student']),
  validateCourseId,
  progressController.getCourseProgress
);

/**
 * @route   GET /api/v1/progress/analytics
 * @desc    Get progress analytics dashboard data
 * @access  Private (Student)
 */
router.get('/analytics',
  auth,
  checkRole(['student']),
  [
    query('timeframe')
      .optional()
      .isIn(['7d', '30d', '90d', '1y'])
      .withMessage('Timeframe must be 7d, 30d, 90d, or 1y')
  ],
  progressController.getProgressAnalytics
);

/**
 * @route   PATCH /api/v1/progress/lecture/:lectureId/complete
 * @desc    Mark a lecture as complete
 * @access  Private (Student)
 */
router.patch('/lecture/:lectureId/complete',
  auth,
  checkRole(['student']),
  validateLectureComplete,
  progressController.markLectureComplete
);

/**
 * @route   POST /api/v1/progress/bookmark
 * @desc    Create a bookmark at specific timestamp
 * @access  Private (Student)
 */
router.post('/bookmark',
  auth,
  checkRole(['student']),
  validateBookmark,
  progressController.createBookmark
);

/**
 * @route   GET /api/v1/progress/bookmarks/:courseId
 * @desc    Get user bookmarks for a course
 * @access  Private (Student)
 */
router.get('/bookmarks/:courseId',
  auth,
  checkRole(['student']),
  validateCourseId,
  progressController.getBookmarks
);

/**
 * @route   DELETE /api/v1/progress/bookmark/:bookmarkId
 * @desc    Delete a bookmark
 * @access  Private (Student)
 */
router.delete('/bookmark/:bookmarkId',
  auth,
  checkRole(['student']),
  [
    param('bookmarkId')
      .isMongoId()
      .withMessage('Valid bookmark ID is required')
  ],
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { bookmarkId } = req.params;

      const progress = await Progress.findOne({ userId });
      if (!progress) {
        return res.status(404).json({
          success: false,
          message: 'Progress record not found'
        });
      }

      // Remove bookmark
      progress.bookmarks = progress.bookmarks.filter(
        bookmark => bookmark._id.toString() !== bookmarkId
      );

      await progress.save();

      res.status(200).json({
        success: true,
        message: 'Bookmark deleted successfully'
      });

    } catch (error) {
      console.error('Delete bookmark error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete bookmark',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route   GET /api/v1/progress/summary
 * @desc    Get quick progress summary for dashboard
 * @access  Private (Student)
 */
router.get('/summary',
  auth,
  checkRole(['student']),
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get all progress records for user
      const progressRecords = await Progress.find({ userId })
        .populate('courseId', 'title instructor category')
        .select('statistics.completion.overall analytics.totalTimeSpent courseId');

      if (!progressRecords.length) {
        return res.status(200).json({
          success: true,
          data: {
            totalCourses: 0,
            completedCourses: 0,
            inProgressCourses: 0,
            totalTimeSpent: 0,
            averageProgress: 0,
            recentCourses: []
          }
        });
      }

      // Calculate summary
      const totalCourses = progressRecords.length;
      const completedCourses = progressRecords.filter(p => p.statistics.completion.overall >= 100).length;
      const inProgressCourses = totalCourses - completedCourses;
      const totalTimeSpent = progressRecords.reduce((sum, p) => sum + (p.analytics.totalTimeSpent || 0), 0);
      const averageProgress = progressRecords.reduce((sum, p) => sum + p.statistics.completion.overall, 0) / totalCourses;

      // Get recent courses (last 5)
      const recentCourses = progressRecords
        .sort((a, b) => new Date(b.analytics.lastActivity) - new Date(a.analytics.lastActivity))
        .slice(0, 5)
        .map(p => ({
          courseId: p.courseId._id,
          title: p.courseId.title,
          progress: Math.round(p.statistics.completion.overall),
          status: p.statistics.completion.overall >= 100 ? 'completed' : 'in-progress'
        }));

      res.status(200).json({
        success: true,
        data: {
          totalCourses,
          completedCourses,
          inProgressCourses,
          totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
          averageProgress: Math.round(averageProgress * 10) / 10,
          recentCourses
        }
      });

    } catch (error) {
      console.error('Get progress summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve progress summary',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

module.exports = router;
