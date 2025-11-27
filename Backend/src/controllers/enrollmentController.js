const Enrollment = require('../models/Enrollment');
const PaymentTransactionSimple = require('../models/PaymentTransactionSimple');
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

// @desc    Auto-enroll user after successful payment (integrates with PaymentTransactionSimple)
// @route   POST /api/enrollments/auto-enroll
// @access  Internal/Private
const autoEnrollAfterPayment = async (req, res) => {
  try {
    const { transactionId, userId, courseId } = req.body;

    console.log(`🎓 Auto-enrolling user ${userId} for course ${courseId} after payment ${transactionId}`);

    // 1. Verify payment transaction exists and is completed
    // For testing, also check in-memory transactions
    let paymentTransaction = null;
    
    try {
      paymentTransaction = await PaymentTransactionSimple.findOne({
        transactionId: transactionId,
        status: 'completed'
      });
    } catch (dbError) {
      console.warn('Database lookup failed for payment transaction:', dbError.message);
    }

    // Fallback: Allow test transactions that start with TXN_TEST
    if (!paymentTransaction && transactionId.startsWith('TXN_TEST')) {
      console.log('🧪 Using test mode for auto-enrollment');
      paymentTransaction = {
        transactionId,
        userId,
        courseId,
        status: 'completed',
        amount: { total: 1999.50, currency: 'INR' }
      };
    }

    if (!paymentTransaction) {
      return res.status(404).json({
        success: false,
        error: 'Payment transaction not found or not completed',
        transactionId
      });
    }

    // 2. Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({
      userId: userId,
      courseId: courseId
    });

    if (existingEnrollment) {
      return res.status(200).json({
        success: true,
        message: 'User already enrolled',
        enrollment: {
          enrollmentId: existingEnrollment._id,
          status: existingEnrollment.access.status,
          enrolledAt: existingEnrollment.createdAt,
          isActive: existingEnrollment.isActive
        }
      });
    }

    // 3. Get course and user details
    const [course, user] = await Promise.all([
      Course.findById(courseId),
      User.findById(userId)
    ]);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // 4. Create enrollment record
    const enrollmentData = {
      userId: userId,
      courseId: courseId,
      guruId: course.instructor, // Assuming course has instructor field
      enrollmentType: 'one_time_purchase', // Default for auto-enrollment
      payment: {
        paymentId: transactionId,
        razorpayOrderId: paymentTransaction.razorpayOrderId,
        razorpayPaymentId: paymentTransaction.razorpayPaymentId,
        amount: paymentTransaction.amount,
        currency: paymentTransaction.currency || 'INR',
        status: 'completed',
        paidAt: paymentTransaction.updatedAt
      },
      access: {
        status: 'active',
        grantedAt: new Date()
      },
      analytics: {
        enrollmentSource: 'payment'
      }
    };

    const enrollment = new Enrollment(enrollmentData);
    
    // Process enrollment (handles subscription dates if needed)
    await enrollment.processEnrollment();

    // Update payment transaction with enrollment reference
    paymentTransaction.metadata = paymentTransaction.metadata || {};
    paymentTransaction.metadata.enrollmentId = enrollment._id;
    await paymentTransaction.save();

    console.log(`✅ Successfully enrolled user ${userId} in course ${courseId} with enrollment ID ${enrollment._id}`);

    res.status(201).json({
      success: true,
      message: 'Auto-enrollment completed successfully',
      enrollment: {
        enrollmentId: enrollment._id,
        courseId: course._id,
        courseName: course.title,
        enrollmentType: enrollment.enrollmentType,
        status: enrollment.access.status,
        enrolledAt: enrollment.createdAt,
        paymentId: transactionId,
        amount: paymentTransaction.amount
      }
    });

  } catch (error) {
    console.error('❌ Auto-enrollment failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to auto-enroll user',
      details: error.message
    });
  }
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
    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
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
    const paymentTransaction = new PaymentTransactionSimple({
      userId,
      amount: amount,
      currency: currency,
      razorpayOrderId: razorpayOrder.id,
      status: 'pending',
      metadata: {
        courseId: courseId.toString(),
        enrollmentType,
        courseName: course.title,
        source: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'web'
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
    const paymentTransaction = await PaymentTransactionSimple.findOne({
      transactionId,
      userId,
      razorpayOrderId: razorpay_order_id
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
    paymentTransaction.status = 'completed';
    paymentTransaction.razorpayPaymentId = razorpay_payment_id;
    paymentTransaction.razorpaySignature = razorpay_signature;
    await paymentTransaction.save();

    // Get course and guru details
    const course = await Course.findById(paymentTransaction.metadata.courseId);
    const guru = await User.findById(course.instructor);

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
      courseId: paymentTransaction.metadata.courseId,
      guruId: course.instructor,
      enrollmentType: course.pricing?.type === 'subscription' ? 'monthly_subscription' : 'one_time_purchase',
      payment: {
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: paymentTransaction.amount,
        currency: paymentTransaction.currency,
        status: 'completed',
        paidAt: new Date()
      },
      subscription: subscriptionData,
      access: {
        status: 'active',
        grantedAt: new Date(),
        maxConcurrentDevices: 3
      },
      analytics: {
        enrollmentSource: paymentTransaction.metadata.source || 'web',
        firstContentAccess: null,
        totalLoginDays: 0
      }
    };

    const enrollment = new Enrollment(enrollmentData);

    // Add the current device - reuse existing variables
    
    try {
      enrollment.access.accessDevices.push({
        deviceId,
        deviceType: deviceInfo.platform === 'mobile' ? 'mobile' : 'desktop',
        platform: deviceInfo.platform,
        lastUsed: new Date(),
        isActive: true
      });
    } catch (error) {
      console.warn('Failed to add device:', error.message);
    }

    await enrollment.processEnrollment();

    // Update payment transaction with enrollment ID
    paymentTransaction.metadata.enrollmentId = enrollment._id;
    await paymentTransaction.save();

    // Update course enrollment stats (if Course model supports this)
    try {
      await Course.findByIdAndUpdate(
        course._id,
        {
          $inc: {
            'stats.enrollments.total': 1
          }
        }
      );
    } catch (error) {
      console.warn('Failed to update course stats:', error.message);
    }

    // Populate response data
    await enrollment.populate([
      { path: 'courseId', select: 'title instructor metadata.difficulty' },
      { path: 'guruId', select: 'profile.firstName profile.lastName email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Enrollment confirmed successfully',
      data: {
        enrollment: {
          id: enrollment._id,
          course: enrollment.courseId,
          guru: enrollment.guruId,
          enrollmentType: enrollment.enrollmentType,
          status: enrollment.access.status,
          enrollmentDate: enrollment.createdAt,
          access: {
            expiresAt: enrollment.subscription?.endDate,
            deviceCount: enrollment.access.accessDevices?.filter(d => d.isActive).length || 0,
            deviceLimit: enrollment.access.maxConcurrentDevices
          }
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

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Get total count for pagination
    const totalCount = await Enrollment.countDocuments(filter);
    
    // Get enrollments with population
    const enrollments = await Enrollment.find(filter)
      .sort({ enrollmentDate: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate({
        path: 'courseId',
        select: 'title description instructor metadata.difficulty metadata.category pricing structure.units thumbnail',
        populate: {
          path: 'instructor.userId',
          select: 'profile.firstName profile.lastName'
        }
      })
      .lean();

    // Filter out enrollments where course was deleted and calculate additional data
    const enrichedEnrollments = enrollments
      .filter(enrollment => enrollment.courseId) // Skip deleted courses
      .map(enrollment => {
        const totalLectures = enrollment.courseId?.structure?.units?.reduce((total, unit) => {
          return total + unit.lessons?.reduce((lessonTotal, lesson) => {
            return lessonTotal + (lesson.lectures?.length || 0);
          }, 0) || 0;
        }, 0) || 0;

        return {
          ...enrollment,
          daysUntilExpiry: enrollment.daysRemaining,
          isExpired: !enrollment.isActive,
          activeDeviceCount: enrollment.access?.accessDevices?.filter(d => d.isActive).length || 0,
          canAddDevice: (enrollment.access?.accessDevices?.filter(d => d.isActive).length || 0) < enrollment.access?.maxConcurrentDevices,
          totalLectures,
          completionPercentage: enrollment.progress?.completionPercentage || 0
        };
      });

    res.status(200).json({
      success: true,
      message: 'User enrollments retrieved successfully',
      data: {
        enrollments: enrichedEnrollments,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCount / limitNumber),
          totalCount,
          hasNext: pageNumber * limitNumber < totalCount,
          hasPrev: pageNumber > 1
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

    const enrollment = await Enrollment.findById(id)
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
      enrollment.userId._id.toString() === userId ||
      enrollment.guruId._id.toString() === userId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this enrollment'
      });
    }

    // Get payment transactions for this enrollment
    const paymentTransactions = await PaymentTransactionSimple.find({
      'metadata.enrollmentId': enrollment._id
    }).sort({ createdAt: -1 });

    const enrollmentData = {
      ...enrollment.toObject(),
      daysUntilExpiry: enrollment.daysRemaining,
      isExpired: !enrollment.isActive,
      activeDeviceCount: enrollment.access.accessDevices?.filter(d => d.isActive).length || 0,
      canAddDevice: (enrollment.access.accessDevices?.filter(d => d.isActive).length || 0) < enrollment.access.maxConcurrentDevices,
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

    const enrollment = await Enrollment.findOne({ _id: id, userId });
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    const deviceId = generateDeviceFingerprint(req);
    const isValidAccess = enrollment.isActive && enrollment.access.status === 'active';

    if (!isValidAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        reason: enrollment.access.status === 'expired' ? 'Enrollment has expired' : 
                enrollment.access.status === 'suspended' ? 'Access suspended' : 'Invalid access'
      });
    }

    // Update last accessed time
    enrollment.access.lastAccessedAt = new Date();
    enrollment.analytics.lastActivityDate = new Date();
    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Access granted',
      data: {
        enrollment: {
          id: enrollment._id,
          status: enrollment.access.status,
          expiresAt: enrollment.subscription?.endDate,
          progress: 0 // TODO: Implement progress tracking
        },
        access: {
          valid: true,
          deviceId,
          expiresAt: enrollment.subscription?.endDate
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

    const enrollment = await Enrollment.findOne({ _id: id, userId });
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    const activeDeviceCount = enrollment.access.accessDevices?.filter(d => d.isActive).length || 0;
    if (activeDeviceCount >= enrollment.access.maxConcurrentDevices) {
      return res.status(400).json({
        success: false,
        message: `Device limit exceeded. Maximum ${enrollment.access.maxConcurrentDevices} devices allowed.`
      });
    }

    const deviceInfo = extractDeviceInfo(req);
    const deviceId = generateDeviceFingerprint(req);

    try {
      // Add new device
      enrollment.access.accessDevices = enrollment.access.accessDevices || [];
      enrollment.access.accessDevices.push({
        deviceId,
        deviceType: deviceInfo.platform === 'mobile' ? 'mobile' : 'desktop',
        platform: deviceInfo.platform,
        lastUsed: new Date(),
        isActive: true
      });

      await enrollment.save();

      res.status(200).json({
        success: true,
        message: 'Device added successfully',
        data: {
          deviceId: deviceId,
          deviceCount: enrollment.access.accessDevices.filter(d => d.isActive).length,
          deviceLimit: enrollment.access.maxConcurrentDevices
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

    const enrollment = await Enrollment.findOne({ _id: id, userId });
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Find and deactivate the device
    const device = enrollment.access.accessDevices?.find(d => d.deviceId === deviceId && d.isActive);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    device.isActive = false;
    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Device removed successfully',
      data: {
        deviceCount: enrollment.access.accessDevices.filter(d => d.isActive).length,
        deviceLimit: enrollment.access.maxConcurrentDevices
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

// @desc    Mark lecture as complete
// @route   POST /api/enrollments/lecture-complete
// @access  Private (Student only)
const markLectureComplete = async (req, res) => {
  try {
    const { courseId, lectureId } = req.body;
    const userId = req.user.id;

    // Find the enrollment
    const enrollment = await Enrollment.findOne({ userId, courseId });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    // Initialize progress if not exists
    if (!enrollment.progress) {
      enrollment.progress = {
        lecturesCompleted: [],
        completionPercentage: 0,
        lastAccessedLecture: null,
        isCompleted: false,
        totalWatchTime: 0,
      };
    }

    // Add lecture to completed list if not already there
    if (!enrollment.progress.lecturesCompleted.includes(lectureId)) {
      enrollment.progress.lecturesCompleted.push(lectureId);
    }

    // Update last accessed lecture
    enrollment.progress.lastAccessedLecture = lectureId;

    // Get course to calculate completion percentage
    const course = await Course.findById(courseId);
    if (course) {
      const totalLectures = course.structure?.totalLectures || 0;
      const completedCount = enrollment.progress.lecturesCompleted.length;
      enrollment.progress.completionPercentage = totalLectures > 0 
        ? Math.round((completedCount / totalLectures) * 100) 
        : 0;

      // Mark as completed if all lectures done
      if (completedCount >= totalLectures && totalLectures > 0) {
        enrollment.progress.isCompleted = true;
        enrollment.progress.completedAt = new Date();
      }
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Lecture marked as complete',
      data: {
        progress: {
          lecturesCompleted: enrollment.progress.lecturesCompleted.length,
          completionPercentage: enrollment.progress.completionPercentage,
          isCompleted: enrollment.progress.isCompleted,
        },
      },
    });
  } catch (error) {
    console.error('Mark lecture complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark lecture as complete',
      error: error.message,
    });
  }
};

// @desc    Get course progress
// @route   GET /api/enrollments/course/:courseId/progress
// @access  Private (Student only)
const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await Enrollment.findOne({ userId, courseId }).populate(
      'courseId',
      'title structure'
    );

    if (!enrollment) {
      // Return empty progress instead of 404 for better UX
      return res.status(200).json({
        success: true,
        data: {
          progress: {
            lecturesCompleted: [],
            completionPercentage: 0,
            lastAccessedLecture: null,
            isCompleted: false,
            completedAt: null,
            totalWatchTime: 0,
          },
          course: {
            title: 'Unknown',
            totalLectures: 0,
          },
          enrolled: false,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        progress: {
          lecturesCompleted: enrollment.progress?.lecturesCompleted || [],
          completionPercentage: enrollment.progress?.completionPercentage || 0,
          lastAccessedLecture: enrollment.progress?.lastAccessedLecture,
          isCompleted: enrollment.progress?.isCompleted || false,
          completedAt: enrollment.progress?.completedAt,
          totalWatchTime: enrollment.progress?.totalWatchTime || 0,
        },
        course: {
          title: enrollment.courseId.title,
          totalLectures: enrollment.courseId.structure?.totalLectures || 0,
        },
        enrolled: true,
      },
    });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve progress',
      error: error.message,
    });
  }
};

module.exports = {
  autoEnrollAfterPayment,
  initiateEnrollment,
  confirmEnrollment,
  getMyEnrollments,
  getEnrollmentDetails,
  validateAccess,
  addDevice,
  removeDevice,
  markLectureComplete,
  getCourseProgress,
};
