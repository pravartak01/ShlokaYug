const express = require('express');

const router = express.Router();
const { body, param, validationResult } = require('express-validator');

// Import middleware
const { auth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Import controllers
const {
  createPaymentOrder,
  verifyPaymentSignature,
  handlePaymentWebhook,
  getPaymentStatus,
  processRefund,
} = require('../controllers/paymentController');

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  next();
};

// Validation for create payment order
const validateCreateOrder = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .isMongoId()
    .withMessage('Course ID must be a valid MongoDB ObjectId'),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })  // Changed from 0.01 to 0 to allow free courses
    .withMessage('Amount must be a positive number'),

  body('currency').optional().isIn(['INR', 'USD']).withMessage('Currency must be INR or USD'),

  body('enrollmentType')
    .optional()
    .isIn(['subscription', 'one_time'])
    .withMessage('Enrollment type must be subscription or one_time'),

  handleValidationErrors,
];

// Validation for verify payment
const validateVerifyPayment = [
  body('razorpay_order_id')
    .notEmpty()
    .withMessage('Razorpay order ID is required')
    .matches(/^order_[A-Za-z0-9]+$/)
    .withMessage('Invalid Razorpay order ID format'),

  body('razorpay_payment_id')
    .notEmpty()
    .withMessage('Razorpay payment ID is required')
    .matches(/^pay_[A-Za-z0-9]+$/)
    .withMessage('Invalid Razorpay payment ID format'),

  body('razorpay_signature')
    .notEmpty()
    .withMessage('Razorpay signature is required')
    .isLength({ min: 64, max: 128 })
    .withMessage('Invalid signature length'),

  handleValidationErrors,
];

