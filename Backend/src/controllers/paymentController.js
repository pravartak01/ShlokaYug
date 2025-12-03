const crypto = require('crypto');
const axios = require('axios');

// Helper function to trigger auto-enrollment after successful payment
const triggerAutoEnrollment = async (paymentTransaction) => {
  try {
    console.log('🎓 Starting auto-enrollment for transaction:', paymentTransaction.transactionId);
    
    // Prepare auto-enrollment data
    const enrollmentData = {
      transactionId: paymentTransaction.transactionId,
      userId: paymentTransaction.userId,
      courseId: paymentTransaction.metadata?.courseId || paymentTransaction.courseId
    };

    console.log('🎓 Enrollment data:', JSON.stringify(enrollmentData, null, 2));

    // Check if enrollment already exists
    const Enrollment = require('../models/Enrollment');
    const existingEnrollment = await Enrollment.findOne({
      userId: enrollmentData.userId,
      courseId: enrollmentData.courseId
    });

    if (existingEnrollment) {
      console.log('✅ Enrollment already exists:', existingEnrollment._id);
      return { success: true, enrollment: existingEnrollment };
    }

    // Create new enrollment
    const Course = require('../models/Course');
    const course = await Course.findById(enrollmentData.courseId);
    
    if (!course) {
      throw new Error('Course not found for enrollment');
    }

    const newEnrollment = new Enrollment({
      userId: enrollmentData.userId,
      courseId: enrollmentData.courseId,
      guruId: course.instructor?.userId || course.instructor,
      enrollmentType: 'one_time_purchase',
      payment: {
        paymentId: paymentTransaction.razorpayPaymentId || paymentTransaction.razorpay?.paymentId,
        razorpayOrderId: paymentTransaction.razorpay?.orderId || paymentTransaction.razorpayOrderId,
        razorpayPaymentId: paymentTransaction.razorpayPaymentId,
        razorpaySignature: paymentTransaction.razorpaySignature,
        amount: paymentTransaction.amount?.total || paymentTransaction.amount,
        currency: paymentTransaction.amount?.currency || 'INR',
        status: 'completed',
        paidAt: new Date()
      },
      access: {
        status: 'active',
        grantedAt: new Date()
      },
      analytics: {
        enrollmentSource: 'mobile_app'
      }
    });

    await newEnrollment.save();
    console.log('✅ Auto-enrollment successful:', newEnrollment._id);
    
    return { success: true, enrollment: newEnrollment };
    
  } catch (error) {
    console.error('❌ Auto-enrollment failed:', error);
    console.error('Stack:', error.stack);
    throw error;
  }
};
const Razorpay = require('razorpay');

// Use simplified model for development/testing
let PaymentTransaction;
try {
  PaymentTransaction = require('../models/PaymentTransactionSimple');
  console.log('Using simplified PaymentTransaction model for development');
} catch (error) {
  console.warn('PaymentTransaction model not available, using fallback');
  PaymentTransaction = null;
}

