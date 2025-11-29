/**
 * Quick script to mark a course as completed
 * Run with: node complete-course.js <userId> <courseId>
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Enrollment = require('./src/models/Enrollment');

const completeEnrollment = async (userId, courseId) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const enrollment = await Enrollment.findOne({ userId, courseId });
    
    if (!enrollment) {
      console.log('❌ Enrollment not found');
      process.exit(1);
    }

    console.log('📝 Current progress:', enrollment.progress);

    const completedLectures = (enrollment.progress && enrollment.progress.lecturesCompleted) 
      ? enrollment.progress.lecturesCompleted 
      : ['lecture_1', 'lecture_2', 'lecture_3'];

    enrollment.progress = {
      lecturesCompleted: completedLectures,
      completionPercentage: 100,
      isCompleted: true,
      completedAt: new Date(),
      totalWatchTime: 3600,
      lastAccessedLecture: 'final'
    };

    await enrollment.save();

    console.log('✅ Enrollment marked as complete!');
    console.log('📊 New progress:', enrollment.progress);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

const userId = process.argv[2] || '6927344b62cd5d6e8031732c';
const courseId = process.argv[3] || '69285f0b51464669e702ac26';

console.log(`🎯 Completing enrollment for user ${userId}, course ${courseId}`);
completeEnrollment(userId, courseId);
