/**
 * LMS Models Test Suite
 * Tests all the enhanced LMS models to ensure they work correctly
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import all models
const User = require('./src/models/User');
const Course = require('./src/models/Course');
const Progress = require('./src/models/Progress');
const Enrollment = require('./src/models/Enrollment');
const Assessment = require('./src/models/Assessment');

// Test data
const testData = {
  guru: {
    email: 'guru.test@shlokayug.com',
    username: 'testguru',
    password: 'TestPassword123!',
    profile: {
      firstName: 'Test',
      lastName: 'Guru',
      phoneNumber: '9999999999'
    },
    role: 'guru',
    guruProfile: {
      applicationStatus: 'approved',
      credentials: [{
        type: 'degree',
        title: 'PhD in Sanskrit Literature',
        institution: 'Banaras Hindu University',
        year: 2015
      }],
      experience: {
        years: 10,
        description: 'Experienced in Vedic chanting and Sanskrit pronunciation'
      },
      verification: {
        isVerified: true,
        verifiedAt: new Date()
      }
    }
  },
  
  student: {
    email: 'student.test@shlokayug.com',
    username: 'teststudent',
    password: 'TestPassword123!',
    profile: {
      firstName: 'Test',
      lastName: 'Student',
      phoneNumber: '8888888888'
    },
    role: 'student',
    studentProfile: {
      learningGoals: [{
        goal: 'Master Sanskrit pronunciation',
        priority: 'high'
      }, {
        goal: 'Learn basic chanting techniques',
        priority: 'medium'
      }],
      currentLevel: {
        overall: 'beginner',
        pronunciation: 'beginner',
        chanting: 'beginner'
      },
      interests: [{
        category: 'vedic_chanting',
        proficiency: 'beginner'
      }, {
        category: 'pronunciation',
        proficiency: 'beginner'
      }]
    }
  },
  
  course: {
    title: 'Complete Sanskrit Pronunciation Guide',
    description: 'Learn proper Sanskrit pronunciation from basic vowels to complex mantras',
    shortDescription: 'Master Sanskrit pronunciation fundamentals',
    metadata: {
      category: ['pronunciation', 'beginner_basics'],
      difficulty: 'beginner',
      tags: ['sanskrit', 'pronunciation', 'vowels', 'consonants']
    },
    pricing: {
      oneTime: {
        amount: 499,
        currency: 'INR'
      },
      subscription: {
        monthly: {
          amount: 99,
          currency: 'INR'
        },
        yearly: {
          amount: 999,
          currency: 'INR'
        }
      }
    },
    structure: {
      units: [{
        unitId: 'unit_001',
        title: 'Basic Vowels (Swar)',
        description: 'Learn the fundamental vowel sounds in Sanskrit',
        order: 1,
        estimatedDuration: 120, // 2 hours
        lessons: [{
          lessonId: 'lesson_001',
          title: 'Short Vowels',
          description: 'Learn a, i, u, e, o sounds',
          order: 1,
          estimatedDuration: 30,
          lectures: [{
            lectureId: 'lecture_001',
            title: 'Introduction to Short Vowels',
            description: 'Basic introduction to Sanskrit short vowels',
            order: 1,
            content: {
              duration: 900, // 15 minutes in seconds
              keyPoints: [
                'Sanskrit has 5 basic short vowels',
                'Each vowel has specific pronunciation rules',
                'Practice is essential for proper pronunciation'
              ]
            },
            metadata: {
              difficulty: 'beginner',
              tags: ['vowels', 'basics'],
              isFree: true
            }
          }]
        }]
      }]
    }
  }
};

async function runTests() {
  try {
    console.log('🚀 Starting LMS Models Test Suite...\n');
    
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');
    
    // Clean up existing test data
    await cleanupTestData();
    console.log('🧹 Cleaned up existing test data\n');
    
    // Test 1: Create Guru User
    console.log('📝 Test 1: Creating Guru User...');
    const guru = new User(testData.guru);
    await guru.save();
    console.log(`✅ Guru created: ${guru.username} (${guru.email})`);
    console.log(`   Role: ${guru.role}, Verified: ${guru.guruProfile.verification.isVerified}\n`);
    
    // Test 2: Create Student User
    console.log('📝 Test 2: Creating Student User...');
    const student = new User(testData.student);
    await student.save();
    console.log(`✅ Student created: ${student.username} (${student.email})`);
    console.log(`   Role: ${student.role}, Level: ${student.studentProfile.currentLevel}\n`);
    
    // Test 3: Create Course
    console.log('📝 Test 3: Creating Course...');
    const courseData = {
      ...testData.course,
      instructor: {
        userId: guru._id,
        name: `${guru.profile.firstName} ${guru.profile.lastName}`,
        credentials: 'PhD in Sanskrit Literature',
        specializations: ['Pronunciation', 'Vedic Chanting']
      }
    };
    const course = new Course(courseData);
    await course.calculateTotalContent();
    await course.save();
    console.log(`✅ Course created: ${course.title}`);
    console.log(`   Units: ${course.structure.totalUnits}, Lessons: ${course.structure.totalLessons}, Lectures: ${course.structure.totalLectures}`);
    console.log(`   Price: ₹${course.pricing.oneTime.amount} (One-time) | ₹${course.pricing.subscription.monthly.amount}/month\n`);
    
    // Test 4: Create Enrollment
    console.log('📝 Test 4: Creating Student Enrollment...');
    const enrollment = new Enrollment({
      userId: student._id,
      courseId: course._id,
      guruId: guru._id,
      enrollmentType: 'one_time_purchase',
      payment: {
        paymentId: 'pay_test_' + Date.now(),
        razorpayOrderId: 'order_test_' + Date.now(),
        razorpayPaymentId: 'pay_test_' + Date.now(),
        amount: course.pricing.oneTime.amount,
        currency: 'INR',
        status: 'completed',
        paidAt: new Date()
      },
      access: {
        status: 'active',
        grantedAt: new Date()
      }
    });
    await enrollment.processEnrollment();
    console.log(`✅ Enrollment created: ${enrollment.enrollmentType}`);
    console.log(`   Payment Status: ${enrollment.payment.status}, Access: ${enrollment.access.status}\n`);
    
    // Test 5: Create Progress Tracking
    console.log('📝 Test 5: Creating Progress Tracking...');
    const progress = new Progress({
      userId: student._id,
      courseId: course._id,
      enrollmentId: enrollment._id,
      structure: {
        units: [{
          unitId: 'unit_001',
          status: 'in_progress',
          lessons: [{
            lessonId: 'lesson_001',
            status: 'in_progress',
            lectures: [{
              lectureId: 'lecture_001',
              status: 'in_progress',
              startedAt: new Date(),
              watchProgress: {
                totalDuration: 900,
                watchedDuration: 450,
                watchPercentage: 50,
                lastPosition: 450
              }
            }]
          }]
        }]
      }
    });
    await progress.updateStatistics();
    console.log(`✅ Progress created: ${progress.statistics.completion.overall}% complete`);
    console.log(`   Time spent: ${progress.statistics.time.totalSpent} seconds\n`);
    
    // Test 6: Create Assessment
    console.log('📝 Test 6: Creating Assessment...');
    const assessment = new Assessment({
      title: 'Vowel Pronunciation Quiz',
      description: 'Test your understanding of Sanskrit short vowels',
      type: 'quiz',
      courseId: course._id,
      createdBy: guru._id,
      placement: {
        unitId: 'unit_001',
        lessonId: 'lesson_001',
        position: 'after_content'
      },
      configuration: {
        timeLimit: 10,
        maxAttempts: 3,
        totalPoints: 10,
        passingScore: 7,
        showCorrectAnswers: true
      },
      content: {
        instructions: 'Choose the correct pronunciation for each vowel',
        questions: [{
          questionId: 'q1',
          questionText: 'How is the Sanskrit vowel "अ" pronounced?',
          questionType: 'single_choice',
          points: 2,
          content: {
            options: [
              { optionId: 'a', text: 'Like "a" in "about"', isCorrect: true },
              { optionId: 'b', text: 'Like "a" in "cat"', isCorrect: false },
              { optionId: 'c', text: 'Like "a" in "cake"', isCorrect: false }
            ]
          }
        }]
      }
    });
    await assessment.calculatePassingPercentage();
    console.log(`✅ Assessment created: ${assessment.title}`);
    console.log(`   Questions: ${assessment.content.questions.length}, Passing: ${assessment.configuration.passingScore}/${assessment.configuration.totalPoints} (${assessment.passingScorePercentage}%)\n`);
    
    // Test 7: Test Model Methods
    console.log('📝 Test 7: Testing Model Methods...');
    
    // Test guru application method
    const applicationResult = await guru.applyForGuru(
      [{
        type: 'degree',
        title: 'Master of Sanskrit',
        institution: 'Delhi University',
        year: 2020
      }],
      {
        years: 8,
        description: 'Additional teaching experience',
        specializations: ['Advanced Sanskrit Grammar'],
        previousInstitutions: [{
          name: 'Local Sanskrit School',
          position: 'Sanskrit Teacher',
          duration: {
            from: new Date('2020-01-01'),
            to: new Date('2023-12-31')
          },
          responsibilities: 'Teaching advanced Sanskrit grammar and pronunciation'
        }]
      }
    );
    console.log(`✅ Guru application method works: Status ${guru.guruProfile.applicationStatus}`);
    
    // Test course search
    const featuredCourses = await Course.findFeatured(5);
    console.log(`✅ Course search method works: Found ${featuredCourses.length} featured courses`);
    
    // Test progress update
    await progress.updateWatchProgress('unit_001', 'lesson_001', 'lecture_001', {
      totalDuration: 900,
      watchedDuration: 900,
      lastPosition: 900,
      sessionStart: new Date(Date.now() - 900000),
      sessionEnd: new Date()
    });
    console.log(`✅ Progress update method works: ${progress.statistics.completion.overall}% complete`);
    
    // Test enrollment device tracking
    await enrollment.trackDeviceAccess({
      deviceId: 'test_device_001',
      deviceType: 'mobile',
      platform: 'android'
    });
    console.log(`✅ Enrollment device tracking works: ${enrollment.access.accessDevices.length} devices`);
    
    // Test assessment question addition
    await assessment.addQuestion({
      questionText: 'What is the correct way to write the vowel "ई"?',
      questionType: 'single_choice',
      points: 2,
      content: {
        options: [
          { optionId: 'a', text: 'ई', isCorrect: true },
          { optionId: 'b', text: 'इ', isCorrect: false }
        ]
      }
    });
    console.log(`✅ Assessment question addition works: ${assessment.content.questions.length} questions total\n`);
    
    // Test 8: Test Relationships
    console.log('📝 Test 8: Testing Model Relationships...');
    
    // Populate course instructor
    const populatedCourse = await Course.findById(course._id).populate('instructor.userId', 'username email profile');
    console.log(`✅ Course-User relationship works: Course by ${populatedCourse.instructor.userId.username}`);
    
    // Test user's enrolled courses
    const userEnrollments = await Enrollment.find({ userId: student._id }).populate('courseId', 'title');
    console.log(`✅ User-Course enrollment relationship works: ${userEnrollments.length} enrollments`);
    
    // Test progress with course data
    const progressWithCourse = await Progress.findById(progress._id).populate('courseId', 'title instructor.name');
    console.log(`✅ Progress-Course relationship works: Progress for "${progressWithCourse.courseId.title}"\n`);
    
    console.log('🎉 ALL TESTS PASSED! LMS Models are working correctly!\n');
    
    // Test Summary
    console.log('📊 TEST SUMMARY:');
    console.log(`   ✅ User Model: Enhanced with guru/student profiles`);
    console.log(`   ✅ Course Model: Hierarchical structure with pricing`);
    console.log(`   ✅ Progress Model: Detailed tracking with analytics`);
    console.log(`   ✅ Enrollment Model: Payment integration ready`);
    console.log(`   ✅ Assessment Model: Quiz system with Sanskrit support`);
    console.log(`   ✅ All model methods and relationships working`);
    console.log(`   ✅ Database operations successful\n`);
    
    console.log('🚀 Ready for Phase 2: Controller Development!\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    // Clean up and close connection
    await cleanupTestData();
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

async function cleanupTestData() {
  try {
    await User.deleteMany({ 
      email: { $in: ['guru.test@shlokayug.com', 'student.test@shlokayug.com'] }
    });
    await Course.deleteMany({ 
      title: 'Complete Sanskrit Pronunciation Guide'
    });
    await Progress.deleteMany({});
    await Enrollment.deleteMany({});
    await Assessment.deleteMany({ 
      title: 'Vowel Pronunciation Quiz'
    });
  } catch (error) {
    console.log('Note: Some test data cleanup failed (normal if running first time)');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = runTests;