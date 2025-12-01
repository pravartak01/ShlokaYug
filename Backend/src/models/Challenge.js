/**
 * Challenge Model - Admin-created challenges with rewards and certificates
 */

const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  // Basic Challenge Information
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true,
    maxlength: [100, 'Challenge title cannot exceed 100 characters'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Challenge description is required'],
    maxlength: [1000, 'Challenge description cannot exceed 1000 characters']
  },
  instructions: {
    type: String,
    maxlength: [2000, 'Challenge instructions cannot exceed 2000 characters']
  },
  
  // Challenge Configuration
  type: {
    type: String,
    enum: ['shloka_recitation', 'chandas_analysis', 'translation', 'pronunciation', 'memorization', 'comprehension', 'practice_streak', 'community_engagement'],
    required: [true, 'Challenge type is required'],
    index: true
  },
  
  // Challenge Requirements
  requirements: {
    targetCount: {
      type: Number,
      min: [1, 'Target count must be at least 1'],
      required: function() {
        return ['shloka_recitation', 'translation', 'practice_streak'].includes(this.type);
      }
    },
    accuracy: {
      type: Number,
      min: [0, 'Accuracy cannot be negative'],
      max: [100, 'Accuracy cannot exceed 100%']
    },
    timeLimit: {
      type: Number, // in minutes
      min: [1, 'Time limit must be at least 1 minute']
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    category: {
      type: String,
      enum: ['bhagavad_gita', 'ramayana', 'vedas', 'upanishads', 'puranas', 'general'],
      default: 'general'
    }
  },
  
  // Challenge Status and Timing
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft',
    index: true
  },
  startDate: {
    type: Date,
    required: [true, 'Challenge start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'Challenge end date is required'],
    validate: {
      validator: function(endDate) {
        return endDate > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  
  // Rewards Configuration
  rewards: {
    points: {
      type: Number,
      min: [0, 'Points cannot be negative'],
      default: 0
    },
    badge: {
      name: String,
      description: String,
      icon: String, // URL or icon identifier
      color: {
        type: String,
        default: '#FFD700' // Gold color
      }
    },
    certificate: {
      enabled: {
        type: Boolean,
        default: false
      },
      templateId: String,
      title: String,
      description: String
    },
    leaderboardPosition: {
      first: {
        points: { type: Number, default: 100 },
        badge: String,
        specialReward: String
      },
      second: {
        points: { type: Number, default: 75 },
        badge: String,
        specialReward: String
      },
      third: {
        points: { type: Number, default: 50 },
        badge: String,
        specialReward: String
      },
      participation: {
        points: { type: Number, default: 10 },
        badge: String
      }
    }
  },
  
  // Challenge Creator
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Challenge creator is required'],
    index: true
  },
  
  // Challenge Statistics
  stats: {
    totalParticipants: {
      type: Number,
      default: 0
    },
    completedParticipants: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    topScore: {
      type: Number,
      default: 0
    }
  },
  
  // Challenge Settings
  settings: {
    maxParticipants: {
      type: Number,
      min: [1, 'Max participants must be at least 1']
    },
    allowRetries: {
      type: Boolean,
      default: true
    },
    maxRetries: {
      type: Number,
      min: [1, 'Max retries must be at least 1'],
      default: 3
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true
    },
    autoGradingEnabled: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
challengeSchema.index({ status: 1, startDate: 1, endDate: 1 });
challengeSchema.index({ type: 1, 'requirements.difficulty': 1, 'requirements.category': 1 });
challengeSchema.index({ 'settings.isPublic': 1, status: 1 });

// Virtual for challenge duration in days
challengeSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for checking if challenge is active
challengeSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && this.startDate <= now && this.endDate >= now;
});

// Virtual for checking if challenge is expired
challengeSchema.virtual('isExpired').get(function() {
  return new Date() > this.endDate;
});

// Virtual for completion rate
challengeSchema.virtual('completionRate').get(function() {
  if (this.stats.totalParticipants === 0) return 0;
  return ((this.stats.completedParticipants / this.stats.totalParticipants) * 100).toFixed(2);
});

// Pre-save middleware to validate dates and update status
challengeSchema.pre('save', function(next) {
  const now = new Date();
  
  // Auto-update status based on dates
  if (this.status === 'active') {
    if (now < this.startDate) {
      this.status = 'draft';
    } else if (now > this.endDate) {
      this.status = 'completed';
    }
  }
  
  // Ensure certificate title if certificate is enabled
  if (this.rewards.certificate.enabled && !this.rewards.certificate.title) {
    this.rewards.certificate.title = `${this.title} - Certificate of Completion`;
  }
  
  next();
});

// Static method to get active challenges
challengeSchema.statics.getActiveChallenges = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now },
    'settings.isPublic': true
  }).populate('createdBy', 'profile.firstName profile.lastName');
};

// Static method to get upcoming challenges
challengeSchema.statics.getUpcomingChallenges = function() {
  const now = new Date();
  return this.find({
    status: 'draft',
    startDate: { $gt: now },
    'settings.isPublic': true
  }).populate('createdBy', 'profile.firstName profile.lastName');
};

// Instance method to calculate user's rank in challenge
challengeSchema.methods.getUserRank = async function(userId) {
  const ChallengeParticipant = mongoose.model('ChallengeParticipant');
  const participants = await ChallengeParticipant.find({
    challengeId: this._id,
    status: 'completed'
  }).sort({ score: -1, completedAt: 1 });
  
  const userIndex = participants.findIndex(p => p.userId.toString() === userId.toString());
  return userIndex >= 0 ? userIndex + 1 : null;
};

// Instance method to check if user can participate
challengeSchema.methods.canUserParticipate = async function(userId) {
  if (!this.isActive) return { canParticipate: false, reason: 'Challenge is not active' };
  
  if (this.settings.maxParticipants) {
    if (this.stats.totalParticipants >= this.settings.maxParticipants) {
      return { canParticipate: false, reason: 'Maximum participants reached' };
    }
  }
  
  const ChallengeParticipant = mongoose.model('ChallengeParticipant');
  const existingParticipation = await ChallengeParticipant.findOne({
    challengeId: this._id,
    userId
  });
  
  if (existingParticipation) {
    if (existingParticipation.status === 'completed') {
      return { canParticipate: false, reason: 'Already completed this challenge' };
    }
    if (!this.settings.allowRetries && existingParticipation.attempts > 0) {
      return { canParticipate: false, reason: 'Retries not allowed' };
    }
    if (existingParticipation.attempts >= this.settings.maxRetries) {
      return { canParticipate: false, reason: 'Maximum attempts exceeded' };
    }
  }
  
  return { canParticipate: true };
};

module.exports = mongoose.model('Challenge', challengeSchema);