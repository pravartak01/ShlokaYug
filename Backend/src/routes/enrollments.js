const express = require('express');
const router = express.Router();

// Add debugging middleware
router.use((req, res, next) => {
  console.log(`📋 Enrollment Route: ${req.method} ${req.path}`);
  console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// Import middleware
const { auth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const {
  validateAutoEnrollment,
  validateInitiateEnrollment,
  validateConfirmEnrollment,
  validateEnrollmentId,
  validateDeviceId,
  validateGetEnrollments,
  validateAccessValidation,
  validateAddDevice,
  validateProgressUpdate,
  validateSubscriptionAction,
  validateCancelEnrollment,
  validateEnrollmentSearch,
  validateEnrollmentAnalytics,
  checkEnrollmentAccess
} = require('../middleware/enrollmentValidation');

// Import controllers
const {
  autoEnrollAfterPayment,
  initiateEnrollment,
  confirmEnrollment,
  getMyEnrollments,
  getEnrollmentDetails,
  validateAccess,
  addDevice,
  removeDevice,
  markLectureComplete,
  getCourseProgress
} = require('../controllers/enrollmentController');

// @desc    Auto-enroll user after successful payment (integration endpoint)
// @route   POST /api/enrollments/auto-enroll
// @access  Private (Internal)
router.post('/auto-enroll', 
  auth,
  validateAutoEnrollment, 
  autoEnrollAfterPayment
);

// @desc    Direct enrollment (for free courses or manual enrollment)
// @route   POST /api/enrollments/enroll
// @access  Private
router.post('/enroll',
  auth,
  async (req, res) => {
    try {
      const { courseId } = req.body;
      const userId = req.user.id;

      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }

      const Enrollment = require('../models/Enrollment');
      const Course = require('../models/Course');

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({ userId, courseId });
      if (existingEnrollment) {
        return res.status(200).json({
          success: true,
          message: 'Already enrolled in this course',
          data: { enrollment: existingEnrollment }
        });
      }

      // Get course details
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Generate unique payment ID for free enrollment
      const paymentId = `free_${userId.slice(-8)}_${courseId.slice(-8)}_${Date.now()}`;

      // Create enrollment
      const enrollment = new Enrollment({
        userId,
        courseId,
        guruId: course.instructor?.userId || course.instructor,
        enrollmentType: 'one_time_purchase',
        payment: {
          paymentId: paymentId,
          amount: 0,
          currency: 'INR',
          status: 'completed',
          paidAt: new Date()
        },
        access: {
          status: 'active',
          grantedAt: new Date()
        },
        analytics: {
          enrollmentSource: 'direct'
        }
      });

      await enrollment.save();
      console.log('✅ Direct enrollment created:', enrollment._id);

      res.status(201).json({
        success: true,
        message: 'Enrolled successfully',
        data: { enrollment }
      });

    } catch (error) {
      console.error('Enrollment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to enroll in course',
        error: error.message
      });
    }
  }
);

// @desc    Initiate enrollment process (create Razorpay order)
// @route   POST /api/enrollments/initiate
// @access  Private (Student only)
router.post('/initiate',
  auth,
  checkRole(['student']),
  ...validateInitiateEnrollment,
  initiateEnrollment
);

// @desc    Confirm enrollment after successful payment
// @route   POST /api/enrollments/confirm
// @access  Private (Student only)
router.post('/confirm',
  auth,
  checkRole(['student']),
  ...validateConfirmEnrollment,
  confirmEnrollment
);

// @desc    Get user's enrollments
// @route   GET /api/enrollments/my-enrollments
// @access  Private
router.get('/my-enrollments',
  auth,
  ...validateGetEnrollments,
  getMyEnrollments
);

// @desc    Get user's enrolled courses (alias for mobile app)
// @route   GET /api/enrollments/my-courses
// @access  Private
router.get('/my-courses',
  auth,
  getMyEnrollments
);

// @desc    Mark lecture as complete
// @route   POST /api/enrollments/lecture-complete
// @access  Private
router.post('/lecture-complete',
  auth,
  markLectureComplete
);

// @desc    Get course progress
// @route   GET /api/enrollments/course/:courseId/progress
// @access  Private
router.get('/course/:courseId/progress',
  auth,
  getCourseProgress
);

// @desc    Search enrollments (for admin and analytics)
// @route   GET /api/enrollments/search
// @access  Private (Admin/Guru)
router.get('/search',
  auth,
  checkRole(['admin', 'guru']),
  ...validateEnrollmentSearch,
  async (req, res) => {
    try {
      const {
        search,
        courseId,
        guruId,
        status,
        enrollmentType,
        dateFrom,
        dateTo,
        page = 1,
        limit = 20
      } = req.query;

      const Enrollment = require('../models/Enrollment');
      
      const filter = {};
      
      if (req.user.role === 'guru') {
        filter.guruId = req.user.id;
      }
      
      if (guruId && req.user.role === 'admin') {
        filter.guruId = guruId;
      }
      
      if (courseId) filter.courseId = courseId;
      if (status) filter['access.status'] = status;
      if (enrollmentType) filter.enrollmentType = enrollmentType;
      
      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo);
      }

      // Add text search if provided
      if (search) {
        // This would require a text index on relevant fields
        filter.$text = { $search: search };
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: [
          { path: 'userId', select: 'name email profile' },
          { path: 'courseId', select: 'title metadata pricing' },
          { path: 'guruId', select: 'name profile' }
        ]
      };

      const enrollments = await Enrollment.paginate(filter, options);

      res.status(200).json({
        success: true,
        message: 'Enrollments retrieved successfully',
        data: {
          enrollments: enrollments.docs,
          pagination: {
            currentPage: enrollments.page,
            totalPages: enrollments.totalPages,
            totalEnrollments: enrollments.totalDocs,
            hasNext: enrollments.hasNextPage,
            hasPrev: enrollments.hasPrevPage
          }
        }
      });

    } catch (error) {
      console.error('Search enrollments error:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching enrollments',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @desc    Get enrollment analytics
// @route   GET /api/enrollments/analytics
// @access  Private (Admin/Guru)
router.get('/analytics',
  auth,
  checkRole(['admin', 'guru']),
  ...validateEnrollmentAnalytics,
  async (req, res) => {
    try {
      const { period = 'month', courseId, startDate, endDate } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;

      const Enrollment = require('../models/Enrollment');

      // Build match conditions
      const matchConditions = {};
      if (userRole === 'guru') {
        matchConditions.guruId = new require('mongoose').Types.ObjectId(userId);
      }
      if (courseId) {
        matchConditions.courseId = new require('mongoose').Types.ObjectId(courseId);
      }
      if (startDate || endDate) {
        matchConditions.enrollmentDate = {};
        if (startDate) matchConditions.enrollmentDate.$gte = new Date(startDate);
        if (endDate) matchConditions.enrollmentDate.$lte = new Date(endDate);
      }

      // Get enrollment stats using aggregation instead of static method
      const enrollmentStats = await Enrollment.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: null,
            totalEnrollments: { $sum: 1 },
            activeEnrollments: {
              $sum: { $cond: [{ $eq: ['$access.status', 'active'] }, 1, 0] }
            },
            totalRevenue: { $sum: '$payment.amount' },
            averageRevenue: { $avg: '$payment.amount' },
            subscriptionEnrollments: {
              $sum: { $cond: [{ $regex: ['$enrollmentType', 'subscription'] }, 1, 0] }
            },
            oneTimeEnrollments: {
              $sum: { $cond: [{ $eq: ['$enrollmentType', 'one_time_purchase'] }, 1, 0] }
            }
          }
        }
      ]);

      // Get revenue trends (this would integrate with PaymentTransactionSimple model)
      const PaymentTransactionSimple = require('../models/PaymentTransactionSimple');
      const revenueTrends = await PaymentTransactionSimple.aggregate([
        {
          $match: {
            status: 'completed',
            ...(userRole === 'guru' && { userId: new require('mongoose').Types.ObjectId(userId) })
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            totalTransactions: { $sum: 1 },
            averageAmount: { $avg: '$amount' }
          }
        }
      ]);

      res.status(200).json({
        success: true,
        message: 'Analytics retrieved successfully',
        data: {
          enrollmentStats: enrollmentStats[0] || {
            totalEnrollments: 0,
            activeEnrollments: 0,
            totalRevenue: 0,
            averageRevenue: 0,
            subscriptionEnrollments: 0,
            oneTimeEnrollments: 0
          },
          revenueTrends: revenueTrends[0] || { totalRevenue: 0, totalTransactions: 0, averageAmount: 0 },
          period,
          dateRange: { startDate, endDate }
        }
      });

    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @desc    Get specific enrollment details
// @route   GET /api/enrollments/:id
// @access  Private (Student/Guru/Admin)
router.get('/:id',
  auth,
  ...validateEnrollmentId,
  getEnrollmentDetails
);

// @desc    Validate access from device
// @route   POST /api/enrollments/:id/validate
// @access  Private (Student only)
router.post('/:id/validate',
  auth,
  checkRole(['student']),
  ...validateEnrollmentId,
  ...validateAccessValidation,
  validateAccess
);

// @desc    Update learning progress
// @route   PATCH /api/enrollments/:id/progress
// @access  Private (Student only)
router.patch('/:id/progress',
  auth,
  checkRole(['student']),
  ...validateEnrollmentId,
  ...validateProgressUpdate,
  checkEnrollmentAccess,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { lectureId, timeSpent = 0, completed = false, progress } = req.body;
      const userId = req.user.id;

      const Enrollment = require('../models/Enrollment');
      const enrollment = await Enrollment.findOne({ _id: id, userId });

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      // Find or create lecture progress
      let lectureProgress = enrollment.progress?.completedLectures?.find(
        lp => lp.lectureId === lectureId
      );

      if (lectureProgress) {
        // Update existing progress
        lectureProgress.timeSpent += timeSpent;
        if (completed && !lectureProgress.completedAt) {
          lectureProgress.completedAt = new Date();
        }
      } else {
        // Add new lecture progress - initialize array if needed
        if (!enrollment.progress) enrollment.progress = { completedLectures: [], totalTimeSpent: 0 };
        if (!enrollment.progress.completedLectures) enrollment.progress.completedLectures = [];
        
        enrollment.progress.completedLectures.push({
          lectureId,
          completedAt: completed ? new Date() : null,
          timeSpent
        });
      }

      // Initialize analytics if not exists
      if (!enrollment.analytics) {
        enrollment.analytics = { lastActivityDate: new Date() };
      } else {
        enrollment.analytics.lastActivityDate = new Date();
      }

      // Update overall completion percentage if provided  
      if (progress !== undefined) {
        // Simple progress tracking - could be enhanced with more sophisticated logic
        if (!enrollment.progress) enrollment.progress = {};
        enrollment.progress.overallProgress = Math.max(enrollment.progress.overallProgress || 0, progress);
      }

      await enrollment.save();

      res.status(200).json({
        success: true,
        message: 'Progress updated successfully',
        data: {
          progress: enrollment.progress,
          certificateEligible: enrollment.progress.certificateEligible
        }
      });

    } catch (error) {
      console.error('Update progress error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating progress',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @desc    Manage subscription (pause/resume/cancel)
// @route   PATCH /api/enrollments/:id/subscription
// @access  Private (Student only)
router.patch('/:id/subscription',
  auth,
  checkRole(['student']),
  ...validateEnrollmentId,
  ...validateSubscriptionAction,
  checkEnrollmentAccess,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { action, reason, effectiveDate } = req.body;
      const userId = req.user.id;

      const Enrollment = require('../models/Enrollment');
      const enrollment = await Enrollment.findOne({ _id: id, userId });

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      if (enrollment.enrollmentType !== 'subscription' && 
          !enrollment.enrollmentType.includes('subscription')) {
        return res.status(400).json({
          success: false,
          message: 'This enrollment is not a subscription'
        });
      }

      const effectiveDateTime = effectiveDate ? new Date(effectiveDate) : new Date();

      switch (action) {
        case 'pause':
          if (enrollment.subscription.status !== 'active') {
            return res.status(400).json({
              success: false,
              message: 'Can only pause active subscriptions'
            });
          }
          enrollment.subscription.status = 'paused';
          enrollment.subscription.autoRenew = false;
          break;

        case 'resume':
          if (enrollment.subscription.status !== 'paused') {
            return res.status(400).json({
              success: false,
              message: 'Can only resume paused subscriptions'
            });
          }
          enrollment.subscription.status = 'active';
          enrollment.subscription.autoRenew = true;
          break;

        case 'cancel':
          enrollment.subscription.status = 'cancelled';
          enrollment.subscription.autoRenew = false;
          // Don't immediately deactivate - let subscription expire naturally
          break;

        case 'renew':
          if (enrollment.subscription.status === 'expired') {
            return res.status(400).json({
              success: false,
              message: 'Cannot renew expired subscription. Please create a new enrollment.'
            });
          }
          enrollment.subscription.status = 'active';
          enrollment.subscription.autoRenew = true;
          // Extend subscription period
          const newEndDate = new Date(enrollment.subscription.endDate);
          if (enrollment.subscription.billingCycle === 'monthly') {
            newEndDate.setMonth(newEndDate.getMonth() + 1);
          } else {
            newEndDate.setFullYear(newEndDate.getFullYear() + 1);
          }
          enrollment.subscription.endDate = newEndDate;
          enrollment.subscription.renewalDate = newEndDate;
          enrollment.access.expiresAt = newEndDate;
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid action'
          });
      }

      // Add audit log (simplified - the model doesn't have addAuditLog method)
      // enrollment.addAuditLog(`subscription_${action}`, userId, {
      //   reason,
      //   effectiveDate: effectiveDateTime,
      //   previousStatus: enrollment.subscription.status
      // }, req.ip);

      await enrollment.save();

      res.status(200).json({
        success: true,
        message: `Subscription ${action} successful`,
        data: {
          subscription: enrollment.subscription,
          access: enrollment.access
        }
      });

    } catch (error) {
      console.error('Manage subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Error managing subscription',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @desc    Cancel enrollment
// @route   DELETE /api/enrollments/:id
// @access  Private (Student/Admin)
router.delete('/:id',
  auth,
  ...validateEnrollmentId,
  ...validateCancelEnrollment,
  checkEnrollmentAccess,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, requestRefund = false, refundReason } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      const Enrollment = require('../models/Enrollment');
      const enrollment = await Enrollment.findById(id);

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      // Check authorization
      const canCancel = 
        userRole === 'admin' ||
        enrollment.userId.toString() === userId;

      if (!canCancel) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this enrollment'
        });
      }

      // Update enrollment status
      enrollment.access.status = 'cancelled';
      
      if (enrollment.subscription) {
        enrollment.subscription.status = 'cancelled';
        enrollment.subscription.autoRenew = false;
      }

      // Add audit log (simplified)
      // enrollment.addAuditLog('cancelled', userId, {
      //   reason,
      //   requestRefund,
      //   refundReason,
      //   cancelledBy: userRole
      // }, req.ip);

      await enrollment.save();

      // If refund requested, initiate refund process
      let refundInfo = null;
      if (requestRefund) {
        // This would integrate with the payment refund system
        refundInfo = {
          requested: true,
          reason: refundReason,
          status: 'pending_review'
        };
      }

      res.status(200).json({
        success: true,
        message: 'Enrollment cancelled successfully',
        data: {
          enrollment: {
            id: enrollment._id,
            status: enrollment.access.status,
            cancelledAt: new Date()
          },
          refund: refundInfo
        }
      });

    } catch (error) {
      console.error('Cancel enrollment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error cancelling enrollment',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Device Management Routes

// @desc    Get user's registered devices for enrollment
// @route   GET /api/enrollments/:id/devices
// @access  Private (Student only)
router.get('/:id/devices',
  auth,
  checkRole(['student']),
  ...validateEnrollmentId,
  checkEnrollmentAccess,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const Enrollment = require('../models/Enrollment');
      const enrollment = await Enrollment.findOne({ _id: id, userId })
        .select('access.accessDevices access.maxConcurrentDevices');

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      const activeDevices = enrollment.access.accessDevices?.filter(device => device.isActive) || [];

      res.status(200).json({
        success: true,
        message: 'Devices retrieved successfully',
        data: {
          devices: activeDevices.map(device => ({
            deviceId: device.deviceId,
            platform: device.platform,
            deviceType: device.deviceType,
            lastUsed: device.lastUsed,
            registeredAt: device.lastUsed // Using lastUsed as proxy for registeredAt
          })),
          deviceCount: activeDevices.length,
          deviceLimit: enrollment.access.maxConcurrentDevices,
          canAddDevice: activeDevices.length < enrollment.access.maxConcurrentDevices
        }
      });

    } catch (error) {
      console.error('Get devices error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching devices',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @desc    Add new device to enrollment
// @route   POST /api/enrollments/:id/devices
// @access  Private (Student only)
router.post('/:id/devices',
  auth,
  checkRole(['student']),
  ...validateEnrollmentId,
  ...validateAddDevice,
  addDevice
);

// @desc    Remove device from enrollment
// @route   DELETE /api/enrollments/:id/devices/:deviceId
// @access  Private (Student only)
router.delete('/:id/devices/:deviceId',
  auth,
  checkRole(['student']),
  ...validateEnrollmentId,
  ...validateDeviceId,
  removeDevice
);

// @desc    Force complete course (DEVELOPMENT ONLY)
// @route   POST /api/enrollments/force-complete/:courseId
// @access  Private
router.post('/force-complete/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    const Enrollment = require('../models/Enrollment');
    const Course = require('../models/Course');
    
    console.log('🎯 Force complete request:', { userId, courseId });
    
    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      console.log('❌ Enrollment not found');
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
      console.log('❌ Course not found');
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    console.log('📚 Course structure:', JSON.stringify(course.structure, null, 2));
    
    // Collect all lecture IDs
    const allLectureIds = [];
    let totalLectures = 0;
    course.structure?.units?.forEach(unit => {
      unit.lessons?.forEach(lesson => {
        lesson.lectures?.forEach(lecture => {
          totalLectures++;
          if (lecture.lectureId) {
            allLectureIds.push(lecture.lectureId);
          } else {
            // Generate a placeholder ID if missing
            allLectureIds.push(`lecture_${totalLectures}`);
          }
        });
      });
    });
    
    console.log('✅ Collected lecture IDs:', allLectureIds.length, 'Total lectures:', totalLectures);
    
    // Mark all lectures as complete
    enrollment.progress = {
      lecturesCompleted: allLectureIds,
      completionPercentage: 100,
      isCompleted: true,
      completedAt: new Date(),
      totalWatchTime: course.structure?.totalDuration || 3600,
      lastAccessedLecture: allLectureIds[allLectureIds.length - 1] || 'final'
    };
    
    await enrollment.save();
    
    console.log('✅ Course force-completed successfully');
    
    res.json({
      success: true,
      message: 'Course force-completed successfully',
      data: {
        lecturesCompleted: allLectureIds.length,
        completionPercentage: 100,
        isCompleted: true
      }
    });
  } catch (error) {
    console.error('❌ Force complete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