const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order for enrollment
// @route   POST /api/payments/create-order
// @access  Private (Student only)
const createPaymentOrder = async (req, res) => {
  try {
    const { courseId, amount, currency = 'INR', enrollmentType = 'one_time' } = req.body;
    // Get userId from request if authenticated, otherwise use a test user ID
    const userId = req.user?.id || 'test_user_' + Date.now();

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment amount is required'
      });
    }

    // Validate Razorpay configuration
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials missing in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Payment service configuration error'
      });
    }

    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paisa and ensure integer
      currency: currency.toUpperCase(),
      receipt: `c_${courseId.slice(-8)}_u_${userId.slice(-8)}_${Date.now().toString().slice(-8)}`, // Keep under 40 chars
      notes: {
        courseId: courseId.toString(),
        userId: userId.toString(),
        enrollmentType,
        timestamp: new Date().toISOString()
      }
    };

    console.log('Creating Razorpay order with options:', orderOptions);
    const razorpayOrder = await razorpay.orders.create(orderOptions);
    
    // Create payment transaction record with proper error handling
    const transactionData = {
      userId: userId,
      courseId: courseId,
      guruId: userId, // For test purposes, using same user
      razorpay: {
        orderId: razorpayOrder.id
      },
      amount: {
        total: amount,
        coursePrice: amount,
        currency: currency.toUpperCase()
      },
      status: 'pending',
      metadata: {
        source: 'api',
        enrollmentType,
        sessionId: `session_${Date.now()}`
      }
    };
    
    // Store transaction data for test/development - both in memory and database
    global.testTransactions = global.testTransactions || new Map();
    global.testTransactions.set(razorpayOrder.id, transactionData);
    console.log('✓ Transaction stored in memory:', razorpayOrder.id);
    
    // Try to save to database
    let savedTransaction = null;
    if (PaymentTransaction) {
      try {
        savedTransaction = new PaymentTransaction(transactionData);
        savedTransaction.addEvent('transaction_created', {
          razorpayOrderId: razorpayOrder.id,
          amount: amount,
          currency: currency
        });
        await savedTransaction.save();
        console.log('✓ Payment transaction saved to database:', savedTransaction.transactionId);
      } catch (dbError) {
        console.warn('❌ Database save failed:', dbError.message);
        console.log('💾 Using in-memory storage as fallback');
      }
    } else {
      console.log('💾 PaymentTransaction model not available, using in-memory storage only');
    }

    res.status(200).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: razorpayOrder.status,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
      }
    });

  } catch (error) {
    console.error('Create payment order error:', error);
    
    // Provide more specific error messages
    if (error.error && error.error.code) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay error: ' + error.error.description,
        razorpayError: {
          code: error.error.code,
          description: error.error.description
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Private (Student only)
const verifyPaymentSignature = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      courseId // Extract courseId from request
    } = req.body;

    // Get userId from authenticated request
    const userId = req.user?.id;
    
    console.log('🔐 Verifying payment for course:', courseId);
    console.log('🔐 Order ID:', razorpay_order_id);
    console.log('🔐 Payment ID:', razorpay_payment_id);
    console.log('🔐 User ID:', userId);

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
        data: {
          verified: false
        }
      });
    }

    console.log('✅ Payment signature verified successfully');

    // Track if enrollment was created
    let enrollmentCreated = false;

    // Update transaction status on successful verification
    if (global.testTransactions && global.testTransactions.has(razorpay_order_id)) {
      const transaction = global.testTransactions.get(razorpay_order_id);
      transaction.status = 'success';
      transaction.completedAt = new Date();
      transaction.razorpay.paymentId = razorpay_payment_id;
      transaction.paymentMethod = 'razorpay';
      // Update courseId if provided
      if (courseId && !transaction.courseId) {
        transaction.courseId = courseId;
        transaction.metadata = transaction.metadata || {};
        transaction.metadata.courseId = courseId;
      }
      global.testTransactions.set(razorpay_order_id, transaction);
      console.log('✓ Payment verified and updated in memory storage');
    }
    
    // Try to save/update in database
    if (PaymentTransaction) {
      try {
        let paymentTransaction = await PaymentTransaction.findOne({
          'razorpay.orderId': razorpay_order_id
        });
        
        if (paymentTransaction) {
          // Update existing transaction
          paymentTransaction.markSuccess(razorpay_payment_id, razorpay_signature);
          await paymentTransaction.save();
          console.log('✓ Payment verification updated in database:', paymentTransaction.transactionId);
          
          // Trigger auto-enrollment after successful payment
          await triggerAutoEnrollment(paymentTransaction);
          enrollmentCreated = true;
        } else {
          // Find by transactionId for PaymentTransactionSimple
          paymentTransaction = await PaymentTransaction.findOne({
            transactionId: { $regex: razorpay_order_id }
          });
          
          if (paymentTransaction) {
            paymentTransaction.status = 'completed';
            paymentTransaction.razorpayPaymentId = razorpay_payment_id;
            paymentTransaction.razorpaySignature = razorpay_signature;
            
            // Update courseId if provided and not already set
            if (courseId) {
              if (!paymentTransaction.courseId) {
                paymentTransaction.courseId = courseId;
              }
              if (!paymentTransaction.metadata) {
                paymentTransaction.metadata = {};
              }
              if (!paymentTransaction.metadata.courseId) {
                paymentTransaction.metadata.courseId = courseId;
              }
              console.log('✓ Updated courseId in transaction:', courseId);
            }
            
            await paymentTransaction.save();
            console.log('✓ PaymentTransactionSimple updated:', paymentTransaction.transactionId);
            console.log('✓ Transaction courseId:', paymentTransaction.courseId || paymentTransaction.metadata?.courseId);
            
            // Trigger auto-enrollment after successful payment
            try {
              await triggerAutoEnrollment(paymentTransaction);
              console.log('✅ Auto-enrollment triggered for transaction:', paymentTransaction.transactionId);
              enrollmentCreated = true;
            } catch (enrollmentError) {
              console.warn('❌ Auto-enrollment failed:', enrollmentError.message);
              console.error('❌ Stack:', enrollmentError.stack);
              // Don't fail the payment verification if enrollment fails
            }
          } else {
            console.warn('PaymentTransactionSimple not found for order:', razorpay_order_id);
          }
        }
      } catch (dbError) {
        console.warn('❌ Database update failed:', dbError.message);
        console.log('💾 Payment verification tracked in memory only');
      }
    }

    // FALLBACK: If enrollment wasn't created but we have userId and courseId, create it directly
    if (!enrollmentCreated && userId && courseId) {
      console.log('🔄 Creating fallback enrollment for user:', userId, 'course:', courseId);
      try {
        const Enrollment = require('../models/Enrollment');
        const Course = require('../models/Course');
        
        // Check if enrollment already exists
        const existingEnrollment = await Enrollment.findOne({ userId, courseId });
        if (existingEnrollment) {
          console.log('✅ Enrollment already exists:', existingEnrollment._id);
          enrollmentCreated = true;
        } else {
          // Get course details
          const course = await Course.findById(courseId);
          if (course) {
            const newEnrollment = new Enrollment({
              userId: userId,
              courseId: courseId,
              guruId: course.instructor?.userId || course.instructor,
              enrollmentType: 'one_time_purchase',
              payment: {
                paymentId: razorpay_payment_id,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                amount: course.pricing?.oneTime?.amount || 0,
                currency: 'INR',
                status: 'completed',
                paidAt: new Date()
              },
              access: {
                status: 'active',
                grantedAt: new Date()
              },
              analytics: {
                enrollmentSource: 'mobile_app'
              }
            });
            
            await newEnrollment.save();
            console.log('✅ Fallback enrollment created successfully:', newEnrollment._id);
            enrollmentCreated = true;
          } else {
            console.error('❌ Course not found for fallback enrollment:', courseId);
          }
        }
      } catch (fallbackError) {
        console.error('❌ Fallback enrollment creation failed:', fallbackError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment signature verified successfully',
      data: {
        verified: true,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        enrollmentCreated: enrollmentCreated
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Handle Razorpay webhooks
// @route   POST /api/payments/webhook
// @access  Public (webhook endpoint)
const handlePaymentWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      console.warn('Invalid webhook signature:', webhookSignature);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid webhook signature' 
      });
    }

    const { event, payload } = req.body;
    console.log('Received webhook event:', event);

    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity);
        break;
        
      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
        break;
        
      case 'order.paid':
        await handleOrderPaid(payload.order.entity);
        break;
        
      case 'subscription.charged':
        await handleSubscriptionCharged(payload.subscription.entity, payload.payment.entity);
        break;
        
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload.subscription.entity);
        break;
        
      case 'refund.created':
        await handleRefundCreated(payload.refund.entity);
        break;
        
      default:
        console.log('Unhandled webhook event:', event);
    }

    res.status(200).json({ success: true, message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Handle payment captured event
const handlePaymentCaptured = async (payment) => {
  try {
    console.log('Processing payment captured:', payment.id);

    // Find payment transaction
    const paymentTransaction = await PaymentTransaction.findOne({
      'razorpay.orderId': payment.order_id
    });

    if (!paymentTransaction) {
      console.warn('Payment transaction not found for order:', payment.order_id);
      return;
    }

    // Update payment transaction
    paymentTransaction.razorpay.paymentId = payment.id;
    paymentTransaction.status = 'success';
    paymentTransaction.completedAt = new Date();
    paymentTransaction.paymentMethod = payment.method;
    
    // Extract payment details
    if (payment.card) {
      paymentTransaction.paymentDetails = {
        cardType: payment.card.network,
        cardLast4: payment.card.last4
      };
    } else if (payment.bank) {
      paymentTransaction.paymentDetails = {
        bankName: payment.bank
      };
    } else if (payment.wallet) {
      paymentTransaction.paymentDetails = {
        walletProvider: payment.wallet
      };
    } else if (payment.vpa) {
      paymentTransaction.paymentDetails = {
        upiVpa: payment.vpa
      };
    }

    paymentTransaction.addEvent('payment_captured', payment, 'webhook');
    await paymentTransaction.save();

    // Update enrollment if exists
    if (paymentTransaction.enrollmentId) {
      const enrollment = await Enrollment.findById(paymentTransaction.enrollmentId);
      if (enrollment) {
        enrollment.payment.status = 'completed';
        enrollment.payment.paymentMethod = payment.method;
        enrollment.addAuditLog('payment_completed', enrollment.userId, {
          paymentId: payment.id,
          amount: payment.amount / 100
        });
        await enrollment.save();
      }
    }

    console.log('Payment captured processed successfully:', payment.id);

  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
};

// Handle payment failed event
const handlePaymentFailed = async (payment) => {
  try {
    console.log('Processing payment failed:', payment.id);

    // Find payment transaction
    const paymentTransaction = await PaymentTransaction.findOne({
      'razorpay.orderId': payment.order_id
    });

    if (!paymentTransaction) {
      console.warn('Payment transaction not found for order:', payment.order_id);
      return;
    }

    // Update payment transaction
    paymentTransaction.status = 'failed';
    paymentTransaction.failedAt = new Date();
    paymentTransaction.addEvent('payment_failed', {
      errorCode: payment.error_code,
      errorDescription: payment.error_description,
      errorSource: payment.error_source,
      errorStep: payment.error_step,
      errorReason: payment.error_reason
    }, 'webhook');

    await paymentTransaction.save();

    console.log('Payment failed processed successfully:', payment.id);

  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
};

// Handle order paid event
const handleOrderPaid = async (order) => {
  try {
    console.log('Processing order paid:', order.id);

    // Update all payment transactions for this order
    await PaymentTransaction.updateMany(
      { 'razorpay.orderId': order.id },
      { 
        $set: { 
          status: 'success',
          completedAt: new Date()
        },
        $push: {
          events: {
            event: 'order_paid',
            timestamp: new Date(),
            details: order,
            source: 'webhook'
          }
        }
      }
    );

    console.log('Order paid processed successfully:', order.id);

  } catch (error) {
    console.error('Error handling order paid:', error);
  }
};

// Handle subscription charged event
const handleSubscriptionCharged = async (subscription, payment) => {
  try {
    console.log('Processing subscription charged:', subscription.id);

    // Find enrollment by subscription data
    const enrollment = await Enrollment.findOne({
      'payment.paymentId': { $in: [subscription.id, payment.id] }
    });

    if (!enrollment) {
      console.warn('Enrollment not found for subscription:', subscription.id);
      return;
    }

    // Create new payment transaction for renewal
    const renewalTransaction = new PaymentTransaction({
      enrollmentId: enrollment._id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      guruId: enrollment.guruId,
      razorpay: {
        orderId: payment.order_id || `sub_${subscription.id}_${Date.now()}`,
        paymentId: payment.id
      },
      amount: {
        total: payment.amount / 100,
        coursePrice: payment.amount / 100,
        currency: payment.currency.toUpperCase()
      },
      status: 'success',
      paymentMethod: payment.method || 'subscription',
      completedAt: new Date(),
      metadata: {
        source: 'subscription_renewal',
        subscriptionId: subscription.id
      }
    });

    renewalTransaction.addEvent('subscription_charged', { subscription, payment }, 'webhook');
    await renewalTransaction.save();

    // Update enrollment subscription
    if (enrollment.subscription) {
      const currentEndDate = new Date(enrollment.subscription.endDate);
      let newEndDate = new Date(currentEndDate);

      if (enrollment.subscription.billingCycle === 'monthly') {
        newEndDate.setMonth(newEndDate.getMonth() + 1);
      } else if (enrollment.subscription.billingCycle === 'yearly') {
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
      }

      enrollment.subscription.endDate = newEndDate;
      enrollment.subscription.renewalDate = newEndDate;
      enrollment.subscription.status = 'active';
      enrollment.access.expiresAt = newEndDate;
      enrollment.access.isActive = true;
      enrollment.status = 'active';

      enrollment.addAuditLog('subscription_renewed', enrollment.userId, {
        subscriptionId: subscription.id,
        newEndDate,
        amount: payment.amount / 100
      });

      await enrollment.save();
    }

    console.log('Subscription charged processed successfully:', subscription.id);

  } catch (error) {
    console.error('Error handling subscription charged:', error);
  }
};

// Handle subscription cancelled event
const handleSubscriptionCancelled = async (subscription) => {
  try {
    console.log('Processing subscription cancelled:', subscription.id);

    // Find enrollments with this subscription
    const enrollments = await Enrollment.find({
      'metadata.subscriptionId': subscription.id
    });

    for (const enrollment of enrollments) {
      enrollment.subscription.status = 'cancelled';
      enrollment.subscription.autoRenew = false;
      // Don't immediately deactivate - let it expire naturally
      enrollment.addAuditLog('subscription_cancelled', enrollment.userId, {
        subscriptionId: subscription.id,
        cancelledAt: new Date()
      });
      await enrollment.save();
    }

    console.log('Subscription cancelled processed successfully:', subscription.id);

  } catch (error) {
    console.error('Error handling subscription cancelled:', error);
  }
};

// Handle refund created event
const handleRefundCreated = async (refund) => {
  try {
    console.log('Processing refund created:', refund.id);

    // Find payment transaction
    const paymentTransaction = await PaymentTransaction.findOne({
      'razorpay.paymentId': refund.payment_id
    });

    if (!paymentTransaction) {
      console.warn('Payment transaction not found for refund:', refund.payment_id);
      return;
    }

    // Update payment transaction with refund information
    const refundAmount = refund.amount / 100;
    paymentTransaction.processRefund(
      refundAmount,
      'Refund processed via Razorpay',
      null // System processed
    );

    paymentTransaction.refund.refundTransactionId = refund.id;
    paymentTransaction.addEvent('refund_created', refund, 'webhook');
    await paymentTransaction.save();

    // Update enrollment status if fully refunded
    if (paymentTransaction.enrollmentId && refundAmount >= paymentTransaction.amount.total) {
      const enrollment = await Enrollment.findById(paymentTransaction.enrollmentId);
      if (enrollment) {
        enrollment.status = 'cancelled';
        enrollment.access.isActive = false;
        enrollment.addAuditLog('enrollment_cancelled', enrollment.userId, {
          reason: 'Full refund processed',
          refundAmount,
          refundId: refund.id
        });
        await enrollment.save();
      }
    }

    console.log('Refund created processed successfully:', refund.id);

  } catch (error) {
    console.error('Error handling refund created:', error);
  }
};

// @desc    Get payment status
// @route   GET /api/payments/:id/status
// @access  Private
const getPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    let paymentTransaction = null;

    // First try to find in database
    if (PaymentTransaction) {
      try {
        paymentTransaction = await PaymentTransaction.findOne({
          $or: [
            { transactionId: id },
            { 'razorpay.paymentId': id },
            { 'razorpay.orderId': id }
          ],
          userId
        }).populate('enrollmentId courseId', 'title status access.expiresAt');
        
        if (paymentTransaction) {
          console.log('✓ Payment transaction found in database:', paymentTransaction.transactionId);
        }
      } catch (dbError) {
        console.warn('❌ Database lookup failed:', dbError.message);
      }
    }

    // If not found in database, check in-memory storage (for test environment)
    if (!paymentTransaction && global.testTransactions) {
      const memoryTransaction = global.testTransactions.get(id);
      if (memoryTransaction && memoryTransaction.userId === userId) {
        paymentTransaction = {
          _id: id,
          transactionId: `TXN_${id.slice(-8)}`,
          status: memoryTransaction.status,
          amount: memoryTransaction.amount,
          paymentMethod: memoryTransaction.paymentMethod || 'razorpay',
          createdAt: memoryTransaction.createdAt,
          completedAt: memoryTransaction.completedAt,
          failedAt: memoryTransaction.failedAt,
          razorpay: memoryTransaction.razorpay,
          refund: { isRefunded: false }
        };
      }
    }

    if (!paymentTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Payment transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment status retrieved successfully',
      data: {
        transaction: {
          id: paymentTransaction._id,
          transactionId: paymentTransaction.transactionId,
          status: paymentTransaction.status,
          amount: paymentTransaction.amount,
          paymentMethod: paymentTransaction.paymentMethod,
          createdAt: paymentTransaction.createdAt,
          completedAt: paymentTransaction.completedAt,
          failedAt: paymentTransaction.failedAt
        },
        enrollment: paymentTransaction.enrollmentId || null,
        course: paymentTransaction.courseId || null,
        refund: paymentTransaction.refund && paymentTransaction.refund.isRefunded ? {
          isRefunded: paymentTransaction.refund.isRefunded,
          refundAmount: paymentTransaction.refund.refundAmount,
          refundedAt: paymentTransaction.refund.refundedAt
        } : null
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private (Admin/Guru for their courses)
const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find payment transaction
    const paymentTransaction = await PaymentTransaction.findById(id)
      .populate('enrollmentId guruId');

    if (!paymentTransaction) {
      return res.status(404).json({
        success: false,
        message: 'Payment transaction not found'
      });
    }

    // Check authorization
    const canRefund = 
      userRole === 'admin' ||
      paymentTransaction.guruId._id.toString() === userId;

    if (!canRefund) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process refunds for this payment'
      });
    }

    // Validate refund amount
    const maxRefundAmount = paymentTransaction.amount.total - (paymentTransaction.refund?.refundAmount || 0);
    const refundAmount = amount || maxRefundAmount;

    if (refundAmount > maxRefundAmount) {
      return res.status(400).json({
        success: false,
        message: `Refund amount cannot exceed ${maxRefundAmount}`
      });
    }

    // Process refund through Razorpay
    const razorpayRefund = await razorpay.payments.refund(paymentTransaction.razorpay.paymentId, {
      amount: Math.round(refundAmount * 100), // Convert to paisa
      notes: {
        reason: reason || 'Refund requested',
        processedBy: userId
      }
    });

    // Update payment transaction
    paymentTransaction.processRefund(refundAmount, reason, userId);
    paymentTransaction.refund.refundTransactionId = razorpayRefund.id;
    paymentTransaction.addEvent('refund_initiated', {
      refundId: razorpayRefund.id,
      amount: refundAmount,
      reason
    });

    await paymentTransaction.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: razorpayRefund.id,
        refundAmount,
        status: razorpayRefund.status,
        expectedAt: razorpayRefund.created_at
      }
    });

  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPaymentSignature,
  handlePaymentWebhook,
  getPaymentStatus,
  processRefund
};