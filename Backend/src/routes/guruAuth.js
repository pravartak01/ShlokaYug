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

/**
 * @swagger
 * /api/v1/guru/dashboard-stats:
 *   get:
 *     summary: Get guru dashboard statistics
 *     tags: [Guru Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 */
router.get('/dashboard-stats', guruAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const Course = require('../models/Course');
    const Enrollment = require('../models/Enrollment');
    
    // Get all courses by this guru (excluding deleted)
    const courses = await Course.find({ 
      'instructor.userId': userId,
      isDeleted: { $ne: true }
    });
    const courseIds = courses.map(c => c._id);
    
    // Get all enrollments for these courses
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
      .populate('userId', 'profile email')
      .populate('courseId', 'title thumbnail');
    
    // Calculate stats
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(c => c.isPublished).length;
    const totalStudents = enrollments.length;
    const uniqueStudents = [...new Set(enrollments.map(e => e.userId?._id?.toString()))].length;
    const activeStudents = enrollments.filter(e => e.access?.status === 'active').length;
    const completedStudents = enrollments.filter(e => e.progress?.isCompleted).length;
    
    // Revenue calculations
    const totalRevenue = enrollments.reduce((acc, e) => {
      if (e.payment?.status === 'completed') {
        return acc + (e.payment.amount || 0);
      }
      return acc;
    }, 0);
    
    // This month's revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const thisMonthRevenue = enrollments.reduce((acc, e) => {
      if (e.payment?.status === 'completed' && new Date(e.payment.paidAt) >= startOfMonth) {
        return acc + (e.payment.amount || 0);
      }
      return acc;
    }, 0);
    
    // This month's enrollments
    const thisMonthEnrollments = enrollments.filter(e => new Date(e.createdAt) >= startOfMonth).length;
    
    // Average completion rate
    const avgCompletionRate = enrollments.length > 0
      ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress?.completionPercentage || 0), 0) / enrollments.length)
      : 0;
    
    // Average rating across all courses
    const avgRating = courses.length > 0
      ? courses.reduce((acc, c) => acc + (c.analytics?.ratings?.average || 0), 0) / courses.length
      : 0;
    
    const totalRatings = courses.reduce((acc, c) => acc + (c.analytics?.ratings?.count || 0), 0);
    
    // Recent enrollments (last 10)
    const recentEnrollments = enrollments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(e => ({
        _id: e._id,
        student: {
          name: `${e.userId?.profile?.firstName || ''} ${e.userId?.profile?.lastName || ''}`.trim() || 'Unknown',
          email: e.userId?.email,
          avatar: e.userId?.profile?.firstName?.[0] || 'S'
        },
        course: {
          _id: e.courseId?._id,
          title: e.courseId?.title || 'Unknown Course'
        },
        enrolledAt: e.createdAt,
        payment: {
          amount: e.payment?.amount || 0,
          status: e.payment?.status
        },
        progress: e.progress?.completionPercentage || 0
      }));
    
    // Course performance
    const coursePerformance = courses.map(course => {
      const courseEnrollments = enrollments.filter(e => e.courseId?._id?.toString() === course._id.toString());
      return {
        _id: course._id,
        title: course.title,
        thumbnail: course.thumbnail,
        isPublished: course.isPublished,
        enrollmentCount: courseEnrollments.length,
        revenue: courseEnrollments.reduce((acc, e) => acc + (e.payment?.amount || 0), 0),
        avgProgress: courseEnrollments.length > 0
          ? Math.round(courseEnrollments.reduce((acc, e) => acc + (e.progress?.completionPercentage || 0), 0) / courseEnrollments.length)
          : 0,
        rating: course.analytics?.ratings?.average || 0,
        completedCount: courseEnrollments.filter(e => e.progress?.isCompleted).length
      };
    }).sort((a, b) => b.enrollmentCount - a.enrollmentCount);
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalCourses,
          publishedCourses,
          draftCourses: totalCourses - publishedCourses,
          totalStudents,
          uniqueStudents,
          activeStudents,
          completedStudents,
          totalRevenue,
          thisMonthRevenue,
          thisMonthEnrollments,
          avgCompletionRate,
          avgRating: parseFloat(avgRating.toFixed(1)),
          totalRatings,
          platformFee: totalRevenue * 0.2,
          netEarnings: totalRevenue * 0.8
        },
        recentEnrollments,
        coursePerformance
      }
    });
    
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/guru/students:
 *   get:
 *     summary: Get all students enrolled in guru's courses
 *     tags: [Guru Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 */
router.get('/students', guruAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, search, courseId, status, progress } = req.query;
    
    const Course = require('../models/Course');
    const Enrollment = require('../models/Enrollment');
    
    // Get all course IDs by this guru
    const courses = await Course.find({ 'instructor.userId': userId }).select('_id title');
    const courseIds = courses.map(c => c._id);
    
    // Build filter
    const filter = { courseId: { $in: courseIds } };
    if (courseId) filter.courseId = courseId;
    if (status) filter['access.status'] = status;
    
    // Get enrollments with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let enrollmentsQuery = Enrollment.find(filter)
      .populate('userId', 'profile email username createdAt')
      .populate('courseId', 'title thumbnail')
      .sort({ createdAt: -1 });
    
    const totalCount = await Enrollment.countDocuments(filter);
    const enrollments = await enrollmentsQuery.skip(skip).limit(parseInt(limit));
    
    // Format students data
    const students = enrollments.map(e => ({
      _id: e._id,
      enrollmentId: e._id,
      student: {
        _id: e.userId?._id,
        name: `${e.userId?.profile?.firstName || ''} ${e.userId?.profile?.lastName || ''}`.trim() || 'Unknown',
        email: e.userId?.email,
        username: e.userId?.username,
        avatar: e.userId?.profile?.firstName?.[0] || 'S',
        joinedAt: e.userId?.createdAt
      },
      course: {
        _id: e.courseId?._id,
        title: e.courseId?.title,
        thumbnail: e.courseId?.thumbnail
      },
      enrollment: {
        type: e.enrollmentType,
        status: e.access?.status,
        enrolledAt: e.createdAt,
        lastAccess: e.access?.lastAccessedAt || e.analytics?.lastActivityDate
      },
      payment: {
        amount: e.payment?.amount || 0,
        status: e.payment?.status,
        paidAt: e.payment?.paidAt
      },
      progress: {
        percentage: e.progress?.completionPercentage || 0,
        lecturesCompleted: e.progress?.lecturesCompleted?.length || 0,
        isCompleted: e.progress?.isCompleted || false,
        completedAt: e.progress?.completedAt,
        totalWatchTime: e.progress?.totalWatchTime || 0
      }
    }));
    
    res.status(200).json({
      success: true,
      data: {
        students,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalStudents: totalCount,
          hasMore: skip + enrollments.length < totalCount
        },
        courses: courses.map(c => ({ _id: c._id, title: c.title }))
      }
    });
    
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/guru/revenue:
 *   get:
 *     summary: Get guru revenue analytics
 *     tags: [Guru Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue data retrieved successfully
 */
router.get('/revenue', guruAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;
    
    const Course = require('../models/Course');
    const Enrollment = require('../models/Enrollment');
    
    // Get all course IDs by this guru
    const courses = await Course.find({ 'instructor.userId': userId }).select('_id title');
    const courseIds = courses.map(c => c._id);
    
    // Get completed enrollments
    const enrollments = await Enrollment.find({
      courseId: { $in: courseIds },
      'payment.status': 'completed'
    }).populate('courseId', 'title');
    
    // Calculate period start date
    const now = new Date();
    let startDate;
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'all':
      default:
        startDate = new Date(0);
    }
    
    // Filter by period
    const periodEnrollments = enrollments.filter(e => 
      new Date(e.payment?.paidAt || e.createdAt) >= startDate
    );
    
    // Group by day/week/month depending on period
    const revenueByTime = {};
    periodEnrollments.forEach(e => {
      const date = new Date(e.payment?.paidAt || e.createdAt);
      let key;
      if (period === 'week') {
        key = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      } else if (period === 'month') {
        key = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      } else {
        key = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      }
      revenueByTime[key] = (revenueByTime[key] || 0) + (e.payment?.amount || 0);
    });
    
    // Revenue by course
    const revenueByCourse = {};
    periodEnrollments.forEach(e => {
      const courseTitle = e.courseId?.title || 'Unknown';
      revenueByCourse[courseTitle] = (revenueByCourse[courseTitle] || 0) + (e.payment?.amount || 0);
    });
    
    // Revenue by type
    const revenueByType = {
      one_time_purchase: 0,
      monthly_subscription: 0,
      yearly_subscription: 0
    };
    periodEnrollments.forEach(e => {
      const type = e.enrollmentType || 'one_time_purchase';
      revenueByType[type] = (revenueByType[type] || 0) + (e.payment?.amount || 0);
    });
    
    const totalRevenue = periodEnrollments.reduce((acc, e) => acc + (e.payment?.amount || 0), 0);
    const totalTransactions = periodEnrollments.length;
    
    res.status(200).json({
      success: true,
      data: {
        period,
        summary: {
          totalRevenue,
          totalTransactions,
          averageOrderValue: totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0,
          platformFee: totalRevenue * 0.2,
          netEarnings: totalRevenue * 0.8
        },
        revenueByTime: Object.entries(revenueByTime).map(([date, amount]) => ({ date, amount })),
        revenueByCourse: Object.entries(revenueByCourse).map(([course, amount]) => ({ course, amount })),
        revenueByType
      }
    });
    
  } catch (error) {
    console.error('Get revenue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;