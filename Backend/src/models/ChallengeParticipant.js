/**
 * Challenge Participant Model - User participation in challenges
 */

const mongoose = require('mongoose');

const challengeParticipantSchema = new mongoose.Schema({
  // References
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: [true, 'Challenge ID is required'],
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  // Participation Status
  status: {
    type: String,
    enum: ['registered', 'in_progress', 'completed', 'abandoned', 'failed'],
    default: 'registered',
    index: true
  },
  
  // Scoring and Performance
  score: {
    type: Number,
    min: [0, 'Score cannot be negative'],
    default: 0,
    index: true
  },
  maxScore: {
    type: Number,
    min: [0, 'Max score cannot be negative'],
    default: 100
  },
  accuracy: {
    type: Number,
    min: [0, 'Accuracy cannot be negative'],
    max: [100, 'Accuracy cannot exceed 100%'],
    default: 0
  },
  
  // Attempt Information
  attempts: {
    type: Number,
    default: 0,
    min: [0, 'Attempts cannot be negative']
  },
  currentAttempt: {
    startedAt: Date,
    progress: {
      type: Number,
      min: [0, 'Progress cannot be negative'],
      max: [100, 'Progress cannot exceed 100%'],
      default: 0
    },
    responses: [{
      questionId: String,
      answer: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean,
      timeSpent: Number, // in seconds
      submittedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Completion Information
  completedAt: {
    type: Date,
    index: true
  },
  timeSpent: {
    type: Number, // total time spent in minutes
    default: 0,
    min: [0, 'Time spent cannot be negative']
  },
  
  // Achievements and Rewards
  achievements: {
    pointsEarned: {
      type: Number,
      default: 0,
      min: [0, 'Points earned cannot be negative']
    },
    badgesEarned: [{
      name: String,
      description: String,
      icon: String,
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }],
    certificateEarned: {
      certificateId: String,
      issuedAt: Date,
      downloadUrl: String,
      verificationCode: String
    },
    leaderboardPosition: {
      rank: Number,
      total: Number,
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }
  },
  
  // Detailed Performance Analytics
  performance: {
    avgResponseTime: Number, // average time per question in seconds
    fastestResponse: Number,
    slowestResponse: Number,
    streakData: {
      longestStreak: Number,
      currentStreak: Number,
      streakBreaks: Number
    },
    categoryPerformance: [{
      category: String,
      score: Number,
      accuracy: Number,
      timeSpent: Number
    }]
  },
  
  // Submission Details
  submission: {
    submittedAt: Date,
    ipAddress: String,
    userAgent: String,
    submissionData: mongoose.Schema.Types.Mixed, // Flexible data for different challenge types
    autoGraded: {
      type: Boolean,
      default: false
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradingNotes: String
  },
  
  // Additional Metadata
  metadata: {
    startedFromDevice: {
      type: String,
      enum: ['web', 'mobile', 'tablet'],
      default: 'web'
    },
    timezone: String,
    language: {
      type: String,
      default: 'english'
    },
    assistanceUsed: {
      type: Boolean,
      default: false
    },
    hintsUsed: [{
      hintId: String,
      usedAt: Date
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient querying
challengeParticipantSchema.index({ challengeId: 1, userId: 1 }, { unique: true });
challengeParticipantSchema.index({ challengeId: 1, score: -1, completedAt: 1 });
challengeParticipantSchema.index({ userId: 1, status: 1, completedAt: -1 });
challengeParticipantSchema.index({ challengeId: 1, status: 1 });

// Virtual for percentage score
challengeParticipantSchema.virtual('percentageScore').get(function() {
  if (this.maxScore === 0) return 0;
  return ((this.score / this.maxScore) * 100).toFixed(2);
});

// Virtual for completion status
challengeParticipantSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// Virtual for current attempt duration
challengeParticipantSchema.virtual('currentAttemptDuration').get(function() {
  if (!this.currentAttempt.startedAt) return 0;
  return Math.floor((Date.now() - this.currentAttempt.startedAt) / 60000); // in minutes
});

// Pre-save middleware to calculate derived fields
challengeParticipantSchema.pre('save', function(next) {
  // Calculate accuracy if we have responses
  if (this.currentAttempt.responses.length > 0) {
    const correctAnswers = this.currentAttempt.responses.filter(r => r.isCorrect).length;
    this.accuracy = ((correctAnswers / this.currentAttempt.responses.length) * 100).toFixed(2);
  }
  
  // Auto-set completion time if status changed to completed
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Generate verification code for certificate if earned
  if (this.achievements.certificateEarned.issuedAt && !this.achievements.certificateEarned.verificationCode) {
    this.achievements.certificateEarned.verificationCode = generateVerificationCode();
  }
  
  next();
});

// Post-save middleware to update challenge statistics
challengeParticipantSchema.post('save', async function(doc) {
  const Challenge = mongoose.model('Challenge');
  const challenge = await Challenge.findById(doc.challengeId);
  
  if (challenge) {
    // Update participant counts
    const totalParticipants = await this.constructor.countDocuments({ challengeId: doc.challengeId });
    const completedParticipants = await this.constructor.countDocuments({ 
      challengeId: doc.challengeId, 
      status: 'completed' 
    });
    
    // Calculate average and top scores
    const completedParticipations = await this.constructor.find({ 
      challengeId: doc.challengeId, 
      status: 'completed' 
    }).select('score');
    
    let averageScore = 0;
    let topScore = 0;
    
    if (completedParticipations.length > 0) {
      const scores = completedParticipations.map(p => p.score);
      averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      topScore = Math.max(...scores);
    }
    
    // Update challenge statistics
    challenge.stats = {
      totalParticipants,
      completedParticipants,
      averageScore: Math.round(averageScore * 100) / 100,
      topScore
    };
    
    await challenge.save();
  }
});

// Static method to get leaderboard for a challenge
challengeParticipantSchema.statics.getLeaderboard = function(challengeId, limit = 10) {
  return this.find({
    challengeId,
    status: 'completed'
  })
  .populate('userId', 'username profile.firstName profile.lastName profile.avatar')
  .sort({ score: -1, completedAt: 1 })
  .limit(limit);
};

// Static method to get user's challenge history
challengeParticipantSchema.statics.getUserChallengeHistory = function(userId, options = {}) {
  const query = { userId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('challengeId', 'title type requirements.difficulty requirements.category')
    .sort({ completedAt: -1 })
    .limit(options.limit || 20);
};

// Instance method to start a new attempt
challengeParticipantSchema.methods.startNewAttempt = function() {
  this.attempts += 1;
  this.currentAttempt = {
    startedAt: new Date(),
    progress: 0,
    responses: []
  };
  this.status = 'in_progress';
  return this.save();
};

// Instance method to submit response to current attempt
challengeParticipantSchema.methods.submitResponse = function(questionId, answer, isCorrect, timeSpent) {
  this.currentAttempt.responses.push({
    questionId,
    answer,
    isCorrect,
    timeSpent,
    submittedAt: new Date()
  });
  
  // Update progress
  const totalQuestions = this.currentAttempt.responses.length; // This should be dynamic based on challenge
  this.currentAttempt.progress = (this.currentAttempt.responses.length / totalQuestions) * 100;
  
  return this.save();
};

// Instance method to complete the challenge
challengeParticipantSchema.methods.completeChallenge = function(finalScore, maxScore) {
  this.status = 'completed';
  this.score = finalScore;
  this.maxScore = maxScore;
  this.completedAt = new Date();
  
  // Calculate total time spent
  if (this.currentAttempt.startedAt) {
    this.timeSpent = Math.floor((Date.now() - this.currentAttempt.startedAt) / 60000);
  }
  
  return this.save();
};

// Helper function to generate verification code
function generateVerificationCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = mongoose.model('ChallengeParticipant', challengeParticipantSchema);