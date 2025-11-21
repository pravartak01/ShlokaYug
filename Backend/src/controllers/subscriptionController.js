const EnrollmentV2 = require('../models/EnrollmentEnhanced');
const PaymentTransaction = require('../models/PaymentTransaction');
const Course = require('../models/Course');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Subscription Management Controller
 * Handles subscription lifecycle, renewals, cancellations, and management
 */

/**
 * @desc    Get user's active subscriptions
 * @route   GET /api/subscriptions/my-subscriptions
 * @access  Private (Student)
 */
const getMySubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, includeExpired = false } = req.query;

    // Build filter
    const filter = { 
      userId: new mongoose.Types.ObjectId(userId),
      enrollmentType: 'subscription'
    };

    if (status) {
      filter['subscription.status'] = status;
    } else if (!includeExpired) {
      // Only active subscriptions by default
      filter['subscription.status'] = { $in: ['active', 'trialing'] };
    }

    const subscriptions = await EnrollmentV2.find(filter)
      .populate('courseId', 'title description instructor thumbnail duration')
      .populate('userId', 'name email')
      .sort({ 'subscription.nextBillingDate': 1 });

    const subscriptionData = subscriptions.map(enrollment => {
      const subscription = enrollment.subscription;
      const course = enrollment.courseId;
      
      // Calculate subscription metrics
      const totalPaid = enrollment.paymentHistory.reduce((sum, payment) => 
        sum + (payment.amount || 0), 0);
      
      const daysActive = Math.floor(
        (Date.now() - enrollment.enrollmentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Determine next action based on status
      let nextAction = null;
      if (subscription.status === 'active') {
        if (subscription.cancelAtPeriodEnd) {
          nextAction = {
            type: 'expires',
            date: subscription.currentPeriodEnd,
            description: 'Subscription will end'
          };
        } else {
          nextAction = {
            type: 'renews',
            date: subscription.nextBillingDate,
            description: 'Next billing'
          };
        }
      } else if (subscription.status === 'past_due') {
        nextAction = {
          type: 'retry',
          date: subscription.nextRetryDate,
          description: 'Payment retry'
        };
      }

      return {
        id: enrollment._id,
        course: {
          id: course._id,
          title: course.title,
          description: course.description,
          instructor: course.instructor.name,
          thumbnail: course.thumbnail,
          duration: course.duration
        },
        subscription: {
          status: subscription.status,
          plan: subscription.plan,
          billingCycle: subscription.billingCycle,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          nextBillingDate: subscription.nextBillingDate,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          cancelledAt: subscription.cancelledAt,
          cancelReason: subscription.cancelReason,
          deviceLimit: subscription.deviceLimit,
          trialEnd: subscription.trialEnd,
          discountPercentage: subscription.discountPercentage
        },
        enrollment: {
          enrollmentDate: enrollment.enrollmentDate,
          status: enrollment.status,
          progress: enrollment.progress,
          lastAccessedAt: enrollment.lastAccessedAt,
          certificateEligible: enrollment.certificateEligible,
          certificateIssued: enrollment.certificateIssued
        },
        metrics: {
          totalPaid,
          daysActive,
          activeDevices: enrollment.devices.filter(d => d.isActive).length,
          totalDevices: enrollment.devices.length
        },
        nextAction
      };
    });

    res.status(200).json({
      success: true,
      message: 'Subscriptions retrieved successfully',
      data: {
        subscriptions: subscriptionData,
        summary: {
          total: subscriptionData.length,
          active: subscriptionData.filter(s => s.subscription.status === 'active').length,
          trialPeriod: subscriptionData.filter(s => s.subscription.status === 'trialing').length,
          pastDue: subscriptionData.filter(s => s.subscription.status === 'past_due').length,
          cancelled: subscriptionData.filter(s => s.subscription.status === 'cancelled').length
        }
      }
    });

  } catch (error) {
    console.error('Get my subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscriptions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Pause subscription
 * @route   POST /api/subscriptions/:enrollmentId/pause
 * @access  Private (Student - own subscription only)
 */
const pauseSubscription = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { reason, pauseDuration } = req.body;
    const userId = req.user.id;

    const enrollment = await EnrollmentV2.findById(enrollmentId)
      .populate('courseId', 'title');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Verify ownership
    if (enrollment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Verify it's a subscription
    if (enrollment.enrollmentType !== 'subscription') {
      return res.status(400).json({
        success: false,
        message: 'Only subscriptions can be paused'
      });
    }

    // Verify subscription can be paused
    if (!['active', 'trialing'].includes(enrollment.subscription.status)) {
      return res.status(400).json({
        success: false,
        message: 'Subscription cannot be paused in current state'
      });
    }

    // Calculate pause end date
    let pauseEndDate = null;
    if (pauseDuration) {
      pauseEndDate = new Date();
      pauseEndDate.setDate(pauseEndDate.getDate() + parseInt(pauseDuration));
    }

    // Pause the subscription
    await enrollment.pauseSubscription(reason, pauseEndDate);

    res.status(200).json({
      success: true,
      message: 'Subscription paused successfully',
      data: {
        enrollmentId: enrollment._id,
        courseName: enrollment.courseId.title,
        pausedAt: enrollment.subscription.pausedAt,
        pauseEndDate: enrollment.subscription.pauseEndDate,
        reason: enrollment.subscription.pauseReason,
        status: enrollment.subscription.status
      }
    });

  } catch (error) {
    console.error('Pause subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error pausing subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Resume subscription
 * @route   POST /api/subscriptions/:enrollmentId/resume
 * @access  Private (Student - own subscription only)
 */
const resumeSubscription = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const userId = req.user.id;

    const enrollment = await EnrollmentV2.findById(enrollmentId)
      .populate('courseId', 'title');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Verify ownership
    if (enrollment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Verify subscription can be resumed
    if (enrollment.subscription.status !== 'paused') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is not paused'
      });
    }

    // Resume the subscription
    await enrollment.resumeSubscription();

    res.status(200).json({
      success: true,
      message: 'Subscription resumed successfully',
      data: {
        enrollmentId: enrollment._id,
        courseName: enrollment.courseId.title,
        resumedAt: new Date(),
        nextBillingDate: enrollment.subscription.nextBillingDate,
        status: enrollment.subscription.status
      }
    });

  } catch (error) {
    console.error('Resume subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resuming subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Cancel subscription
 * @route   POST /api/subscriptions/:enrollmentId/cancel
 * @access  Private (Student - own subscription only)
 */
const cancelSubscription = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { reason, immediate = false, feedback } = req.body;
    const userId = req.user.id;

    const enrollment = await EnrollmentV2.findById(enrollmentId)
      .populate('courseId', 'title');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Verify ownership
    if (enrollment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Verify it's a subscription
    if (enrollment.enrollmentType !== 'subscription') {
      return res.status(400).json({
        success: false,
        message: 'Only subscriptions can be cancelled'
      });
    }

    // Verify subscription can be cancelled
    if (['cancelled', 'expired'].includes(enrollment.subscription.status)) {
      return res.status(400).json({
        success: false,
        message: 'Subscription is already cancelled or expired'
      });
    }

    // Cancel the subscription
    await enrollment.cancelSubscription(reason, immediate, feedback);

    const responseData = {
      enrollmentId: enrollment._id,
      courseName: enrollment.courseId.title,
      cancelledAt: enrollment.subscription.cancelledAt,
      reason: enrollment.subscription.cancelReason,
      immediate,
      status: enrollment.subscription.status
    };

    if (!immediate) {
      responseData.accessUntil = enrollment.subscription.currentPeriodEnd;
      responseData.message = 'Subscription will end at the current period end';
    } else {
      responseData.message = 'Subscription cancelled immediately';
    }

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Renew subscription manually
 * @route   POST /api/subscriptions/:enrollmentId/renew
 * @access  Private (Student - own subscription only)
 */
const renewSubscription = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { billingCycle } = req.body;
    const userId = req.user.id;

    const enrollment = await EnrollmentV2.findById(enrollmentId)
      .populate('courseId', 'title pricing');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Verify ownership
    if (enrollment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Verify it's a subscription
    if (enrollment.enrollmentType !== 'subscription') {
      return res.status(400).json({
        success: false,
        message: 'Only subscriptions can be renewed'
      });
    }

    // Verify subscription needs renewal
    if (!['expired', 'past_due', 'cancelled'].includes(enrollment.subscription.status)) {
      return res.status(400).json({
        success: false,
        message: 'Subscription does not need renewal'
      });
    }

    // Calculate renewal price
    const course = enrollment.courseId;
    const newBillingCycle = billingCycle || enrollment.subscription.billingCycle;
    
    let renewalPrice;
    if (newBillingCycle === 'monthly') {
      renewalPrice = course.pricing.subscription.monthly;
    } else if (newBillingCycle === 'quarterly') {
      renewalPrice = course.pricing.subscription.quarterly;
    } else if (newBillingCycle === 'yearly') {
      renewalPrice = course.pricing.subscription.yearly;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid billing cycle'
      });
    }

    // Apply any existing discount
    if (enrollment.subscription.discountPercentage > 0) {
      renewalPrice = renewalPrice * (1 - enrollment.subscription.discountPercentage / 100);
    }

    // Create payment order for renewal
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const orderOptions = {
      amount: Math.round(renewalPrice * 100), // Convert to paise
      currency: 'INR',
      receipt: `renewal_${enrollment._id}_${Date.now()}`,
      notes: {
        enrollmentId: enrollment._id.toString(),
        userId: userId,
        courseId: course._id.toString(),
        type: 'subscription_renewal',
        billingCycle: newBillingCycle
      }
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // Create payment transaction record
    const paymentTransaction = new PaymentTransaction({
      transactionId: `renewal_${Date.now()}_${enrollment._id}`,
      userId: new mongoose.Types.ObjectId(userId),
      courseId: course._id,
      enrollmentId: enrollment._id,
      guruId: course.instructor._id,
      razorpayOrderId: razorpayOrder.id,
      amount: {
        original: course.pricing.subscription[newBillingCycle],
        discount: (course.pricing.subscription[newBillingCycle] - renewalPrice),
        total: renewalPrice
      },
      currency: 'INR',
      paymentMethod: 'razorpay',
      status: 'pending',
      metadata: {
        source: 'subscription_renewal',
        billingCycle: newBillingCycle,
        previousStatus: enrollment.subscription.status
      }
    });

    await paymentTransaction.save();

    res.status(200).json({
      success: true,
      message: 'Renewal payment order created',
      data: {
        orderId: razorpayOrder.id,
        amount: renewalPrice,
        currency: 'INR',
        enrollmentId: enrollment._id,
        courseName: course.title,
        billingCycle: newBillingCycle,
        paymentTransactionId: paymentTransaction._id,
        renewalDetails: {
          previousStatus: enrollment.subscription.status,
          newBillingCycle,
          discountApplied: enrollment.subscription.discountPercentage
        }
      }
    });

  } catch (error) {
    console.error('Renew subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating renewal payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update subscription preferences
 * @route   PATCH /api/subscriptions/:enrollmentId/preferences
 * @access  Private (Student - own subscription only)
 */
const updateSubscriptionPreferences = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { billingCycle, autoRenewal, deviceLimit } = req.body;
    const userId = req.user.id;

    const enrollment = await EnrollmentV2.findById(enrollmentId)
      .populate('courseId', 'title');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Verify ownership
    if (enrollment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Verify it's a subscription
    if (enrollment.enrollmentType !== 'subscription') {
      return res.status(400).json({
        success: false,
        message: 'Only subscription preferences can be updated'
      });
    }

    let updateFields = {};
    let requiresPaymentUpdate = false;

    // Update billing cycle
    if (billingCycle && billingCycle !== enrollment.subscription.billingCycle) {
      const validCycles = ['monthly', 'quarterly', 'yearly'];
      if (!validCycles.includes(billingCycle)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid billing cycle'
        });
      }
      updateFields['subscription.billingCycle'] = billingCycle;
      requiresPaymentUpdate = true;
    }

    // Update auto-renewal preference
    if (typeof autoRenewal === 'boolean') {
      updateFields['subscription.cancelAtPeriodEnd'] = !autoRenewal;
    }

    // Update device limit (within allowed range)
    if (deviceLimit) {
      const newDeviceLimit = parseInt(deviceLimit);
      if (newDeviceLimit < 1 || newDeviceLimit > 10) {
        return res.status(400).json({
          success: false,
          message: 'Device limit must be between 1 and 10'
        });
      }
      updateFields['subscription.deviceLimit'] = newDeviceLimit;
    }

    // Apply updates
    if (Object.keys(updateFields).length > 0) {
      await EnrollmentV2.updateOne(
        { _id: enrollmentId },
        { $set: updateFields }
      );

      // Add audit log
      await enrollment.addAuditLog({
        action: 'subscription_preferences_updated',
        details: updateFields,
        performedBy: userId,
        timestamp: new Date()
      });
    }

    // Get updated enrollment
    const updatedEnrollment = await EnrollmentV2.findById(enrollmentId)
      .populate('courseId', 'title');

    const responseData = {
      enrollmentId: enrollment._id,
      courseName: updatedEnrollment.courseId.title,
      preferences: {
        billingCycle: updatedEnrollment.subscription.billingCycle,
        autoRenewal: !updatedEnrollment.subscription.cancelAtPeriodEnd,
        deviceLimit: updatedEnrollment.subscription.deviceLimit
      },
      updated: Object.keys(updateFields)
    };

    if (requiresPaymentUpdate) {
      responseData.note = 'Billing cycle changes will take effect at next billing period';
    }

    res.status(200).json({
      success: true,
      message: 'Subscription preferences updated successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Update subscription preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subscription preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get subscription analytics for admin/guru
 * @route   GET /api/subscriptions/analytics
 * @access  Private (Admin/Guru)
 */
const getSubscriptionAnalytics = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    const { period = 'month', startDate, endDate, courseId } = req.query;

    // Build match stage for aggregation
    const matchStage = { enrollmentType: 'subscription' };
    
    // If guru, only show their courses
    if (userRole === 'guru') {
      const Course = require('../models/Course');
      const guruCourses = await Course.find({ 'instructor._id': userId }).select('_id');
      matchStage.courseId = { $in: guruCourses.map(c => c._id) };
    }

    // Filter by specific course if provided
    if (courseId) {
      matchStage.courseId = new mongoose.Types.ObjectId(courseId);
    }

    // Date filter
    if (startDate || endDate) {
      matchStage.enrollmentDate = {};
      if (startDate) matchStage.enrollmentDate.$gte = new Date(startDate);
      if (endDate) matchStage.enrollmentDate.$lte = new Date(endDate);
    }

    // Get subscription analytics
    const analytics = await EnrollmentV2.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSubscriptions: { $sum: 1 },
          activeSubscriptions: {
            $sum: {
              $cond: [{ $eq: ['$subscription.status', 'active'] }, 1, 0]
            }
          },
          trialSubscriptions: {
            $sum: {
              $cond: [{ $eq: ['$subscription.status', 'trialing'] }, 1, 0]
            }
          },
          pausedSubscriptions: {
            $sum: {
              $cond: [{ $eq: ['$subscription.status', 'paused'] }, 1, 0]
            }
          },
          cancelledSubscriptions: {
            $sum: {
              $cond: [{ $eq: ['$subscription.status', 'cancelled'] }, 1, 0]
            }
          },
          expiredSubscriptions: {
            $sum: {
              $cond: [{ $eq: ['$subscription.status', 'expired'] }, 1, 0]
            }
          },
          monthlySubscriptions: {
            $sum: {
              $cond: [{ $eq: ['$subscription.billingCycle', 'monthly'] }, 1, 0]
            }
          },
          quarterlySubscriptions: {
            $sum: {
              $cond: [{ $eq: ['$subscription.billingCycle', 'quarterly'] }, 1, 0]
            }
          },
          yearlySubscriptions: {
            $sum: {
              $cond: [{ $eq: ['$subscription.billingCycle', 'yearly'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Get churn analysis
    const churnAnalysis = await EnrollmentV2.aggregate([
      { $match: { ...matchStage, 'subscription.status': 'cancelled' } },
      {
        $group: {
          _id: '$subscription.cancelReason',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get subscription trends by period
    const periodGrouping = period === 'day' ? {
      year: { $year: '$enrollmentDate' },
      month: { $month: '$enrollmentDate' },
      day: { $dayOfMonth: '$enrollmentDate' }
    } : period === 'week' ? {
      year: { $year: '$enrollmentDate' },
      week: { $week: '$enrollmentDate' }
    } : {
      year: { $year: '$enrollmentDate' },
      month: { $month: '$enrollmentDate' }
    };

    const subscriptionTrends = await EnrollmentV2.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: periodGrouping,
          newSubscriptions: { $sum: 1 },
          trialConversions: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$subscription.status', 'active'] },
                  { $ne: ['$subscription.trialEnd', null] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Subscription analytics retrieved successfully',
      data: {
        summary: analytics[0] || {
          totalSubscriptions: 0,
          activeSubscriptions: 0,
          trialSubscriptions: 0,
          pausedSubscriptions: 0,
          cancelledSubscriptions: 0,
          expiredSubscriptions: 0,
          monthlySubscriptions: 0,
          quarterlySubscriptions: 0,
          yearlySubscriptions: 0
        },
        churnAnalysis,
        trends: subscriptionTrends,
        period,
        filters: { startDate, endDate, courseId }
      }
    });

  } catch (error) {
    console.error('Get subscription analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getMySubscriptions,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  renewSubscription,
  updateSubscriptionPreferences,
  getSubscriptionAnalytics
};
