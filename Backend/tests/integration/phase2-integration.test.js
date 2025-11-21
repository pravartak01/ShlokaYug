const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

// Test Models
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const EnrollmentV2 = require('../../src/models/EnrollmentEnhanced');
const PaymentTransaction = require('../src/models/PaymentTransaction');

/**
 * Integration Test Suite for Phase 2 Enrollment & Payment System
 * Tests complete enrollment workflow, payment processing, and subscription management
 */

describe('Phase 2 Integration Tests - Enrollment & Payment System', () => {
  let testUser, testGuru, testCourse;
  let userToken, guruToken, adminToken;
  let testEnrollment, testPayment;

  // Test database setup
  beforeAll(async () => {
    // Use test database
    const testDB = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/shlokayug_test';
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    
    await mongoose.connect(testDB);
    console.log('Connected to test database');
  });

  // Clean up before each test
  beforeEach(async () => {
    // Clear test collections
    await User.deleteMany({});
    await Course.deleteMany({});
    await EnrollmentV2.deleteMany({});
    await PaymentTransaction.deleteMany({});

    // Create test users
    await createTestUsers();
    await createTestCourse();
  });

  afterAll(async () => {
    // Clean up and close database connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  // Helper function to create test users and tokens
  async function createTestUsers() {
    // Create test student
    testUser = new User({
      name: 'Test Student',
      email: 'student@test.com',
      password: 'password123',
      role: 'student',
      isVerified: true
    });
    await testUser.save();

    // Create test guru
    testGuru = new User({
      name: 'Test Guru',
      email: 'guru@test.com',
      password: 'password123',
      role: 'guru',
      isVerified: true,
      profile: {
        specialization: ['Vedic Chanting'],
        experience: 10,
        qualification: 'PhD in Sanskrit'
      }
    });
    await testGuru.save();

    // Generate tokens
    userToken = testUser.generateAuthToken();
    guruToken = testGuru.generateAuthToken();

    // Create admin token
    const adminUser = new User({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
      isVerified: true
    });
    await adminUser.save();
    adminToken = adminUser.generateAuthToken();
  }`` // Helper function to create test course
  async function createTestCourse() {
    testCourse = new Course({
      title: 'Test Sanskrit Course',
      description: 'A comprehensive test course for Sanskrit learning',
      instructor: {
        _id: testGuru._id,
        name: testGuru.name,
        email: testGuru.email
      },
      category: 'vedic-chanting',
      difficulty: 'beginner',
      duration: 30,
      pricing: {
        type: 'both',
        oneTime: 999,
        subscription: {
          monthly: 299,
          quarterly: 799,
          yearly: 2999
        }
      },
      content: {
        lectures: [
          {
            title: 'Introduction to Sanskrit',
            description: 'Basic introduction',
            duration: 30,
            videoUrl: 'https://example.com/video1.mp4',
            materials: []
          }
        ],
        totalLectures: 1,
        totalDuration: 30
      },
      isPublished: true,
      publishedAt: new Date()
    });
    await testCourse.save();
    }
  });
