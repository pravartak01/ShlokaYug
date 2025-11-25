/**
 * Content Routes - Content Delivery and Management
 * Handles all content-related API endpoints with validation
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { auth } = require('../middleware/auth');
const {
  uploadContent,
  streamContent,
  getSecureContent,
  getContentMetadata,
  generateDownloadToken,
  downloadContent,
  deleteContent
} = require('../controllers/contentController');

/**
 * POST /api/v1/content/upload
 * Upload content files (Instructor/Admin only)
 */
router.post('/upload',
  auth,
  [
    body('courseId')
      .notEmpty()
      .withMessage('Course ID is required')
      .isMongoId()
      .withMessage('Invalid course ID format'),
    
    body('lectureId')
      .notEmpty()
      .withMessage('Lecture ID is required')
      .isMongoId()
      .withMessage('Invalid lecture ID format'),
    
    body('contentType')
      .optional()
      .isIn(['video', 'audio', 'document', 'image', 'subtitle'])
      .withMessage('Content type must be video, audio, document, image, or subtitle'),
    
    body('metadata')
      .optional()
      .isJSON()
      .withMessage('Metadata must be valid JSON')
  ],
  (req, res, next) => {
    // Check user role
    if (req.user.role !== 'guru' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only instructors and admins can upload content'
      });
    }
    next();
  },
  uploadContent
);

/**
 * GET /api/v1/content/stream/:token
 * Stream video/audio content with range support
 */
router.get('/stream/:token',
  [
    param('token')
      .notEmpty()
      .withMessage('Content token is required')
      .isAlphanumeric()
      .withMessage('Invalid token format')
  ],
  streamContent
);

/**
 * GET /api/v1/content/secure/:token
 * Get secure content (documents, images, etc.)
 */
router.get('/secure/:token',
  [
    param('token')
      .notEmpty()
      .withMessage('Content token is required')
      .isAlphanumeric()
      .withMessage('Invalid token format')
  ],
  getSecureContent
);

/**
 * GET /api/v1/content/metadata/:courseId/:lectureId
 * Get content metadata for a lecture
 */
router.get('/metadata/:courseId/:lectureId',
  auth,
  [
    param('courseId')
      .isMongoId()
      .withMessage('Invalid course ID format'),
    
    param('lectureId')
      .isMongoId()
      .withMessage('Invalid lecture ID format')
  ],
  getContentMetadata
);

/**
 * POST /api/v1/content/download-token
 * Generate download token for offline access (Students only)
 */
router.post('/download-token',
  auth,
  [
    body('courseId')
      .notEmpty()
      .withMessage('Course ID is required')
      .isMongoId()
      .withMessage('Invalid course ID format'),
    
    body('lectureId')
      .notEmpty()
      .withMessage('Lecture ID is required')
      .isMongoId()
      .withMessage('Invalid lecture ID format'),
    
    body('contentIds')
      .isArray({ min: 1, max: 10 })
      .withMessage('Content IDs must be an array with 1-10 items'),
    
    body('contentIds.*')
      .isMongoId()
      .withMessage('Each content ID must be a valid MongoDB ID')
  ],
  (req, res, next) => {
    // Check user role - only students can generate download tokens
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can generate download tokens'
      });
    }
    next();
  },
  generateDownloadToken
);

/**
 * GET /api/v1/content/download/:token
 * Download content using download token
 */
router.get('/download/:token',
  [
    param('token')
      .notEmpty()
      .withMessage('Download token is required')
      .isUUID()
      .withMessage('Invalid download token format')
  ],
  downloadContent
);

/**
 * DELETE /api/v1/content/:contentId
 * Delete content file (Instructor/Admin only)
 */
router.delete('/:contentId',
  auth,
  [
    param('contentId')
      .isMongoId()
      .withMessage('Invalid content ID format')
  ],
  (req, res, next) => {
    // Check user role
    if (req.user.role !== 'guru' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only instructors and admins can delete content'
      });
    }
    next();
  },
  deleteContent
);

/**
 * GET /api/v1/content/course/:courseId/analytics
 * Get content usage analytics (Instructor/Admin only)
 */
