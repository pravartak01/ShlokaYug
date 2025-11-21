/**
 * Test Utilities for Phase 2 Integration Testing
 * Provides helper functions and mock data for comprehensive testing
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Test Models
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const EnrollmentV2 = require('../../src/models/EnrollmentEnhanced');
const PaymentTransaction = require('../src/models/PaymentTransaction');

/**
 * Test Data Factories
 */
class TestDataFactory {
  /**
   * Create a test user with specified role
   */
  static createUser(overrides = {}) {
    const defaults = {
      name: 'Test User',
      email: `user_${Date.now()}@test.com`,
      password: 'password123',
      role: 'student',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return { ...defaults, ...overrides };
  }

  /**
   * Create a test guru with profile
   */
  static createGuru(overrides = {}) {
    const defaults = {
      name: 'Test Guru',
      email: `guru_${Date.now()}@test.com`,
      password: 'password123',
      role: 'guru',
      isVerified: true,
      profile: {
        specialization: ['Vedic Chanting', 'Sanskrit Grammar'],
        experience: 15,
        qualification: 'Acharya in Sanskrit',
        bio: 'Experienced Sanskrit teacher',
        languages: ['Sanskrit', 'Hindi', 'English'],
        certifications: ['Traditional Sanskrit Certification'],
        teachingStyle: 'Traditional with modern approach'
      },
      bankDetails: {
        accountNumber: '1234567890',
        ifscCode: 'TEST0001234',
        bankName: 'Test Bank',
        accountHolderName: 'Test Guru'
      }
    };
    
    return { ...defaults, ...overrides };
  }

  /**
   * Create a test course
   */
  static createCourse(instructorId, overrides = {}) {
    const defaults = {
      title: `Test Course ${Date.now()}`,
      description: 'A comprehensive test course for learning',
      instructor: {
        _id: instructorId,
        name: 'Test Instructor',
        email: 'instructor@test.com'
      },
      category: 'vedic-chanting',
      difficulty: 'beginner',
      duration: 60,
      language: 'sanskrit',
      tags: ['test', 'learning', 'sanskrit'],
      pricing: {
        type: 'both',
        oneTime: 1999,
        subscription: {
          monthly: 499,
          quarterly: 1299,
          yearly: 4999
        }
      },
      content: {
        lectures: [
          {
            title: 'Introduction',
            description: 'Course introduction',
            duration: 30,
            videoUrl: 'https://example.com/video1.mp4',
            order: 1,
            isPublished: true
          },
          {
            title: 'Fundamentals',
            description: 'Basic concepts',
            duration: 30,
            videoUrl: 'https://example.com/video2.mp4',
            order: 2,
            isPublished: true
          }
        ],
        totalLectures: 2,
        totalDuration: 60,
        materials: []
      },
      thumbnail: 'https://example.com/thumbnail.jpg',
      previewVideo: 'https://example.com/preview.mp4',
      requirements: ['Basic interest in Sanskrit'],
      outcomes: ['Understand Sanskrit basics'],
      isPublished: true,
      publishedAt: new Date(),
      enrollmentCount: 0,
      averageRating: 0,
      totalRatings: 0
    };
    
    return { ...defaults, ...overrides };
  }

  /**
   * Create a test enrollment
   */
  static createEnrollment(userId, courseId, overrides = {}) {
    const defaults = {
      userId: new mongoose.Types.ObjectId(userId),
      courseId: new mongoose.Types.ObjectId(courseId),
      enrollmentType: 'one_time',
      status: 'active',
      paymentStatus: 'paid',
      enrollmentDate: new Date(),
      progress: {
        completedLectures: 0,
        totalLectures: 2,
        progressPercentage: 0,
        timeSpent: 0,
        lastWatchedLecture: null,
        lastAccessedAt: new Date()
      },
      certificateEligible: false,
      certificateIssued: false,
      devices: []
    };
    
    return { ...defaults, ...overrides };
  }

  /**
   * Create a subscription enrollment
   */
  static createSubscription(userId, courseId, overrides = {}) {
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const defaults = {
      enrollmentType: 'subscription',
      subscription: {
        status: 'active',
        plan: 'monthly',
        billingCycle: 'monthly',
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
        nextBillingDate: nextMonth,
        cancelAtPeriodEnd: false,
        deviceLimit: 3,
        trialEnd: null,
        discountPercentage: 0
      }
    };
    
    const enrollment = this.createEnrollment(userId, courseId, defaults);
    return { ...enrollment, ...overrides };
  }

  /**
   * Create a test payment transaction
   */
  static createPaymentTransaction(userId, courseId, guruId, overrides = {}) {
    const defaults = {
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: new mongoose.Types.ObjectId(userId),
      courseId: new mongoose.Types.ObjectId(courseId),
      guruId: new mongoose.Types.ObjectId(guruId),
      razorpayOrderId: `order_${Date.now()}`,
      razorpayPaymentId: `pay_${Date.now()}`,
      amount: {
        original: 1999,
        discount: 0,
        total: 1999
      },
      currency: 'INR',
      paymentMethod: 'razorpay',
      status: 'success',
      revenue: {
        guruShare: 1599.20,
        platformShare: 399.80,
        isDistributed: false
      },
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return { ...defaults, ...overrides };
  }

  /**
   * Create device fingerprint data
   */
  static createDeviceFingerprint(overrides = {}) {
    const defaults = {
      deviceId: crypto.randomBytes(32).toString('hex'),
      deviceInfo: {
        browser: 'Chrome 120.0',
        os: 'Windows 11',
        device: 'desktop',
        platform: 'Win32',
        mobile: false,
        timezone: 'Asia/Kolkata'
      },
      isActive: true,
      registeredAt: new Date(),
      lastAccessedAt: new Date(),
      accessCount: 1
    };
    
    return { ...defaults, ...overrides };
  }
}

/**
 * Test Database Helper
 */
class TestDatabase {
  /**
   * Setup test database connection
   */
  static async setup() {
    const testDB = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/shlokayug_test';
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    
    await mongoose.connect(testDB);
    console.log('✅ Connected to test database');
  }

  /**
   * Clean all test collections
   */
  static async cleanup() {
    const collections = await mongoose.connection.db.collections();
    
    await Promise.all(
      collections.map(collection => collection.deleteMany({}))
    );
    
    console.log('🧹 Test database cleaned');
  }

  /**
   * Drop test database and close connection
   */
  static async teardown() {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log('💥 Test database dropped and connection closed');
  }

  /**
   * Seed test data
   */
  static async seedTestData() {
    const testData = {};

    // Create test users
    const studentData = TestDataFactory.createUser({ 
      name: 'Test Student',
      email: 'student@test.com',
      role: 'student' 
    });
    testData.student = new User(studentData);
    await testData.student.save();

    const guruData = TestDataFactory.createGuru({
      name: 'Test Guru',
      email: 'guru@test.com'
    });
    testData.guru = new User(guruData);
    await testData.guru.save();

    const adminData = TestDataFactory.createUser({
      name: 'Test Admin',
      email: 'admin@test.com',
      role: 'admin'
    });
    testData.admin = new User(adminData);
    await testData.admin.save();

    // Create test course
    const courseData = TestDataFactory.createCourse(testData.guru._id, {
      title: 'Test Sanskrit Fundamentals',
      description: 'Learn Sanskrit fundamentals with our comprehensive course'
    });
    testData.course = new Course(courseData);
    await testData.course.save();

    // Create test enrollment
    const enrollmentData = TestDataFactory.createEnrollment(
      testData.student._id,
      testData.course._id
    );
    testData.enrollment = new EnrollmentV2(enrollmentData);
    await testData.enrollment.save();

    // Create test subscription
    const subscriptionData = TestDataFactory.createSubscription(
      testData.student._id,
      testData.course._id
    );
    testData.subscription = new EnrollmentV2(subscriptionData);
    await testData.subscription.save();

    // Create test payment
    const paymentData = TestDataFactory.createPaymentTransaction(
      testData.student._id,
      testData.course._id,
      testData.guru._id
    );
    testData.payment = new PaymentTransaction(paymentData);
    await testData.payment.save();

    console.log('🌱 Test data seeded');
    return testData;
  }
}

/**
 * Authentication Helper
 */
class AuthHelper {
  /**
   * Generate test JWT token
   */
  static generateToken(user) {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', {
      expiresIn: '7d'
    });
  }

