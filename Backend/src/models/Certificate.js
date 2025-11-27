/**
 * Certificate Model
 * Stores course completion certificates
 */

const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      completionDate: Date,
      totalLectures: Number,
      totalWatchTime: Number, // in seconds
      finalScore: Number, // percentage
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one certificate per user per course
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
