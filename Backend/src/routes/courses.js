const express = require('express');

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

module.exports = router;