  /**
   * Create authorization header
   */
  static authHeader(token) {
    return { Authorization: `Bearer ${token}` };
  }

  /**
   * Generate tokens for test users
   */
  static generateTestTokens(users) {
    const tokens = {};
    
    Object.keys(users).forEach(key => {
      tokens[`${key}Token`] = this.generateToken(users[key]);
    });
    
    return tokens;
  }
}

/**
 * Mock Payment Helper
 */
class MockPaymentHelper {
  /**
   * Generate mock Razorpay order
   */
  static generateMockOrder(amount = 1999) {
    return {
      id: `order_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      entity: 'order',
      amount: amount * 100, // Amount in paise
      amount_paid: 0,
      amount_due: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      status: 'created',
      attempts: 0,
      notes: {},
      created_at: Math.floor(Date.now() / 1000)
    };
  }

  /**
   * Generate mock payment verification data
   */
  static generateMockPayment(orderId) {
    const paymentId = `pay_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test-secret')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature
    };
  }

  /**
   * Generate mock webhook payload
   */
  static generateMockWebhook(eventType, paymentData) {
    const payload = {
      entity: 'event',
      account_id: 'acc_test123',
      event: eventType,
      contains: ['payment'],
      payload: {
        payment: {
          entity: paymentData,
          ...paymentData
        }
      },
      created_at: Math.floor(Date.now() / 1000)
    };

    return payload;
  }
}

