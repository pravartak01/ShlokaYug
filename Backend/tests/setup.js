/**
 * Jest Configuration for Phase 2 Integration Testing
 * Provides setup and teardown for comprehensive testing environment
 */

const mongoose = require('mongoose');
const { TestDatabase } = require('./utils/testHelpers');

// Global setup before all tests
beforeAll(async () => {
  console.log('🚀 Starting Phase 2 Integration Test Suite...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-for-phase2-testing';
  process.env.RAZORPAY_KEY_SECRET = 'test-razorpay-secret';
  
  // Setup test database
  await TestDatabase.setup();
  
  // Increase timeout for integration tests
  jest.setTimeout(30000);
  
  console.log('✅ Test environment initialized');
});

// Global teardown after all tests
afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
  
  // Close database connections
  await TestDatabase.teardown();
  
  console.log('✅ Test cleanup completed');
});

// Setup before each test file
beforeEach(async () => {
  // Clean test database before each test
  await TestDatabase.cleanup();
});

// Global error handling for tests
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection during tests:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception during tests:', err);
});

// Mock external services for testing
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({
        id: 'order_test123456789',
        entity: 'order',
        amount: 199900,
        currency: 'INR',
        receipt: 'test_receipt',
        status: 'created'
      }),
      fetch: jest.fn().mockResolvedValue({
        id: 'order_test123456789',
        status: 'paid'
      })
    },
    payments: {
      fetch: jest.fn().mockResolvedValue({
        id: 'pay_test123456789',
        order_id: 'order_test123456789',
        status: 'captured',
        amount: 199900
      })
    },
    webhooks: {
      validateWebhookSignature: jest.fn().mockReturnValue(true)
    }
  }));
});

// Mock Cloudinary for file uploads
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({
        public_id: 'test_image_123',
        secure_url: 'https://test.cloudinary.com/image.jpg'
      })
    }
  }
}));

// Mock email service
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-email-123'
    })
  })
}));

// Console override to reduce test noise
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Suppress console output during tests unless it's an error
if (process.env.NODE_ENV === 'test' && !process.env.TEST_VERBOSE) {
  console.log = jest.fn();
  console.error = jest.fn((message) => {
    // Still show actual errors
    if (message && typeof message === 'string' && message.includes('Error')) {
      originalConsoleError(message);
    }
  });
}

// Restore console for debugging when needed
if (process.env.TEST_VERBOSE) {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
}

module.exports = {};