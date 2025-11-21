const EnrollmentV2 = require('../models/EnrollmentEnhanced');
const PaymentTransaction = require('../models/PaymentTransaction');
const Course = require('../models/Course');
const User = require('../models/User');
const crypto = require('crypto');
const Razorpay = require('razorpay');

// Initialize Razorpay (will be configured in payment integration)
let razorpay = null;
try {
  if (process.env.RAZORPAY_KEY_ID && 
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_KEY_ID !== 'your-razorpay-key-id' &&
      process.env.RAZORPAY_KEY_SECRET !== 'your-razorpay-key-secret') {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } else {
    console.warn('Razorpay credentials not configured - payment features will be disabled');
  }
} catch (error) {
  console.warn('Failed to initialize Razorpay:', error.message);
}

// Utility function to generate device fingerprint
const generateDeviceFingerprint = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.ip || req.connection.remoteAddress;
  const acceptLanguage = req.headers['accept-language'] || '';
  
  return crypto
    .createHash('sha256')
    .update(userAgent + ip + acceptLanguage)
    .digest('hex')
    .substring(0, 16);
};

// Utility function to extract device info
const extractDeviceInfo = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  
  // Simple device detection (can be enhanced with a proper library)
  let platform = 'web';
  let os = 'unknown';
  let browser = 'unknown';
  
  if (/mobile/i.test(userAgent)) {
    platform = 'mobile';
  } else if (/tablet/i.test(userAgent)) {
    platform = 'tablet';
  }
  
  if (/windows/i.test(userAgent)) os = 'Windows';
  else if (/macintosh|mac os/i.test(userAgent)) os = 'macOS';
  else if (/linux/i.test(userAgent)) os = 'Linux';
  else if (/android/i.test(userAgent)) os = 'Android';
  else if (/ios|iphone|ipad/i.test(userAgent)) os = 'iOS';
  
  if (/chrome/i.test(userAgent)) browser = 'Chrome';
  else if (/firefox/i.test(userAgent)) browser = 'Firefox';
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari';
  else if (/edge/i.test(userAgent)) browser = 'Edge';
  
  return {
    platform,
    browser,
    os,
    userAgent,
    ipAddress: req.ip || req.connection.remoteAddress
  };
};

