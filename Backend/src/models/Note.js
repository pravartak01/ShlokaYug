/**
 * Note Model
 * Stores student notes for lectures
 */

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
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
    lectureId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Number, // Video timestamp where note was taken (in seconds)
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
noteSchema.index({ userId: 1, courseId: 1, lectureId: 1 });

module.exports = mongoose.model('Note', noteSchema);
