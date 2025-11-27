const mongoose = require('mongoose');

const audioRecordingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    shlokaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shloka',
      required: [true, 'Shloka ID is required'],
    },
    recording: {
      originalUrl: {
        type: String,
        required: [true, 'Original audio URL is required'],
      },
      processedUrl: {
        type: String, // URL after FFmpeg processing
      },
      duration: {
        type: Number,
        required: [true, 'Duration is required'],
        min: [0.1, 'Duration must be at least 0.1 seconds'],
        max: [600, 'Duration cannot exceed 10 minutes'],
      },
      fileSize: {
        type: Number,
        required: [true, 'File size is required'],
        min: [1024, 'File size must be at least 1KB'],
        max: [20 * 1024 * 1024, 'File size cannot exceed 20MB'],
      },
      format: {
        type: String,
        required: [true, 'Audio format is required'],
        enum: ['mp3', 'wav', 'aac', 'm4a', 'ogg'],
      },
      quality: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      sampleRate: {
        type: Number,
        default: 44100,
      },
      bitRate: {
        type: Number,
        default: 128000,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
    analysis: {
      overallAccuracy: {
        type: Number,
        min: [0, 'Accuracy cannot be negative'],
        max: [100, 'Accuracy cannot exceed 100%'],
        default: 0,
      },
      timingAccuracy: {
        type: Number,
        min: [0, 'Timing accuracy cannot be negative'],
        max: [100, 'Timing accuracy cannot exceed 100%'],
        default: 0,
      },
      pronunciationAccuracy: {
        type: Number,
        min: [0, 'Pronunciation accuracy cannot be negative'],
        max: [100, 'Pronunciation accuracy cannot exceed 100%'],
        default: 0,
      },
      rhythmAccuracy: {
        type: Number,
        min: [0, 'Rhythm accuracy cannot be negative'],
        max: [100, 'Rhythm accuracy cannot exceed 100%'],
        default: 0,
      },
      detailedAnalysis: [
        {
          syllable: {
            type: String,
            required: true,
          },
          expectedTiming: {
            type: Number,
            required: true,
            min: 0,
          },
          actualTiming: {
            type: Number,
            required: true,
            min: 0,
          },
          timingDifference: {
            type: Number,
            required: true,
          },
          pronunciationScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
          },
          feedback: {
            type: String,
            maxlength: [200, 'Feedback cannot exceed 200 characters'],
          },
          expectedPitch: Number,
          actualPitch: Number,
          pitchVariation: Number,
          volume: Number,
          clarity: Number,
        },
      ],
      aiGeneratedFeedback: {
        type: String,
        maxlength: [1000, 'AI feedback cannot exceed 1000 characters'],
      },
      recommendedImprovements: [
        {
          type: String,
          maxlength: [200, 'Each recommendation cannot exceed 200 characters'],
        },
      ],
      processingTime: {
        type: Number, // in milliseconds
        default: 0,
      },
      analysisVersion: {
        type: String,
        default: '1.0',
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0,
      },
      technicalMetrics: {
        snr: Number, // Signal-to-noise ratio
        spectralCentroid: Number,
        mfcc: [Number], // Mel-frequency cepstral coefficients
        tempo: Number,
        harmonicity: Number,
      },
    },
    practice: {
      attemptNumber: {
        type: Number,
        required: [true, 'Attempt number is required'],
        min: [1, 'Attempt number must be at least 1'],
      },
      sessionId: {
        type: String,
        required: [true, 'Session ID is required'],
      },
      practiceMode: {
        type: String,
        required: [true, 'Practice mode is required'],
        enum: ['guided', 'free', 'exam', 'challenge'],
      },
      isCompleted: {
        type: Boolean,
        default: false,
      },
      timeSpent: {
        type: Number, // in seconds
        default: 0,
        min: 0,
      },
      pauseCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      retryCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      targetAccuracy: {
        type: Number,
        default: 70,
        min: 0,
        max: 100,
      },
      achievedTarget: {
        type: Boolean,
        default: false,
      },
    },
    gamification: {
      xpEarned: {
        type: Number,
        default: 0,
        min: 0,
      },
      badgesEarned: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Badge',
        },
      ],
      streakContribution: {
        type: Boolean,
        default: false,
      },
      milestoneReached: {
        type: String,
        maxlength: [100, 'Milestone description cannot exceed 100 characters'],
      },
      bonusMultiplier: {
        type: Number,
        default: 1,
        min: 1,
        max: 5,
      },
    },
    privacy: {
      isPublic: {
        type: Boolean,
        default: false,
      },
      allowComments: {
        type: Boolean,
        default: true,
      },
      shareable: {
        type: Boolean,
        default: false,
      },
      anonymousSharing: {
        type: Boolean,
        default: false,
      },
    },
    metadata: {
      deviceInfo: {
        type: String,
        maxlength: [200, 'Device info cannot exceed 200 characters'],
      },
      appVersion: {
        type: String,
        maxlength: [20, 'App version cannot exceed 20 characters'],
      },
      recordingConditions: {
        type: String,
        enum: ['quiet', 'noisy', 'outdoor', 'studio', 'unknown'],
        default: 'unknown',
      },
      microphoneType: {
        type: String,
        enum: ['built-in', 'external', 'headset', 'unknown'],
        default: 'unknown',
      },
      backgroundNoiseLevel: {
        type: Number,
        min: 0,
        max: 100,
      },
      recordingLocation: {
        type: String,
        maxlength: [100, 'Recording location cannot exceed 100 characters'],
      },
    },
    moderation: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'flagged', 'auto-approved'],
        default: 'pending',
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reviewedAt: Date,
      rejectionReason: {
        type: String,
        maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
      },
      flags: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          reason: {
            type: String,
            required: true,
            enum: ['inappropriate', 'low-quality', 'spam', 'copyright', 'offensive', 'other'],
          },
          description: {
            type: String,
            maxlength: [300, 'Flag description cannot exceed 300 characters'],
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      autoModerationScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    processing: {
      status: {
        type: String,
        enum: ['queued', 'processing', 'completed', 'failed'],
        default: 'queued',
      },
      startedAt: Date,
      completedAt: Date,
      errorMessage: String,
      retryCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      processingStage: {
        type: String,
        enum: ['upload', 'conversion', 'analysis', 'feedback', 'storage'],
        default: 'upload',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
audioRecordingSchema.index({ userId: 1, shlokaId: 1 });
audioRecordingSchema.index({ 'analysis.overallAccuracy': -1 });
audioRecordingSchema.index({ 'recording.uploadedAt': -1 });
audioRecordingSchema.index({ 'privacy.isPublic': 1 });
audioRecordingSchema.index({ 'moderation.status': 1 });
audioRecordingSchema.index({ 'practice.practiceMode': 1 });
audioRecordingSchema.index({ 'practice.sessionId': 1 });
audioRecordingSchema.index({ 'processing.status': 1 });
audioRecordingSchema.index({ createdAt: -1 });

// Compound indexes
audioRecordingSchema.index({ userId: 1, 'analysis.overallAccuracy': -1 });
audioRecordingSchema.index({ shlokaId: 1, 'privacy.isPublic': 1, 'analysis.overallAccuracy': -1 });

// Virtual for processing duration
audioRecordingSchema.virtual('processingDuration').get(function () {
  if (this.processing.startedAt && this.processing.completedAt) {
    return this.processing.completedAt - this.processing.startedAt;
  }
  return null;
});

// Virtual for accuracy grade
audioRecordingSchema.virtual('accuracyGrade').get(function () {
  const accuracy = this.analysis.overallAccuracy;
  if (accuracy >= 90) return 'A+';
  if (accuracy >= 85) return 'A';
  if (accuracy >= 80) return 'B+';
  if (accuracy >= 75) return 'B';
  if (accuracy >= 70) return 'C+';
  if (accuracy >= 65) return 'C';
  if (accuracy >= 60) return 'D';
  return 'F';
});

// Virtual for improvement percentage
audioRecordingSchema.virtual('improvementPercentage').get(
  () =>
    // This would be calculated comparing to user's previous attempts
    // For now, return null - would need additional logic
    null
);

// Pre-save middleware to calculate XP earned
audioRecordingSchema.pre('save', function (next) {
  if (this.isModified('analysis.overallAccuracy') && !this.gamification.xpEarned) {
    const accuracy = this.analysis.overallAccuracy;
    let baseXP = 10; // Base XP for completion

    // Bonus XP based on accuracy
    if (accuracy >= 95) baseXP += 50;
    else if (accuracy >= 90) baseXP += 40;
    else if (accuracy >= 85) baseXP += 30;
    else if (accuracy >= 80) baseXP += 20;
    else if (accuracy >= 75) baseXP += 10;

    // Apply bonus multiplier
    this.gamification.xpEarned = Math.round(baseXP * this.gamification.bonusMultiplier);

    // Check if target achieved
    this.practice.achievedTarget = accuracy >= this.practice.targetAccuracy;

    // Extra XP for achieving target
    if (this.practice.achievedTarget) {
      this.gamification.xpEarned += 20;
    }
  }
  next();
});

// Pre-save middleware to update processing timestamps
audioRecordingSchema.pre('save', function (next) {
  if (this.isModified('processing.status')) {
    const now = new Date();

    if (this.processing.status === 'processing' && !this.processing.startedAt) {
      this.processing.startedAt = now;
    } else if (
      ['completed', 'failed'].includes(this.processing.status) &&
      !this.processing.completedAt
    ) {
      this.processing.completedAt = now;
    }
  }
  next();
});

// Method to calculate detailed feedback
audioRecordingSchema.methods.generateDetailedFeedback = function () {
  const { analysis } = this;
  const feedback = [];

  // Overall performance feedback
  if (analysis.overallAccuracy >= 90) {
    feedback.push('Excellent performance! Your pronunciation and timing are nearly perfect.');
  } else if (analysis.overallAccuracy >= 80) {
    feedback.push('Good performance! Minor improvements needed in some areas.');
  } else if (analysis.overallAccuracy >= 70) {
    feedback.push('Fair performance. Focus on improving pronunciation and timing.');
  } else {
    feedback.push(
      'Needs improvement. Consider practicing more slowly and focusing on individual syllables.'
    );
  }

  // Specific area feedback
  if (analysis.timingAccuracy < 70) {
    feedback.push('Work on maintaining consistent rhythm throughout the chanting.');
  }

  if (analysis.pronunciationAccuracy < 70) {
    feedback.push('Pay attention to proper pronunciation of Sanskrit syllables.');
  }

  if (analysis.rhythmAccuracy < 70) {
    feedback.push('Focus on the natural flow and rhythm of the chandas meter.');
  }

  // Improvement suggestions
  const improvements = [];
  if (analysis.timingAccuracy < analysis.pronunciationAccuracy) {
    improvements.push('Practice with a metronome to improve timing');
  }
  if (analysis.pronunciationAccuracy < analysis.timingAccuracy) {
    improvements.push('Listen to reference recordings for proper pronunciation');
  }
  if (analysis.rhythmAccuracy < 80) {
    improvements.push('Study the chandas pattern before practicing');
  }

  this.analysis.recommendedImprovements = improvements;
  this.analysis.aiGeneratedFeedback = feedback.join(' ');

  return this.save();
};

// Method to mark as public
audioRecordingSchema.methods.makePublic = function () {
  if (this.analysis.overallAccuracy >= 75 && this.moderation.status === 'approved') {
    this.privacy.isPublic = true;
    this.privacy.shareable = true;
    return this.save();
  }
  throw new Error('Recording must have 75% accuracy and be approved to make public');
};

// Method to add flag
audioRecordingSchema.methods.addFlag = function (userId, reason, description = '') {
  this.moderation.flags.push({
    userId,
    reason,
    description,
    timestamp: new Date(),
  });

  // Auto-flag if multiple flags
  if (this.moderation.flags.length >= 3) {
    this.moderation.status = 'flagged';
  }

  return this.save();
};

// Static method to get user's recordings
audioRecordingSchema.statics.getUserRecordings = function (userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    sort = '-createdAt',
    shlokaId,
    practiceMode,
    minAccuracy,
    status = ['completed'],
  } = options;

  const query = {
    userId,
    'processing.status': { $in: status },
  };

  if (shlokaId) {
    query.shlokaId = shlokaId;
  }

  if (practiceMode) {
    query['practice.practiceMode'] = practiceMode;
  }

  if (minAccuracy) {
    query['analysis.overallAccuracy'] = { $gte: minAccuracy };
  }

  const skip = (page - 1) * limit;

  return this.find(query)
    .populate('shlokaId', 'title metadata.difficulty')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get public recordings
audioRecordingSchema.statics.getPublicRecordings = function (options = {}) {
  const {
    page = 1,
    limit = 20,
    sort = '-analysis.overallAccuracy',
    shlokaId,
    minAccuracy = 75,
  } = options;

  const query = {
    'privacy.isPublic': true,
    'moderation.status': 'approved',
    'analysis.overallAccuracy': { $gte: minAccuracy },
  };

  if (shlokaId) {
    query.shlokaId = shlokaId;
  }

  const skip = (page - 1) * limit;

  return this.find(query)
    .populate('userId', 'username profile.firstName profile.lastName profile.avatar')
    .populate('shlokaId', 'title metadata.difficulty metadata.category')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get analytics
audioRecordingSchema.statics.getAnalytics = function (userId, timeframe = 'month') {
  const timeframeMap = {
    week: 7,
    month: 30,
    quarter: 90,
    year: 365,
  };

  const days = timeframeMap[timeframe] || 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        'processing.status': 'completed',
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalRecordings: { $sum: 1 },
        averageAccuracy: { $avg: '$analysis.overallAccuracy' },
        bestAccuracy: { $max: '$analysis.overallAccuracy' },
        totalTimeSpent: { $sum: '$practice.timeSpent' },
        totalXpEarned: { $sum: '$gamification.xpEarned' },
        completedSessions: { $sum: { $cond: ['$practice.isCompleted', 1, 0] } },
      },
    },
  ]);
};

// Static method for leaderboard
audioRecordingSchema.statics.getLeaderboard = function (timeframe = 'month', limit = 10) {
  const timeframeMap = {
    week: 7,
    month: 30,
    quarter: 90,
  };

  const days = timeframeMap[timeframe] || 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        'privacy.isPublic': true,
        'processing.status': 'completed',
        'moderation.status': 'approved',
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$userId',
        averageAccuracy: { $avg: '$analysis.overallAccuracy' },
        bestAccuracy: { $max: '$analysis.overallAccuracy' },
        totalRecordings: { $sum: 1 },
        totalXp: { $sum: '$gamification.xpEarned' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
        pipeline: [
          {
            $project: {
              username: 1,
              'profile.firstName': 1,
              'profile.lastName': 1,
              'profile.avatar': 1,
            },
          },
        ],
      },
    },
    {
      $unwind: '$user',
    },
    {
      $sort: { averageAccuracy: -1, bestAccuracy: -1 },
    },
    {
      $limit: limit,
    },
  ]);
};

module.exports = mongoose.model('AudioRecording', audioRecordingSchema);
