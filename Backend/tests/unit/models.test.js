const mongoose = require('mongoose');
const EnrollmentV2 = require('../../src/models/EnrollmentEnhanced');
const PaymentTransaction = require('../../src/models/PaymentTransaction');
const { TestDataFactory, TestDatabase } = require('../utils/testHelpers');

/**
 * Unit Tests for Phase 2 Enhanced Models
 * Tests model methods, validations, and business logic
 */

describe('Phase 2 Model Unit Tests', () => {
  beforeAll(async () => {
    await TestDatabase.setup();
  });

  beforeEach(async () => {
    await TestDatabase.cleanup();
  });

  afterAll(async () => {
    await TestDatabase.teardown();
  });

  describe('EnrollmentV2 Model Tests', () => {
    let testUserId, testCourseId;

    beforeEach(() => {
      testUserId = new mongoose.Types.ObjectId();
      testCourseId = new mongoose.Types.ObjectId();
    });

    test('should create enrollment with required fields', async () => {
      const enrollmentData = TestDataFactory.createEnrollment(testUserId, testCourseId);
      const enrollment = new EnrollmentV2(enrollmentData);
      await enrollment.save();

      expect(enrollment._id).toBeDefined();
      expect(enrollment.userId).toEqual(testUserId);
      expect(enrollment.courseId).toEqual(testCourseId);
      expect(enrollment.status).toBe('active');
      expect(enrollment.paymentStatus).toBe('paid');
    });

    test('should validate enrollment types', async () => {
      const enrollmentData = TestDataFactory.createEnrollment(testUserId, testCourseId, {
        enrollmentType: 'invalid_type'
      });

      const enrollment = new EnrollmentV2(enrollmentData);
      
      await expect(enrollment.save()).rejects.toThrow();
    });

    test('should calculate progress percentage correctly', async () => {
      const enrollmentData = TestDataFactory.createEnrollment(testUserId, testCourseId);
      const enrollment = new EnrollmentV2(enrollmentData);
      
      // Update progress
      enrollment.updateProgress(1, 5, 30);
      
      expect(enrollment.progress.completedLectures).toBe(1);
      expect(enrollment.progress.totalLectures).toBe(5);
      expect(enrollment.progress.progressPercentage).toBe(20);
      expect(enrollment.progress.timeSpent).toBe(30);
    });

    test('should determine certificate eligibility', async () => {
      const enrollmentData = TestDataFactory.createEnrollment(testUserId, testCourseId);
      const enrollment = new EnrollmentV2(enrollmentData);
      
      // Complete all lectures (100% progress)
      enrollment.updateProgress(5, 5, 300);
      
      expect(enrollment.progress.progressPercentage).toBe(100);
      expect(enrollment.certificateEligible).toBe(true);
    });

    test('should register device successfully', async () => {
      const enrollmentData = TestDataFactory.createSubscription(testUserId, testCourseId);
      const enrollment = new EnrollmentV2(enrollmentData);
      await enrollment.save();

      const deviceData = TestDataFactory.createDeviceFingerprint();
      await enrollment.registerDevice(deviceData.deviceId, deviceData.deviceInfo);

      expect(enrollment.devices).toHaveLength(1);
      expect(enrollment.devices[0].deviceId).toBe(deviceData.deviceId);
      expect(enrollment.devices[0].isActive).toBe(true);
    });

    test('should enforce device limit', async () => {
      const enrollmentData = TestDataFactory.createSubscription(testUserId, testCourseId, {
        subscription: { deviceLimit: 2 }
      });
      const enrollment = new EnrollmentV2(enrollmentData);
      await enrollment.save();

      // Register maximum devices
      const device1 = TestDataFactory.createDeviceFingerprint();
      const device2 = TestDataFactory.createDeviceFingerprint();
      
      await enrollment.registerDevice(device1.deviceId, device1.deviceInfo);
      await enrollment.registerDevice(device2.deviceId, device2.deviceInfo);

      expect(enrollment.devices).toHaveLength(2);

      // Try to register one more device (should fail)
      const device3 = TestDataFactory.createDeviceFingerprint();
      
      await expect(
        enrollment.registerDevice(device3.deviceId, device3.deviceInfo)
      ).rejects.toThrow('device limit');
    });

    test('should validate device access', async () => {
      const enrollmentData = TestDataFactory.createSubscription(testUserId, testCourseId);
      const enrollment = new EnrollmentV2(enrollmentData);
      await enrollment.save();

      const deviceData = TestDataFactory.createDeviceFingerprint();
      await enrollment.registerDevice(deviceData.deviceId, deviceData.deviceInfo);

      const isValid = enrollment.validateDeviceAccess(deviceData.deviceId);
      expect(isValid).toBe(true);

      // Test invalid device
      const invalidDeviceId = 'invalid_device_123';
      const isInvalid = enrollment.validateDeviceAccess(invalidDeviceId);
      expect(isInvalid).toBe(false);
    });

    test('should pause subscription', async () => {
      const enrollmentData = TestDataFactory.createSubscription(testUserId, testCourseId);
      const enrollment = new EnrollmentV2(enrollmentData);
      await enrollment.save();

      const pauseReason = 'Temporary break';
      const pauseEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await enrollment.pauseSubscription(pauseReason, pauseEndDate);

      expect(enrollment.subscription.status).toBe('paused');
      expect(enrollment.subscription.pauseReason).toBe(pauseReason);
      expect(enrollment.subscription.pauseEndDate).toEqual(pauseEndDate);
    });

    test('should resume subscription', async () => {
      const enrollmentData = TestDataFactory.createSubscription(testUserId, testCourseId, {
        subscription: { 
          status: 'paused',
          pauseReason: 'Test pause',
          pausedAt: new Date()
        }
      });
      const enrollment = new EnrollmentV2(enrollmentData);
      await enrollment.save();

      await enrollment.resumeSubscription();

      expect(enrollment.subscription.status).toBe('active');
      expect(enrollment.subscription.pauseReason).toBeNull();
      expect(enrollment.subscription.pausedAt).toBeNull();
    });

    test('should cancel subscription', async () => {
      const enrollmentData = TestDataFactory.createSubscription(testUserId, testCourseId);
      const enrollment = new EnrollmentV2(enrollmentData);
      await enrollment.save();

      const cancelReason = 'not_using';
      const immediate = false;
      const feedback = 'Good course but not currently using';

      await enrollment.cancelSubscription(cancelReason, immediate, feedback);

      expect(enrollment.subscription.status).toBe('active'); // Still active until period end
      expect(enrollment.subscription.cancelAtPeriodEnd).toBe(true);
      expect(enrollment.subscription.cancelReason).toBe(cancelReason);
      expect(enrollment.subscription.cancelledAt).toBeDefined();
    });

    test('should add audit logs', async () => {
      const enrollmentData = TestDataFactory.createEnrollment(testUserId, testCourseId);
      const enrollment = new EnrollmentV2(enrollmentData);
      await enrollment.save();

      const auditData = {
        action: 'test_action',
        details: { testField: 'testValue' },
        performedBy: testUserId,
        timestamp: new Date()
      };

      await enrollment.addAuditLog(auditData);

      expect(enrollment.auditTrail).toHaveLength(1);
      expect(enrollment.auditTrail[0].action).toBe('test_action');
      expect(enrollment.auditTrail[0].details.testField).toBe('testValue');
    });

    test('should handle subscription renewal', async () => {
      const enrollmentData = TestDataFactory.createSubscription(testUserId, testCourseId, {
        subscription: {
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          nextBillingDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });
      const enrollment = new EnrollmentV2(enrollmentData);
      await enrollment.save();

      const oldPeriodEnd = enrollment.subscription.currentPeriodEnd;
      
      // Simulate renewal
      await enrollment.renewSubscription();

      expect(enrollment.subscription.status).toBe('active');
      expect(enrollment.subscription.currentPeriodStart.getTime()).toBeCloseTo(oldPeriodEnd.getTime(), -1);
    });
  });

  describe('PaymentTransaction Model Tests', () => {
    let testUserId, testCourseId, testGuruId;

    beforeEach(() => {
      testUserId = new mongoose.Types.ObjectId();
      testCourseId = new mongoose.Types.ObjectId();
      testGuruId = new mongoose.Types.ObjectId();
    });

    test('should create payment transaction with required fields', async () => {
      const paymentData = TestDataFactory.createPaymentTransaction(testUserId, testCourseId, testGuruId);
      const payment = new PaymentTransaction(paymentData);
      await payment.save();

      expect(payment._id).toBeDefined();
      expect(payment.transactionId).toBeDefined();
      expect(payment.userId).toEqual(testUserId);
      expect(payment.courseId).toEqual(testCourseId);
      expect(payment.status).toBe('success');
    });

    test('should calculate revenue sharing correctly', async () => {
      const paymentData = TestDataFactory.createPaymentTransaction(testUserId, testCourseId, testGuruId, {
        amount: { total: 1000 }
      });
      const payment = new PaymentTransaction(paymentData);

      payment.calculateRevenueSharing();

      expect(payment.revenue.guruShare).toBe(800); // 80%
      expect(payment.revenue.platformShare).toBe(200); // 20%
      expect(payment.revenue.guruPercentage).toBe(80);
      expect(payment.revenue.platformPercentage).toBe(20);
    });

    test('should validate payment status transitions', async () => {
      const paymentData = TestDataFactory.createPaymentTransaction(testUserId, testCourseId, testGuruId, {
        status: 'pending'
      });
      const payment = new PaymentTransaction(paymentData);
      await payment.save();

      // Valid transition: pending -> success
      payment.status = 'success';
      payment.completedAt = new Date();
      await payment.save();

      expect(payment.status).toBe('success');
    });

    test('should add event to audit trail', async () => {
      const paymentData = TestDataFactory.createPaymentTransaction(testUserId, testCourseId, testGuruId);
      const payment = new PaymentTransaction(paymentData);
      await payment.save();

      const eventData = {
        eventType: 'payment_verified',
        details: { verificationMethod: 'razorpay_signature' }
      };

      payment.addEvent('payment_verified', eventData);
      await payment.save();

      expect(payment.events).toHaveLength(1);
      expect(payment.events[0].eventType).toBe('payment_verified');
    });

    test('should mark revenue as distributed', async () => {
      const paymentData = TestDataFactory.createPaymentTransaction(testUserId, testCourseId, testGuruId);
      const payment = new PaymentTransaction(paymentData);
      await payment.save();

      payment.distributeRevenue();

      expect(payment.revenue.isDistributed).toBe(true);
      expect(payment.revenue.distributedAt).toBeDefined();
    });

    test('should generate transaction reference', async () => {
      const paymentData = TestDataFactory.createPaymentTransaction(testUserId, testCourseId, testGuruId);
      delete paymentData.transactionId; // Remove to test auto-generation
      
      const payment = new PaymentTransaction(paymentData);
      await payment.save();

      expect(payment.transactionId).toBeDefined();
      expect(payment.transactionId).toMatch(/^txn_/);
    });

    test('should validate refund amount', async () => {
      const paymentData = TestDataFactory.createPaymentTransaction(testUserId, testCourseId, testGuruId, {
        amount: { total: 1000 },
        status: 'success'
      });
      const payment = new PaymentTransaction(paymentData);
      await payment.save();

      // Valid partial refund
      payment.refund = {
        isRefunded: true,
        refundAmount: 500,
        refundReason: 'partial_refund',
        refundedAt: new Date()
      };

      await payment.save();
      expect(payment.refund.refundAmount).toBe(500);

      // Invalid refund (more than total)
      payment.refund.refundAmount = 1500;
      await expect(payment.save()).rejects.toThrow();
    });

    test('should find pending distributions', async () => {
      // Create multiple payments
      const payment1Data = TestDataFactory.createPaymentTransaction(testUserId, testCourseId, testGuruId, {
        revenue: { isDistributed: false }
      });
      const payment1 = new PaymentTransaction(payment1Data);
      await payment1.save();

      const payment2Data = TestDataFactory.createPaymentTransaction(testUserId, testCourseId, testGuruId, {
        revenue: { isDistributed: true }
      });
      const payment2 = new PaymentTransaction(payment2Data);
      await payment2.save();

      const pendingDistributions = await PaymentTransaction.findPendingDistributions();

      expect(pendingDistributions).toHaveLength(1);
      expect(pendingDistributions[0]._id.toString()).toBe(payment1._id.toString());
    });

    test('should calculate total revenue for guru', async () => {
      const payment1Data = TestDataFactory.createPaymentTransaction(testUserId, testCourseId, testGuruId, {
        revenue: { guruShare: 800 },
        status: 'success'
      });
      const payment1 = new PaymentTransaction(payment1Data);
      await payment1.save();

      const payment2Data = TestDataFactory.createPaymentTransaction(testUserId, testCourseId, testGuruId, {
        revenue: { guruShare: 1200 },
        status: 'success'
      });
      const payment2 = new PaymentTransaction(payment2Data);
      await payment2.save();

      const totalRevenue = await PaymentTransaction.getTotalRevenueForGuru(testGuruId);

      expect(totalRevenue.guruRevenue).toBe(2000);
      expect(totalRevenue.totalTransactions).toBe(2);
    });
  });

  describe('Model Integration Tests', () => {
    test('should maintain referential integrity between models', async () => {
      const userId = new mongoose.Types.ObjectId();
      const courseId = new mongoose.Types.ObjectId();
      const guruId = new mongoose.Types.ObjectId();

      // Create enrollment
      const enrollmentData = TestDataFactory.createEnrollment(userId, courseId);
      const enrollment = new EnrollmentV2(enrollmentData);
      await enrollment.save();

      // Create payment for the enrollment
      const paymentData = TestDataFactory.createPaymentTransaction(userId, courseId, guruId, {
        enrollmentId: enrollment._id
      });
      const payment = new PaymentTransaction(paymentData);
      await payment.save();

      // Verify relationship
      expect(payment.enrollmentId.toString()).toBe(enrollment._id.toString());

      // Test cascade operations
      const foundPayment = await PaymentTransaction.findOne({ enrollmentId: enrollment._id });
      expect(foundPayment).toBeTruthy();
    });

    test('should handle complex subscription scenarios', async () => {
      const userId = new mongoose.Types.ObjectId();
      const courseId = new mongoose.Types.ObjectId();

      // Create subscription with multiple billing cycles
      const subscriptionData = TestDataFactory.createSubscription(userId, courseId, {
        subscription: {
          billingCycle: 'monthly',
          status: 'active'
        }
      });
      const subscription = new EnrollmentV2(subscriptionData);
      await subscription.save();

      // Simulate billing cycle changes
      subscription.subscription.billingCycle = 'yearly';
      await subscription.save();

      expect(subscription.subscription.billingCycle).toBe('yearly');
    });
  });
});