/**
 * Test Assertion Helpers
 */
class TestAssertions {
  /**
   * Assert enrollment response structure
   */
  static assertEnrollmentResponse(response, expectedStatus = 200) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body.success).toBeDefined();
    
    if (expectedStatus === 200 || expectedStatus === 201) {
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    } else {
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    }
  }

  /**
   * Assert payment response structure
   */
  static assertPaymentResponse(response, expectedStatus = 200) {
    this.assertEnrollmentResponse(response, expectedStatus);
    
    if (expectedStatus === 200 || expectedStatus === 201) {
      if (response.body.data.paymentOrder) {
        expect(response.body.data.paymentOrder.orderId).toBeDefined();
        expect(response.body.data.paymentOrder.amount).toBeDefined();
      }
    }
  }

  /**
   * Assert subscription response structure
   */
  static assertSubscriptionResponse(response, expectedStatus = 200) {
    this.assertEnrollmentResponse(response, expectedStatus);
    
    if (expectedStatus === 200 || expectedStatus === 201) {
      if (response.body.data.subscriptions) {
        expect(Array.isArray(response.body.data.subscriptions)).toBe(true);
      }
      
      if (response.body.data.subscription) {
        expect(response.body.data.subscription.status).toBeDefined();
        expect(response.body.data.subscription.billingCycle).toBeDefined();
      }
    }
  }

  /**
   * Assert analytics response structure
   */
  static assertAnalyticsResponse(response, expectedStatus = 200) {
    this.assertEnrollmentResponse(response, expectedStatus);
    
    if (expectedStatus === 200) {
      expect(response.body.data.summary).toBeDefined();
      expect(typeof response.body.data.summary).toBe('object');
    }
  }

  /**
   * Assert device response structure
   */
  static assertDeviceResponse(response, expectedStatus = 200) {
    this.assertEnrollmentResponse(response, expectedStatus);
    
    if (expectedStatus === 200 || expectedStatus === 201) {
      if (response.body.data.device) {
        expect(response.body.data.device.deviceId).toBeDefined();
        expect(response.body.data.device.deviceInfo).toBeDefined();
      }
    }
  }
}

/**
 * Performance Testing Helper
 */
class PerformanceHelper {
  /**
   * Measure response time
   */
  static async measureResponseTime(requestFunction) {
    const start = Date.now();
    const response = await requestFunction();
    const duration = Date.now() - start;
    
    return {
      response,
      duration,
      isAcceptable: duration < 1000 // Less than 1 second
    };
  }

  /**
   * Test concurrent requests
   */
  static async testConcurrency(requestFunction, concurrency = 10) {
    const requests = Array(concurrency).fill().map(() => requestFunction());
    
    const start = Date.now();
    const responses = await Promise.allSettled(requests);
    const duration = Date.now() - start;
    
    const successful = responses.filter(r => r.status === 'fulfilled').length;
    const failed = responses.filter(r => r.status === 'rejected').length;
    
    return {
      duration,
      successful,
      failed,
      successRate: (successful / concurrency) * 100,
      averageResponseTime: duration / concurrency
    };
  }
}

module.exports = {
  TestDataFactory,
  TestDatabase,
  AuthHelper,
  MockPaymentHelper,
  TestAssertions,
  PerformanceHelper
};
