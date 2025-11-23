const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Enrollment = require('../src/models/Enrollment');
const PaymentTransactionSimple = require('../src/models/PaymentTransactionSimple');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Clear all collections
const clearDatabase = async () => {
  console.log('🗑️ Clearing database...');
  
  try {
    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    await PaymentTransactionSimple.deleteMany({});
    
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    throw error;
  }
};

// Create test users
const createTestUsers = async () => {
  console.log('👥 Creating test users...');
  
  const users = [
    {
      username: 'testguru',
      email: 'guru@example.com',
      password: 'Test123!@#',
      profile: {
        firstName: 'Test',
        lastName: 'Guru',
        phoneNumber: '+1234567890'
      },
      role: 'guru',
      guruProfile: {
        isVerified: true,
        bio: 'Expert Sanskrit teacher with 10+ years experience',
        credentials: [
          {
            type: 'degree',
            title: 'PhD in Sanskrit Literature',
            institution: 'Sanskrit University',
            year: 2010,
            description: 'Specialized in Classical Sanskrit and Prosody'
          }
        ],
        experience: {
          years: 10,
          description: 'Teaching Sanskrit and Chandas for over 10 years'
        },
        courseCount: 0,
        specializations: ['Chandas', 'Classical Sanskrit', 'Vedic Recitation'],
        verification: {
          isVerified: true,
          verifiedAt: new Date(),
          verificationNotes: 'Verified for testing purposes'
        }
      }
    },
    {
      username: 'teststudent',
      email: 'test@example.com',
      password: 'Test123!@#',
      profile: {
        firstName: 'Test',
        lastName: 'Student',
        phoneNumber: '+1234567891'
      },
      role: 'student'
    },
    {
      username: 'admin',
      email: 'admin@example.com', 
      password: 'Admin123!@#',
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '+1234567892'
      },
      role: 'admin'
    }
  ];

  const createdUsers = [];
  
  for (const userData of users) {
    const user = new User(userData);
    await user.save();
    createdUsers.push(user);
    console.log(`  ✅ Created ${user.role}: ${user.email}`);
  }
  
  return createdUsers;
};