router.get('/course/:courseId/analytics',
  auth,
  [
    param('courseId')
      .isMongoId()
      .withMessage('Invalid course ID format'),
    
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
    
    query('contentType')
      .optional()
      .isIn(['video', 'audio', 'document', 'image', 'subtitle'])
      .withMessage('Invalid content type')
  ],
  (req, res, next) => {
    // Check user role
    if (req.user.role !== 'guru' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only instructors and admins can view content analytics'
      });
    }
    next();
  },
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const { startDate, endDate, contentType } = req.query;
      const instructorId = req.user.id;

      // Verify instructor owns the course
      const Course = require('../models/Course');
      const course = await Course.findOne({
        _id: courseId,
        'instructor.userId': instructorId
      });

      if (!course && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view analytics for this course'
        });
      }

      // Build date filter
      let dateFilter = {};
      if (startDate || endDate) {
        dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);
      }

      const ContentFile = require('../models/ContentFile');
      const Progress = require('../models/Progress');

      // Get content files
      let contentQuery = { courseId };
      if (contentType) contentQuery.contentType = contentType;

      const contentFiles = await ContentFile.find(contentQuery);

      // Get progress data for analytics
      let progressQuery = { courseId };
      if (Object.keys(dateFilter).length > 0) {
        progressQuery.lastActiveAt = dateFilter;
      }

      const progressData = await Progress.find(progressQuery)
        .populate('userId', 'profile.firstName profile.lastName');

      // Calculate content analytics
      const analytics = {
        totalFiles: contentFiles.length,
        contentByType: {},
        totalStorageUsed: 0,
        watchTimeAnalytics: {},
        downloadAnalytics: {},
        userEngagement: []
      };

      // Group content by type
      const contentTypes = ['video', 'audio', 'document', 'image', 'subtitle'];
      contentTypes.forEach(type => {
        const typeFiles = contentFiles.filter(f => f.contentType === type);
        analytics.contentByType[type] = {
          count: typeFiles.length,
          totalSize: typeFiles.reduce((sum, f) => sum + (f.fileSize || 0), 0)
        };
        analytics.totalStorageUsed += analytics.contentByType[type].totalSize;
      });

      // Calculate watch time analytics
      const totalWatchTime = progressData.reduce((sum, p) => sum + (p.totalWatchTime || 0), 0);
      const avgWatchTime = progressData.length > 0 ? totalWatchTime / progressData.length : 0;

      analytics.watchTimeAnalytics = {
        totalWatchTime,
        averageWatchTime: avgWatchTime,
        totalStudents: progressData.length,
        averageWatchTimePerStudent: avgWatchTime
      };

      // Calculate download analytics
      let totalDownloads = 0;
      progressData.forEach(progress => {
        const downloadInteractions = progress.interactions?.filter(
          i => i.type === 'content_download'
        ) || [];
        totalDownloads += downloadInteractions.length;
      });

      analytics.downloadAnalytics = {
        totalDownloads,
        averageDownloadsPerStudent: progressData.length > 0 ? totalDownloads / progressData.length : 0
      };

      // User engagement data
      analytics.userEngagement = progressData.map(progress => ({
        userId: progress.userId._id,
        userName: `${progress.userId.profile.firstName} ${progress.userId.profile.lastName}`,
        totalWatchTime: progress.totalWatchTime || 0,
        lastActiveAt: progress.lastActiveAt,
        completionPercentage: progress.completionPercentage || 0,
        totalInteractions: progress.interactions?.length || 0
      })).sort((a, b) => b.totalWatchTime - a.totalWatchTime);

      res.status(200).json({
        success: true,
        data: {
          courseTitle: course?.title,
          analytics,
          dateRange: {
            startDate: startDate || null,
            endDate: endDate || null
          },
          contentType: contentType || 'all'
        }
      });

    } catch (error) {
      console.error('Get content analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve content analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * GET /api/v1/content/thumbnail/:token
 * Get video thumbnail
 */
router.get('/thumbnail/:token',
  [
    param('token')
      .notEmpty()
      .withMessage('Thumbnail token is required')
      .isAlphanumeric()
      .withMessage('Invalid token format')
  ],
  async (req, res) => {
    try {
      const { token } = req.params;

      // This would serve generated thumbnails
      // For now, return a placeholder response
      res.status(404).json({
        success: false,
        message: 'Thumbnail generation not implemented yet'
      });

    } catch (error) {
      console.error('Get thumbnail error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve thumbnail'
      });
    }
  }
);

/**
 * POST /api/v1/content/bulk-upload
 * Bulk upload content files with metadata (Instructor/Admin only)
 */
router.post('/bulk-upload',
  auth,
  [
    body('courseId')
      .notEmpty()
      .withMessage('Course ID is required')
      .isMongoId()
      .withMessage('Invalid course ID format'),
    
    body('lectures')
      .isArray({ min: 1, max: 50 })
      .withMessage('Lectures array must contain 1-50 items'),
    
    body('lectures.*.lectureId')
      .notEmpty()
      .withMessage('Each lecture must have a lecture ID')
      .isMongoId()
      .withMessage('Invalid lecture ID format'),
    
    body('lectures.*.files')
      .isArray({ min: 1, max: 20 })
      .withMessage('Each lecture must have 1-20 files'),
    
    body('lectures.*.files.*.contentType')
      .isIn(['video', 'audio', 'document', 'image', 'subtitle'])
      .withMessage('Invalid content type'),
    
    body('lectures.*.files.*.metadata')
      .optional()
      .isObject()
      .withMessage('File metadata must be an object')
  ],
  (req, res, next) => {
    // Check user role
    if (req.user.role !== 'guru' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only instructors and admins can bulk upload content'
      });
    }
    next();
  },
  async (req, res) => {
    try {
      const { courseId, lectures } = req.body;
      const instructorId = req.user.id;

      // Verify instructor owns the course
      const Course = require('../models/Course');
      const course = await Course.findOne({
        _id: courseId,
        'instructor.userId': instructorId
      });

      if (!course && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to upload content for this course'
        });
      }

      // Process bulk upload (this would handle multiple file uploads)
      const results = {
        totalLectures: lectures.length,
        totalFilesExpected: lectures.reduce((sum, l) => sum + l.files.length, 0),
        successfulUploads: 0,
        failedUploads: 0,
        uploadResults: []
      };

      // This would need to handle actual file processing
      // For now, return a placeholder response
      lectures.forEach(lecture => {
        results.uploadResults.push({
          lectureId: lecture.lectureId,
          status: 'pending',
          message: 'Bulk upload processing not fully implemented'
        });
      });

      res.status(200).json({
        success: true,
        message: 'Bulk upload initiated successfully',
        data: results
      });

    } catch (error) {
      console.error('Bulk upload content error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process bulk upload',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

module.exports = router;