const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Import middleware
const { auth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Import controllers
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addUnit,
  addLesson,
  addLecture,
  publishCourse,
  unpublishCourse,
  getInstructorCourses,
  getCourseAnalytics,
  uploadLectureVideo,
} = require('../controllers/courseController');

// Import validations
const {
  createCourseValidation,
  updateCourseValidation,
  getCourseValidation,
  getAllCoursesValidation,
  deleteCourseValidation,
  addUnitValidation,
  addLessonValidation,
  addLectureValidation,
  publishCourseValidation,
  unpublishCourseValidation,
  getInstructorCoursesValidation,
  getCourseAnalyticsValidation,
} = require('../middleware/courseValidation');

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

/**
 * @route   GET /api/courses
 * @desc    Get all published courses with filtering and pagination
 * @access  Public
 */
router.get('/', getAllCoursesValidation, getAllCourses);

/**
 * @route   GET /api/courses/:id
 * @desc    Get course by ID (published courses or enrolled/instructor access)
 * @access  Public/Private
 */
router.get('/:id', getCourseValidation, getCourseById);

// ============================================================================
// PROTECTED ROUTES (Authentication required)
// ============================================================================

/**
 * @route   POST /api/courses
 * @desc    Create a new course
 * @access  Private (Gurus only)
 */
router.post('/', auth, checkRole(['guru']), createCourseValidation, createCourse);

/**
 * @route   PUT /api/courses/:id
 * @desc    Update course
 * @access  Private (Instructor only)
 */
router.put('/:id', auth, updateCourseValidation, updateCourse);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete course (soft delete)
 * @access  Private (Instructor only)
 */
router.delete('/:id', auth, deleteCourseValidation, deleteCourse);

// ============================================================================
// COURSE CONTENT MANAGEMENT ROUTES
// ============================================================================

/**
 * @route   POST /api/courses/:id/units
 * @desc    Add unit to course
 * @access  Private (Instructor only)
 */
router.post('/:id/units', auth, addUnitValidation, addUnit);

/**
 * @route   POST /api/courses/:courseId/units/:unitId/lessons
 * @desc    Add lesson to unit
 * @access  Private (Instructor only)
 */
router.post('/:courseId/units/:unitId/lessons', auth, addLessonValidation, addLesson);

/**
 * @route   POST /api/courses/:courseId/units/:unitId/lessons/:lessonId/lectures
 * @desc    Add lecture to lesson
 * @access  Private (Instructor only)
 */
router.post(
  '/:courseId/units/:unitId/lessons/:lessonId/lectures',
  auth,
  addLectureValidation,
  addLecture
);

// ============================================================================
// COURSE PUBLISHING ROUTES
// ============================================================================

/**
 * @route   PATCH /api/courses/:id/publish
 * @desc    Publish course
 * @access  Private (Instructor only)
 */
router.patch('/:id/publish', auth, publishCourseValidation, publishCourse);

/**
 * @route   PATCH /api/courses/:id/unpublish
 * @desc    Unpublish course
 * @access  Private (Instructor only)
 */
router.patch('/:id/unpublish', auth, unpublishCourseValidation, unpublishCourse);

// ============================================================================
// INSTRUCTOR DASHBOARD ROUTES
// ============================================================================

/**
 * @route   GET /api/courses/instructor/my-courses
 * @desc    Get instructor's courses
 * @access  Private (Gurus only)
 */
router.get(
  '/instructor/my-courses',
  auth,
  checkRole(['guru']),
  getInstructorCoursesValidation,
  getInstructorCourses
);

/**
 * @route   GET /api/courses/instructor/:id/analytics
 * @desc    Get course analytics for instructor
 * @access  Private (Course instructor only)
 */
router.get('/instructor/:id/analytics', auth, getCourseAnalyticsValidation, getCourseAnalytics);

// ============================================================================
// VIDEO UPLOAD ROUTES
// ============================================================================

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/course-videos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `lecture-${uniqueSuffix}${extension}`);
  }
});

// File filter for videos
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/webm'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max file size
  }
});

// Thumbnail upload configuration
const thumbnailDir = path.join(__dirname, '../../uploads/course-thumbnails');
if (!fs.existsSync(thumbnailDir)) {
  fs.mkdirSync(thumbnailDir, { recursive: true });
}

const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, thumbnailDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `thumbnail-${uniqueSuffix}${extension}`);
  }
});

const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files are allowed.'), false);
  }
};

const thumbnailUpload = multer({
  storage: thumbnailStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size for thumbnails
  }
});

/**
 * @route   POST /api/courses/:id/thumbnail
 * @desc    Upload thumbnail for course
 * @access  Private (Course instructor only)
 */
router.post(
  '/:id/thumbnail',
  auth,
  checkRole(['guru']),
  thumbnailUpload.single('thumbnail'),
  async (req, res) => {
    try {
      const Course = require('../models/Course');
      const course = await Course.findById(req.params.id);
      
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      
      // Check if user is the instructor
      if (course.instructor.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No thumbnail file uploaded' });
      }
      
      // Construct the URL for the thumbnail
      const thumbnailUrl = `/uploads/course-thumbnails/${req.file.filename}`;
      
      // Update course with thumbnail URL
      course.thumbnail = thumbnailUrl;
      await course.save();
      
      res.status(200).json({
        success: true,
        message: 'Thumbnail uploaded successfully',
        data: { thumbnailUrl }
      });
    } catch (error) {
      console.error('Thumbnail upload error:', error);
      res.status(500).json({ success: false, message: 'Failed to upload thumbnail' });
    }
  }
);

/**
 * @route   POST /api/courses/upload-video
 * @desc    Upload video for course lecture
 * @access  Private (Gurus only)
 */
router.post(
  '/upload-video',
  auth,
  checkRole(['guru']),
  upload.single('video'),
  uploadLectureVideo
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 500MB.'
      });
    }
  } else if (error.message === 'Invalid file type. Only video files are allowed.') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next(error);
});

module.exports = router;