// Create test courses
const createTestCourses = async (guru) => {
  console.log('📚 Creating test courses...');
  
  const courses = [
    {
      title: 'Complete Sanskrit Chandas Mastery',
      description: 'Master the art of Sanskrit prosody with comprehensive lessons on meter, rhythm, and classical poetry composition. This course covers all major chandas patterns used in classical Sanskrit literature.',
      shortDescription: 'Complete course on Sanskrit prosody and meter',
      category: 'Sanskrit',
      subCategory: 'Chandas',
      level: 'intermediate',
      language: 'English',
      duration: {
        hours: 25,
        minutes: 1500
      },
      instructor: {
        userId: guru._id,
        name: `${guru.profile.firstName} ${guru.profile.lastName}`,
        bio: guru.guruProfile.bio,
        credentials: guru.guruProfile.credentials[0]?.title || 'Sanskrit Expert'
      },
      pricing: {
        oneTime: {
          amount: 1999.50,
          currency: 'INR'
        }
      },
      tags: ['sanskrit', 'chandas', 'poetry', 'prosody', 'classical'],
      learningObjectives: [
        'Understand all major chandas patterns',
        'Compose Sanskrit poetry with proper meter',
        'Analyze classical texts for prosodic structure',
        'Master rhythm and musical aspects of Sanskrit verse'
      ],
      prerequisites: ['Basic Sanskrit grammar', 'Devanagari script reading'],
      targetAudience: 'Sanskrit students, poetry enthusiasts, classical music students',
      status: 'published',
      availability: {
        isActive: true,
        enrollmentStartDate: new Date(),
        enrollmentEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      metadata: {
        difficulty: 'intermediate',
        tags: ['chandas', 'poetry', 'advanced'],
        language: {
          instruction: 'english',
          content: 'sanskrit'
        },
        isActive: true,
        featured: true
      },
      settings: {
        allowComments: true,
        allowRatings: true,
        autoEnrollment: false,
        maxEnrollments: 1000,
        accessDuration: 365,
        downloadableContent: true,
        certificateEnabled: true
      },
      analytics: {
        enrollmentCount: 0,
        ratings: {
          average: 4.8,
          count: 0
        },
        views: 0
      },
      units: [
        {
          title: 'Introduction to Chandas',
          description: 'Basic concepts of Sanskrit prosody',
          order: 1,
          lessons: [
            {
              title: 'What is Chandas?',
              description: 'Understanding the fundamentals of Sanskrit meter',
              order: 1,
              lectures: [
                {
                  title: 'Introduction to Sanskrit Prosody',
                  description: 'Overview of meter and rhythm in Sanskrit poetry',
                  type: 'video',
                  duration: { minutes: 15 },
                  order: 1,
                  content: {
                    videoUrl: 'https://example.com/video1.mp4',
                    transcript: 'Sample transcript content...'
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Free Sanskrit Introduction',
      description: 'A free introductory course to Sanskrit basics',
      shortDescription: 'Free introduction to Sanskrit language and script',
      category: 'Sanskrit',
      subCategory: 'Basics',
      level: 'beginner',
      language: 'English',
      duration: {
        hours: 35,
        minutes: 2100
      },
      instructor: {
        userId: guru._id,
        name: `${guru.profile.firstName} ${guru.profile.lastName}`,
        bio: guru.guruProfile.bio,
        credentials: guru.guruProfile.credentials[0]?.title || 'Sanskrit Expert'
      },
      pricing: {
        oneTime: {
          amount: 0,
          currency: 'INR'
        }
      },
      status: 'published',
      availability: {
        isActive: true,
        enrollmentStartDate: new Date(),
        enrollmentEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      metadata: {
        difficulty: 'beginner',
        tags: ['sanskrit', 'basics', 'introduction'],
        language: {
          instruction: 'english',
          content: 'sanskrit'
        },
        isActive: true,
        featured: false
      }
    }
  ];

  const createdCourses = [];
  
  for (const courseData of courses) {
    const course = new Course(courseData);
    await course.save();
    createdCourses.push(course);
    console.log(`  ✅ Created course: ${course.title}`);
  }
  
  return createdCourses;
};

// Create test payment transactions
const createTestPayments = async (user, course) => {
  console.log('💳 Creating test payment transactions...');
  
  const payments = [
    {
      transactionId: 'TXN_TEST_COMPLETED_001',
      userId: user._id,
      courseId: course._id,
      amount: {
        total: course.pricing.oneTime.amount,
        coursePrice: course.pricing.oneTime.amount,
        currency: 'INR'
      },
      status: 'success',
      paymentMethod: 'upi',
      razorpay: {
        orderId: 'order_test_completed_001',
        paymentId: 'pay_test_completed_001'
      },
      completedAt: new Date()
    },
    {
      transactionId: 'TXN_TEST_PENDING_001',
      userId: user._id,
      courseId: course._id,
      amount: {
        total: course.pricing.oneTime.amount,
        coursePrice: course.pricing.oneTime.amount,
        currency: 'INR'
      },
      status: 'pending',
      paymentMethod: 'card',
      razorpay: {
        orderId: 'order_test_pending_001'
      }
    }
  ];

  const createdPayments = [];
  
  for (const paymentData of payments) {
    const payment = new PaymentTransactionSimple(paymentData);
    await payment.save();
    createdPayments.push(payment);
    console.log(`  ✅ Created payment: ${payment.transactionId} (${payment.status})`);
  }
  
  return createdPayments;
};

// Main seeding function
const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...');
  console.log('='.repeat(60));
  
  try {
    await connectDB();
    
    // Clear existing data
    await clearDatabase();
    console.log('');
    
    // Create test data
    const users = await createTestUsers();
    console.log('');
    
    const guru = users.find(u => u.role === 'guru');
    const student = users.find(u => u.role === 'student');
    
    const courses = await createTestCourses(guru);
    console.log('');
    
    const paidCourse = courses.find(c => c.pricing.oneTime.amount > 0);
    
    if (!paidCourse) {
      throw new Error('No paid course found for payment creation!');
    }
    
    const payments = await createTestPayments(student, paidCourse);
    console.log('');
    
    console.log('='.repeat(60));
    console.log('✅ Database seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📚 Courses: ${courses.length}`);
    console.log(`   💳 Payments: ${payments.length}`);
    console.log('');
    console.log('🧪 Test Data:');
    console.log(`   👨‍🏫 Guru: ${guru.email} / Test123!@#`);
    console.log(`   👨‍🎓 Student: ${student.email} / Test123!@#`);
    console.log(`   📚 Paid Course ID: ${paidCourse._id}`);
    console.log(`   🆓 Free Course ID: ${courses.find(c => c.pricing.oneTime.amount === 0)._id}`);
    console.log(`   💳 Test Transaction: ${payments[0].transactionId}`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔐 Database connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, clearDatabase, connectDB };