// Validation for refund
const validateRefund = [
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Refund amount must be greater than 0'),

  body('reason')
    .notEmpty()
    .withMessage('Refund reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),

  handleValidationErrors,
];

// @desc    Create Razorpay order for payment
// @route   POST /api/payments/create-order
// @access  Private (Student only)
router.post(
  '/create-order',
  auth,  // Re-enabled - needed for proper user enrollment
  // checkRole(['student']),  // Disabled to allow any logged-in user
  ...validateCreateOrder,
  createPaymentOrder
);

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Private (Student only)
router.post(
  '/verify',
  auth,  // Re-enabled - needed for proper user enrollment
  // checkRole(['student']),  // Disabled to allow any logged-in user
  ...validateVerifyPayment,
  verifyPaymentSignature
);

// @desc    Handle Razorpay webhooks
// @route   POST /api/payments/webhook
// @access  Public (webhook endpoint)
router.post(
  '/webhook',
  // No auth middleware for webhooks
  express.raw({ type: 'application/json' }),
  handlePaymentWebhook
);

// @desc    Get payment status by transaction/payment/order ID
// @route   GET /api/payments/:id/status
// @access  Private
router.get(
  '/:id/status',
  auth,
  param('id').notEmpty().withMessage('Payment ID is required'),
  handleValidationErrors,
  getPaymentStatus
);

// @desc    Get available payment methods
// @route   GET /api/payments/methods
// @access  Private
router.get('/methods', auth, async (req, res) => {
  try {
    // Return supported payment methods
    const paymentMethods = {
      cards: ['visa', 'mastercard', 'rupay'],
      netbanking: ['sbi', 'hdfc', 'icici', 'axis'],
      wallets: ['paytm', 'mobikwik', 'phonepe', 'googlepay'],
      upi: ['upi'],
      emi: ['emi'],
    };

    res.status(200).json({
      success: true,
      message: 'Payment methods retrieved successfully',
      data: {
        methods: paymentMethods,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment methods',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @desc    Get subscription plans
// @route   GET /api/payments/subscription-plans
// @access  Private
router.get('/subscription-plans', auth, async (req, res) => {
  try {
    // Return available subscription plans
    const subscriptionPlans = [
      {
        id: 'monthly_basic',
        name: 'Monthly Basic',
        type: 'monthly',
        price: 299,
        currency: 'INR',
        features: ['Access to basic courses', 'Community access', 'Basic support'],
        duration: 30,
      },
      {
        id: 'yearly_premium',
        name: 'Yearly Premium',
        type: 'yearly',
        price: 2999,
        currency: 'INR',
        features: [
          'Access to all courses',
          'Priority support',
          'Advanced features',
          'Live sessions',
        ],
        duration: 365,
        discount: 17, // percentage discount from monthly
      },
    ];

    res.status(200).json({
      success: true,
      message: 'Subscription plans retrieved successfully',
      data: {
        plans: subscriptionPlans,
      },
    });
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription plans',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @desc    Get user's payment history
// @route   GET /api/payments/my-payments
// @access  Private (Student only)
router.get('/my-payments', auth, checkRole(['student']), async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, dateFrom, dateTo } = req.query;
    let payments = [];

    // Try to get from database first
    let PaymentTransaction;
    try {
      PaymentTransaction = require('../models/PaymentTransactionSimple');
    } catch (error) {
      PaymentTransaction = null;
    }

    if (PaymentTransaction) {
      try {
        const dbPayments = await PaymentTransaction.find({ userId })
          .sort({ createdAt: -1 })
          .limit(parseInt(limit))
          .skip((parseInt(page) - 1) * parseInt(limit));

        payments = dbPayments.map((payment) => ({
          id: payment._id,
          transactionId: payment.transactionId,
          status: payment.status,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          createdAt: payment.createdAt,
          completedAt: payment.completedAt,
        }));

        if (payments.length > 0) {
          console.log(`✓ Found ${payments.length} payments in database for user ${userId}`);
        }
      } catch (dbError) {
        console.warn('❌ Database query failed:', dbError.message);
      }
    }

    // Get from in-memory storage if database is empty or failed
    if (payments.length === 0 && global.testTransactions) {
      console.log('💾 Checking in-memory storage for payment history');
      const userTransactions = [];
      for (const [orderId, transaction] of global.testTransactions) {
        if (transaction.userId === userId) {
          userTransactions.push({
            id: orderId,
            transactionId: `TXN_${orderId.slice(-8)}`,
            status: transaction.status,
            amount: transaction.amount,
            paymentMethod: transaction.paymentMethod || 'razorpay',
            createdAt: transaction.createdAt || new Date(),
            completedAt: transaction.completedAt,
          });
        }
      }
      payments = userTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (payments.length > 0) {
        console.log(`✓ Found ${payments.length} payments in memory for user ${userId}`);
      }
    }

    const totalPayments = payments.length;
    const totalPages = Math.ceil(totalPayments / parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Payment history retrieved successfully',
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalPayments,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @desc    Get guru's revenue analytics
// @route   GET /api/payments/revenue-analytics
// @access  Private (Guru/Admin only)
router.get('/revenue-analytics', auth, checkRole(['guru', 'admin']), async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { period = 'month', startDate, endDate, courseId } = req.query;

    let PaymentTransaction;
    try {
      PaymentTransaction = require('../models/PaymentTransactionSimple');
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Payment analytics not available - database model not found',
      });
    }

    // Get revenue stats
    const revenueStats = await PaymentTransaction.getRevenueStats(
      userRole === 'guru' ? userId : null,
      period
    );

    // Get additional analytics
    const matchStage = { status: 'success' };
    if (userRole === 'guru') {
      matchStage.guruId = new require('mongoose').Types.ObjectId(userId);
    }
    if (courseId) {
      matchStage.courseId = new require('mongoose').Types.ObjectId(courseId);
    }
    if (startDate || endDate) {
      matchStage.completedAt = {};
      if (startDate) matchStage.completedAt.$gte = new Date(startDate);
      if (endDate) matchStage.completedAt.$lte = new Date(endDate);
    }

    const analytics = await PaymentTransaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount.total' },
          guruRevenue: { $sum: '$revenue.guruShare' },
          platformRevenue: { $sum: '$revenue.platformShare' },
          totalTransactions: { $sum: 1 },
          averageTransactionValue: { $avg: '$amount.total' },
          subscriptionRevenue: {
            $sum: {
              $cond: [{ $eq: ['$metadata.source', 'subscription_renewal'] }, '$amount.total', 0],
            },
          },
          oneTimeRevenue: {
            $sum: {
              $cond: [{ $ne: ['$metadata.source', 'subscription_renewal'] }, '$amount.total', 0],
            },
          },
        },
      },
    ]);

    // Get top performing courses
    const topCourses = await PaymentTransaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$courseId',
          revenue: { $sum: '$amount.total' },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course',
        },
      },
      {
        $project: {
          course: { $arrayElemAt: ['$course', 0] },
          revenue: 1,
          transactions: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: 'Revenue analytics retrieved successfully',
      data: {
        summary: analytics[0] || {
          totalRevenue: 0,
          guruRevenue: 0,
          platformRevenue: 0,
          totalTransactions: 0,
          averageTransactionValue: 0,
          subscriptionRevenue: 0,
          oneTimeRevenue: 0,
        },
        trends: revenueStats,
        topCourses,
        period,
        dateRange: { startDate, endDate },
      },
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @desc    Get pending revenue distributions
// @route   GET /api/payments/pending-distributions
// @access  Private (Admin only)
router.get('/pending-distributions', auth, checkRole(['admin']), async (req, res) => {
  try {
    let PaymentTransaction;
    try {
      PaymentTransaction = require('../models/PaymentTransactionSimple');
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Distribution data not available - database model not found',
      });
    }

    const pendingDistributions = await PaymentTransaction.findPendingDistributions();

    const distributionSummary = pendingDistributions.reduce(
      (acc, payment) => {
        acc.totalAmount += payment.amount.total;
        acc.totalGuruShare += payment.revenue.guruShare;
        acc.totalPlatformShare += payment.revenue.platformShare;
        acc.transactionCount += 1;
        return acc;
      },
      {
        totalAmount: 0,
        totalGuruShare: 0,
        totalPlatformShare: 0,
        transactionCount: 0,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Pending distributions retrieved successfully',
      data: {
        summary: distributionSummary,
        distributions: pendingDistributions.map((payment) => ({
          id: payment._id,
          transactionId: payment.transactionId,
          guru: payment.guruId,
          course: payment.courseId,
          amount: payment.amount,
          revenue: payment.revenue,
          completedAt: payment.completedAt,
        })),
      },
    });
  } catch (error) {
    console.error('Get pending distributions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending distributions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private (Admin/Guru for their courses)
router.post(
  '/:id/refund',
  auth,
  checkRole(['admin', 'guru']),
  param('id')
    .notEmpty()
    .withMessage('Payment ID is required')
    .isMongoId()
    .withMessage('Payment ID must be valid MongoDB ObjectId'),
  ...validateRefund,
  processRefund
);

// @desc    Mark revenue as distributed (admin function)
// @route   PATCH /api/payments/:id/distribute
// @access  Private (Admin only)
router.patch(
  '/:id/distribute',
  auth,
  checkRole(['admin']),
  param('id')
    .notEmpty()
    .withMessage('Payment ID is required')
    .isMongoId()
    .withMessage('Payment ID must be valid MongoDB ObjectId'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      let PaymentTransaction;
      try {
        PaymentTransaction = require('../models/PaymentTransactionSimple');
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Payment system not available - database model not found',
        });
      }
      const payment = await PaymentTransaction.findById(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment transaction not found',
        });
      }

      if (payment.status !== 'success') {
        return res.status(400).json({
          success: false,
          message: 'Can only distribute revenue for successful payments',
        });
      }

      if (payment.revenue.isDistributed) {
        return res.status(400).json({
          success: false,
          message: 'Revenue already distributed for this payment',
        });
      }

      payment.distributeRevenue();
      if (notes) {
        payment.addEvent('revenue_distributed', { notes, distributedBy: req.user.id });
      }
      await payment.save();

      res.status(200).json({
        success: true,
        message: 'Revenue marked as distributed',
        data: {
          transactionId: payment.transactionId,
          guruShare: payment.revenue.guruShare,
          platformShare: payment.revenue.platformShare,
          distributedAt: payment.revenue.distributedAt,
        },
      });
    } catch (error) {
      console.error('Mark distribution error:', error);
      res.status(500).json({
        success: false,
        message: 'Error marking revenue as distributed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

module.exports = router;