// @desc    Initiate enrollment process (create Razorpay order)
// @route   POST /api/enrollments/initiate
// @access  Private (Student only)
const initiateEnrollment = async (req, res) => {
  try {
    const { courseId, enrollmentType = 'one_time' } = req.body;
    const userId = req.user.id;

    // Validate course exists and is published
    const course = await Course.findById(courseId);
    if (!course || !course.availability?.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or not available for enrollment'
      });
    }

    // Check if user is already enrolled
    const existingEnrollment = await EnrollmentV2.findOne({ userId, courseId });
    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: 'User is already enrolled in this course',
        enrollmentId: existingEnrollment._id
      });
    }

    // Validate enrollment type against course pricing
    if (enrollmentType === 'subscription' && course.pricing.type !== 'subscription') {
      return res.status(400).json({
        success: false,
        message: 'Course does not support subscription enrollment'
      });
    }

    // Calculate pricing
    const amount = course.pricing.amount;
    const currency = course.pricing.currency || 'INR';

    // Check if Razorpay is initialized
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured. Please contact administrator.',
        error: 'Razorpay not initialized'
      });
    }

    // Create Razorpay order
    const orderOptions = {
      amount: amount * 100, // Razorpay expects amount in paisa
      currency: currency,
      receipt: `course_${courseId}_user_${userId}_${Date.now()}`,
      notes: {
        courseId: courseId.toString(),
        userId: userId.toString(),
        enrollmentType,
        courseName: course.title
      }
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // Create payment transaction record
    const deviceInfo = extractDeviceInfo(req);
    const paymentTransaction = new PaymentTransaction({
      enrollmentId: null, // Will be updated after enrollment creation
      userId,
      courseId,
      guruId: course.instructor.userId,
      razorpay: {
        orderId: razorpayOrder.id
      },
      amount: {
        total: amount,
        coursePrice: amount,
        currency
      },
      status: 'pending',
      deviceInfo,
      metadata: {
        source: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'web',
        sessionId: req.sessionID
      }
    });

    await paymentTransaction.save();

    res.status(200).json({
      success: true,
      message: 'Enrollment initiated successfully',
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        transactionId: paymentTransaction.transactionId,
        course: {
          id: course._id,
          title: course.title,
          instructor: course.instructor.name,
          pricing: course.pricing
        }
      }
    });

  } catch (error) {
    console.error('Enrollment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initiating enrollment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Confirm enrollment after successful payment
// @route   POST /api/enrollments/confirm
// @access  Private (Student only)
const confirmEnrollment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      transactionId
    } = req.body;

    const userId = req.user.id;

    // Find the payment transaction
    const paymentTransaction = await PaymentTransaction.findOne({
      transactionId,
      userId,
      'razorpay.orderId': razorpay_order_id
    });

    if (!paymentTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Payment transaction not found'
      });
    }

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      paymentTransaction.markFailed('Invalid signature', 'SIGNATURE_MISMATCH');
      await paymentTransaction.save();

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update payment transaction as successful
    paymentTransaction.markSuccess(razorpay_payment_id, razorpay_signature);
    await paymentTransaction.save();

    // Get course and guru details
    const course = await Course.findById(paymentTransaction.courseId);
    const guru = await User.findById(paymentTransaction.guruId);

    // Calculate subscription dates if applicable
    let subscriptionData = null;
    if (course.pricing.type === 'subscription') {
      const startDate = new Date();
      const endDate = new Date();
      
      if (course.pricing.subscriptionPeriod === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (course.pricing.subscriptionPeriod === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
      
      subscriptionData = {
        startDate,
        endDate,
        status: 'active',
        renewalDate: endDate,
        autoRenew: true,
        billingCycle: course.pricing.subscriptionPeriod
      };
    }

    // Create enrollment record
    const deviceInfo = extractDeviceInfo(req);
    const deviceId = generateDeviceFingerprint(req);

    const enrollmentData = {
      userId,
      courseId: paymentTransaction.courseId,
      guruId: paymentTransaction.guruId,
      enrollmentType: course.pricing.type === 'subscription' ? 'subscription' : 'one_time',
      payment: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: paymentTransaction.amount.total,
        currency: paymentTransaction.amount.currency,
        status: 'completed',
        paymentMethod: 'razorpay', // Will be updated from webhook
        razorpaySignature: razorpay_signature,
        paymentDate: new Date()
      },
      subscription: subscriptionData,
      access: {
        deviceLimit: 3,
        currentDevices: [],
        expiresAt: subscriptionData?.endDate || null,
        isActive: true
      },
      progress: {
        overallProgress: 0,
        completedLectures: [],
        totalTimeSpent: 0,
        lastAccessed: new Date(),
        certificateEligible: false
      },
      status: 'active',
      metadata: {
        source: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'web'
      }
    };

    const enrollment = new EnrollmentV2(enrollmentData);

    // Add the current device
    EnrollmentV2.addDevice({
      deviceId,
      ...deviceInfo
    });

    // Add audit log
    EnrollmentV2.addAuditLog('created', userId, {
      paymentId: razorpay_payment_id,
      amount: paymentTransaction.amount.total
    }, deviceInfo.ipAddress);

    await EnrollmentV2.save();

    // Update payment transaction with enrollment ID
    paymentTransaction.enrollmentId = EnrollmentV2._id;
    await paymentTransaction.save();

    // Update course enrollment stats
    await Course.findByIdAndUpdate(
      course._id,
      {
        $inc: {
          'stats.EnrollmentV2.total': 1
        }
      }
    );

    // Populate response data
    await EnrollmentV2.populate([
      { path: 'courseId', select: 'title instructor metadata.difficulty' },
      { path: 'guruId', select: 'profile.firstName profile.lastName email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Enrollment confirmed successfully',
      data: {
        enrollment: {
          id: EnrollmentV2._id,
          course: EnrollmentV2.courseId,
          guru: EnrollmentV2.guruId,
          enrollmentType: EnrollmentV2.enrollmentType,
          status: EnrollmentV2.status,
          enrollmentDate: EnrollmentV2.enrollmentDate,
          access: {
            expiresAt: EnrollmentV2.access.expiresAt,
            deviceCount: EnrollmentV2.activeDeviceCount,
            deviceLimit: EnrollmentV2.access.deviceLimit
          },
          progress: EnrollmentV2.progress
        },
        paymentTransaction: {
          id: paymentTransaction._id,
          transactionId: paymentTransaction.transactionId,
          amount: paymentTransaction.amount,
          status: paymentTransaction.status
        }
      }
    });

  } catch (error) {
    console.error('Enrollment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming enrollment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user's enrollments
// @route   GET /api/enrollments/my-enrollments
// @access  Private (Student only)
const getMyEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { userId };
    if (status) filter.status = status;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { enrollmentDate: -1 },
      populate: [
        {
          path: 'courseId',
          select: 'title description instructor metadata.difficulty metadata.category pricing structure.units',
          populate: {
            path: 'instructor.userId',
            select: 'profile.firstName profile.lastName'
          }
        }
      ]
    };

    const enrollments = await EnrollmentV2.paginate(filter, options);

    // Calculate additional data for each enrollment
    const enrichedEnrollments = enrollments.docs.map(enrollment => {
      const totalLectures = EnrollmentV2.courseId?.structure?.units?.reduce((total, unit) => {
        return total + unit.lessons?.reduce((lessonTotal, lesson) => {
          return lessonTotal + (lesson.lectures?.length || 0);
        }, 0) || 0;
      }, 0) || 0;

      return {
        ...EnrollmentV2.toObject(),
        daysUntilExpiry: EnrollmentV2.daysUntilExpiry,
        isExpired: EnrollmentV2.isExpired,
        activeDeviceCount: EnrollmentV2.activeDeviceCount,
        canAddDevice: EnrollmentV2.canAddDevice,
        totalLectures,
        completionPercentage: totalLectures > 0 
          ? Math.round((EnrollmentV2.progress.completedLectures.length / totalLectures) * 100)
          : 0
      };
    });

    res.status(200).json({
      success: true,
      message: 'Enrollments retrieved successfully',
      data: {
        enrollments: enrichedEnrollments,
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
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enrollments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get specific enrollment details
// @route   GET /api/enrollments/:id
// @access  Private (Student/Guru/Admin)
const getEnrollmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const enrollment = await EnrollmentV2.findById(id)
      .populate('courseId', 'title description instructor metadata pricing structure')
      .populate('guruId', 'profile.firstName profile.lastName email profile.guruProfile')
      .populate('userId', 'profile.firstName profile.lastName email');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check access permissions
    const hasAccess = 
      userRole === 'admin' ||
      EnrollmentV2.userId._id.toString() === userId ||
      EnrollmentV2.guruId._id.toString() === userId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this enrollment'
      });
    }

    // Get payment transactions for this enrollment
    const paymentTransactions = await PaymentTransaction.find({
      enrollmentId: EnrollmentV2._id
    }).sort({ createdAt: -1 });

    const enrollmentData = {
      ...EnrollmentV2.toObject(),
      daysUntilExpiry: EnrollmentV2.daysUntilExpiry,
      isExpired: EnrollmentV2.isExpired,
      activeDeviceCount: EnrollmentV2.activeDeviceCount,
      canAddDevice: EnrollmentV2.canAddDevice,
      paymentHistory: paymentTransactions
    };

    res.status(200).json({
      success: true,
      message: 'Enrollment details retrieved successfully',
      data: { enrollment: enrollmentData }
    });

  } catch (error) {
    console.error('Get enrollment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enrollment details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Validate access from device
// @route   POST /api/enrollments/:id/validate
// @access  Private (Student only)
const validateAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const enrollment = await EnrollmentV2.findOne({ _id: id, userId });
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    const deviceId = generateDeviceFingerprint(req);
    const accessValidation = EnrollmentV2.validateAccess(deviceId);

    if (!accessValidation.valid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        reason: accessValidation.reason
      });
    }

    // Update last accessed time
    EnrollmentV2.progress.lastAccessed = new Date();
    await EnrollmentV2.save();

    res.status(200).json({
      success: true,
      message: 'Access granted',
      data: {
        enrollment: {
          id: EnrollmentV2._id,
          status: EnrollmentV2.status,
          expiresAt: EnrollmentV2.access.expiresAt,
          progress: EnrollmentV2.progress.overallProgress
        },
        access: {
          valid: true,
          deviceId,
          expiresAt: EnrollmentV2.access.expiresAt
        }
      }
    });

  } catch (error) {
    console.error('Access validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating access',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add new device to enrollment
// @route   POST /api/enrollments/:id/devices
// @access  Private (Student only)
const addDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const enrollment = await EnrollmentV2.findOne({ _id: id, userId });
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    if (!EnrollmentV2.canAddDevice) {
      return res.status(400).json({
        success: false,
        message: `Device limit exceeded. Maximum ${EnrollmentV2.access.deviceLimit} devices allowed.`
      });
    }

    const deviceInfo = extractDeviceInfo(req);
    const deviceId = generateDeviceFingerprint(req);

    try {
      const newDevice = EnrollmentV2.addDevice({ deviceId, ...deviceInfo });
      
      // Add audit log
      EnrollmentV2.addAuditLog('device_added', userId, {
        deviceId,
        platform: deviceInfo.platform,
        browser: deviceInfo.browser
      }, deviceInfo.ipAddress);

      await EnrollmentV2.save();

      res.status(200).json({
        success: true,
        message: 'Device added successfully',
        data: {
          device: newDevice,
          deviceCount: EnrollmentV2.activeDeviceCount,
          deviceLimit: EnrollmentV2.access.deviceLimit
        }
      });

    } catch (deviceError) {
      res.status(400).json({
        success: false,
        message: deviceError.message
      });
    }

  } catch (error) {
    console.error('Add device error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding device',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Remove device from enrollment
// @route   DELETE /api/enrollments/:id/devices/:deviceId
// @access  Private (Student only)
const removeDevice = async (req, res) => {
  try {
    const { id, deviceId } = req.params;
    const userId = req.user.id;

    const enrollment = await EnrollmentV2.findOne({ _id: id, userId });
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    const deviceRemoved = EnrollmentV2.removeDevice(deviceId);

    if (!deviceRemoved) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    // Add audit log
    EnrollmentV2.addAuditLog('device_removed', userId, { deviceId }, req.ip);

    await EnrollmentV2.save();

    res.status(200).json({
      success: true,
      message: 'Device removed successfully',
      data: {
        deviceCount: EnrollmentV2.activeDeviceCount,
        deviceLimit: EnrollmentV2.access.deviceLimit
      }
    });

  } catch (error) {
    console.error('Remove device error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing device',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  initiateEnrollment,
  confirmEnrollment,
  getMyEnrollments,
  getEnrollmentDetails,
  validateAccess,
  addDevice,
  removeDevice
};
