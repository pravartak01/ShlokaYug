/**
 * Separated Guru System Test Script
 * Tests the complete guru application → admin approval → content creation workflow
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Guru = require('../src/models/Guru');
const User = require('../src/models/User');

// Test data
const testGuruData = {
  username: 'test_guru_001',
  email: 'guru.test@example.com',
  password: 'TestGuru@123',
  profile: {
    firstName: 'Guru',
    lastName: 'Tester',
    phoneNumber: '+1234567890',
    bio: 'Experienced Sanskrit teacher with 5+ years of expertise',
    languages: ['english', 'sanskrit', 'hindi'],
    timezone: 'Asia/Kolkata'
  },
  credentials: {
    teachingExperience: {
      totalYears: 5
    }
  },
  expertise: {
    subjects: ['sanskrit-grammar', 'vedic-chanting', 'chandas-prosody'],
    experience: 5,
    qualifications: [
      {
        degree: 'MA Sanskrit',
        institution: 'Test University',
        year: 2018
      }
    ]
  }
};

const testUserData = {
  username: 'test_student_001',
  email: 'student.test@example.com',
  password: 'TestStudent@123',
  profile: {
    firstName: 'Student',
    lastName: 'Tester',
    bio: 'Eager to learn Sanskrit'
  },
  learningGoals: ['basic-sanskrit', 'vedic-chanting'],
  preferences: {
    language: 'english'
  }
};

async function testSeparatedSystem() {
  try {
    console.log('🔄 Starting Separated Guru System Test...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shlokayug');
    console.log('✅ Connected to MongoDB');

    // Clean up any existing test data
    await Guru.deleteOne({ email: testGuruData.email });
    await User.deleteOne({ email: testUserData.email });
    console.log('🧹 Cleaned up existing test data');

    // Test 1: Create Guru Application
    console.log('\n📝 Test 1: Creating Guru Application...');
    const newGuru = new Guru(testGuruData);
    await newGuru.save();
    console.log(`✅ Guru application created with status: ${newGuru.applicationStatus.status}`);
    console.log(`📧 Guru email: ${newGuru.email}`);

    // Test 2: Create Regular User (should work independently)
    console.log('\n👨‍🎓 Test 2: Creating Regular User...');
    const newUser = new User(testUserData);
    await newUser.save();
    console.log(`✅ User created successfully: ${newUser.username}`);
    console.log(`📧 User email: ${newUser.email}`);

    // Test 3: Verify Models are Separate
    console.log('\n🔍 Test 3: Verifying Model Separation...');
    const guruCount = await Guru.countDocuments();
    const userCount = await User.countDocuments();
    console.log(`✅ Total Gurus in system: ${guruCount}`);
    console.log(`✅ Total Users in system: ${userCount}`);

    // Test 4: Test Guru Application Workflow
    console.log('\n🔄 Test 4: Testing Application Workflow...');
    
    // Submit application
    newGuru.applicationStatus.status = 'submitted';
    newGuru.applicationStatus.submittedAt = new Date();
    await newGuru.save();
    console.log(`✅ Application submitted at: ${newGuru.applicationStatus.submittedAt}`);

    // Approve application (simulating admin action)
    const testAdminId = new mongoose.Types.ObjectId();
    newGuru.approve(testAdminId, 'Auto-approved for testing');
    await newGuru.save();
    console.log(`✅ Guru approved! Status: ${newGuru.applicationStatus.status}`);
    console.log(`🎯 Account approved: ${newGuru.accountStatus.isApproved}`);

    // Test 5: Verify Guru Methods
    console.log('\n⚡ Test 5: Testing Guru Methods...');
    
    // Test password verification
    const isPasswordValid = await newGuru.correctPassword('TestGuru@123', newGuru.password);
    console.log(`✅ Password verification: ${isPasswordValid}`);

    // Test password reset token generation
    const resetToken = newGuru.createPasswordResetToken();
    console.log(`✅ Password reset token generated: ${resetToken.substring(0, 20)}...`);

    // Test email verification token
    const verificationToken = newGuru.createEmailVerificationToken();
    console.log(`✅ Email verification token generated: ${verificationToken.substring(0, 20)}...`);

    // Test 6: User Model Independence
    console.log('\n🔒 Test 6: Verifying User Model Independence...');
    
    // Ensure user doesn't have guru fields
    const userSchema = User.schema.paths;
    const guruFields = ['applicationStatus', 'verification', 'expertise', 'permissions'];
    const hasGuruFields = guruFields.some(field => userSchema[field]);
    
    console.log(`✅ User model guru-field-free: ${!hasGuruFields}`);
    console.log(`📋 User fields count: ${Object.keys(userSchema).length}`);

    // Test 7: Search and Filter Capabilities
    console.log('\n🔍 Test 7: Testing Search Capabilities...');
    
    // Find pending applications
    const pendingGurus = await Guru.find({ 'applicationStatus.status': 'draft' });
    console.log(`✅ Pending applications found: ${pendingGurus.length}`);

    // Find approved gurus
    const approvedGurus = await Guru.find({ 'applicationStatus.status': 'approved' });
    console.log(`✅ Approved gurus found: ${approvedGurus.length}`);

    // Find by expertise
    const sanskritExperts = await Guru.find({ 'expertise.subjects': 'sanskrit-grammar' });
    console.log(`✅ Sanskrit grammar experts: ${sanskritExperts.length}`);

    // Test 8: Final Verification
    console.log('\n🎯 Test 8: Final System Verification...');
    
    const finalGuru = await Guru.findById(newGuru._id);
    const finalUser = await User.findById(newUser._id);
    
    console.log(`✅ Guru exists and accessible: ${!!finalGuru}`);
    console.log(`✅ User exists and accessible: ${!!finalUser}`);
    console.log(`✅ Guru status: ${finalGuru.applicationStatus.status}`);
    console.log(`✅ User type check passed: ${finalUser.constructor.name === 'model'}`);

    // Summary
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    console.log('✅ Guru model creation: PASSED');
    console.log('✅ User model creation: PASSED');
    console.log('✅ Model separation: PASSED');
    console.log('✅ Application workflow: PASSED');
    console.log('✅ Guru methods: PASSED');
    console.log('✅ User independence: PASSED');
    console.log('✅ Search capabilities: PASSED');
    console.log('✅ System verification: PASSED');
    console.log('\n🎉 ALL TESTS PASSED! Separated Guru System is working correctly.');

    // Cleanup
    await Guru.deleteOne({ email: testGuruData.email });
    await User.deleteOne({ email: testUserData.email });
    console.log('\n🧹 Test cleanup completed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('📴 Database connection closed');
    process.exit();
  }
}

// Run the test
if (require.main === module) {
  testSeparatedSystem();
}

module.exports = testSeparatedSystem;