const express = require('express');
const router = express.Router();

// Import middleware
const { auth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const {
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
  initiateEnrollment,
  confirmEnrollment,
  getMyEnrollments,
  getEnrollmentDetails,
  validateAccess,
  addDevice,
  removeDevice
} = require('../controllers/enrollmentController');

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
// @access  Private (Student only)
router.get('/my-enrollments',
  auth,
  checkRole(['student']),
  ...validateGetEnrollments,
  getMyEnrollments
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

      const Enrollment = require('../models/EnrollmentEnhanced');
      
      // Build filter
      const filter = {};
      
      if (req.user.role === 'guru') {
        filter.guruId = req.user.id;
      }
      
      if (guruId && req.user.role === 'admin') {
        filter.guruId = guruId;
      }
      
      if (courseId) filter.courseId = courseId;
      if (status) filter.status = status;
      if (enrollmentType) filter.enrollmentType = enrollmentType;
      
      if (dateFrom || dateTo) {
        filter.enrollmentDate = {};
        if (dateFrom) filter.enrollmentDate.$gte = new Date(dateFrom);
        if (dateTo) filter.enrollmentDate.$lte = new Date(dateTo);
      }

      // Add text search if provided
      if (search) {
        // This would require a text index on relevant fields
        filter.$text = { $search: search };
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { enrollmentDate: -1 },
        populate: [
          { path: 'userId', select: 'profile.firstName profile.lastName email' },
          { path: 'courseId', select: 'title metadata.category pricing' },
          { path: 'guruId', select: 'profile.firstName profile.lastName' }
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

      const Enrollment = require('../models/EnrollmentEnhanced');

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

      // Get enrollment stats
      const enrollmentStats = await Enrollment.getEnrollmentStats(
        userRole === 'guru' ? userId : null,
        startDate && endDate ? { startDate, endDate } : null
      );

      // Get revenue trends (this would integrate with PaymentTransaction model)
      const PaymentTransaction = require('../models/PaymentTransaction');
      const revenueTrends = await PaymentTransaction.getRevenueStats(
        userRole === 'guru' ? userId : null,
        period
      );

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
          revenueTrends,
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

      const Enrollment = require('../models/EnrollmentEnhanced');
      const enrollment = await Enrollment.findOne({ _id: id, userId });

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      // Find or create lecture progress
      let lectureProgress = enrollment.progress.completedLectures.find(
        lp => lp.lectureId === lectureId
      );

      if (lectureProgress) {
        // Update existing progress
        lectureProgress.timeSpent += timeSpent;
        if (completed && !lectureProgress.completedAt) {
          lectureProgress.completedAt = new Date();
        }
      } else {
        // Add new lecture progress
        enrollment.progress.completedLectures.push({
          lectureId,
          completedAt: completed ? new Date() : null,
          timeSpent
        });
      }

      // Update total time spent
      enrollment.progress.totalTimeSpent += timeSpent;
      enrollment.progress.lastAccessed = new Date();

      // Update overall progress if provided
      if (progress !== undefined) {
        enrollment.progress.overallProgress = Math.max(enrollment.progress.overallProgress, progress);
      }

      // Check for certificate eligibility (90% completion)
      if (enrollment.progress.overallProgress >= 90) {
        enrollment.progress.certificateEligible = true;
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

      const Enrollment = require('../models/EnrollmentEnhanced');
      const enrollment = await Enrollment.findOne({ _id: id, userId });

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      if (enrollment.enrollmentType !== 'subscription') {
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

      // Add audit log
      enrollment.addAuditLog(`subscription_${action}`, userId, {
        reason,
        effectiveDate: effectiveDateTime,
        previousStatus: enrollment.subscription.status
      }, req.ip);

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

      const Enrollment = require('../models/EnrollmentEnhanced');
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
      enrollment.status = 'cancelled';
      enrollment.access.isActive = false;
      
      if (enrollment.subscription) {
        enrollment.subscription.status = 'cancelled';
        enrollment.subscription.autoRenew = false;
      }

      // Add audit log
      enrollment.addAuditLog('cancelled', userId, {
        reason,
        requestRefund,
        refundReason,
        cancelledBy: userRole
      }, req.ip);

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
            status: enrollment.status,
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

      const Enrollment = require('../models/EnrollmentEnhanced');
      const enrollment = await Enrollment.findOne({ _id: id, userId })
        .select('access.currentDevices access.deviceLimit');

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      const activeDevices = enrollment.access.currentDevices.filter(device => device.isActive);

      res.status(200).json({
        success: true,
        message: 'Devices retrieved successfully',
        data: {
          devices: activeDevices.map(device => ({
            deviceId: device.deviceId,
            platform: device.deviceInfo.platform,
            browser: device.deviceInfo.browser,
            os: device.deviceInfo.os,
            lastAccess: device.deviceInfo.lastAccess,
            registeredAt: device.registeredAt
          })),
          deviceCount: activeDevices.length,
          deviceLimit: enrollment.access.deviceLimit,
          canAddDevice: activeDevices.length < enrollment.access.deviceLimit
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

module.exports = router;
