/**
 * User Model - For Students and Regular Users Only
 * Guru functionality moved to separate Guru model
 * This model now focuses solely on student/learner functionality
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in query results by default
  },
  profile: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    avatar: {
      type: String,
      default: null
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function(dob) {
          return !dob || dob < Date.now();
        },
        message: 'Date of birth cannot be in the future'
      }
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      required: false
    },
    phoneNumber: {
      type: String,
      match: [
        /^[\+]?[1-9][\d]{0,15}$/,
        'Please provide a valid phone number'
      ]
    },
    location: {
      country: String,
      state: String,
      city: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    interests: [{
      type: String,
      enum: [
        'vedic_chanting',
        'sanskrit_grammar', 
        'shloka_composition',
        'chandas_prosody',
        'classical_texts',
        'bhagavad_gita',
        'ramayana',
        'mahabharata',
        'upanishads',
        'puranas',
        'ayurveda',
        'jyotisha_astrology',
        'yoga_philosophy',
        'meditation',
        'music',
        'dance',
        'art',
        'philosophy',
        'other'
      ]
    }],
    languagesKnown: [{
      language: String,
      proficiency: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'native']
      }
    }]
  },
  
  role: {
    type: String,
    enum: ['student', 'admin', 'moderator'],
    default: 'student'
  },

  // Enhanced student profile for LMS
  studentProfile: {
    learningGoals: [{
      goal: {
        type: String,
        trim: true,
        maxlength: [200, 'Learning goal cannot exceed 200 characters']
      },
      targetDate: Date,
      priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
      },
      status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'paused'],
        default: 'not_started'
      },
      progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      }
    }],
    
    preferences: {
      learningStyle: {
        type: String,
        enum: ['visual', 'auditory', 'kinesthetic', 'reading'],
        default: 'visual'
      },
      studyReminders: {
        enabled: {
          type: Boolean,
          default: true
        },
        frequency: {
          type: String,
          enum: ['daily', 'weekly', 'custom'],
          default: 'daily'
        },
        preferredTime: String // HH:MM format
      },
      difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
      }
    },
    
    progress: {
      currentLevel: {
        type: Number,
        default: 1
      },
      experiencePoints: {
        type: Number,
        default: 0
      },
      streakDays: {
        type: Number,
        default: 0
      },
      lastStudyDate: Date,
      totalStudyTime: {
        type: Number,
        default: 0 // in minutes
      },
      coursesCompleted: {
        type: Number,
        default: 0
      },
      certificatesEarned: [{
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course'
        },
        earnedDate: Date,
        certificateUrl: String
      }]
    }
  },

  // Enrollment and course history
  enrollments: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped', 'paused'],
      default: 'active'
    },
    progress: {
      completedLessons: [String],
      currentLesson: String,
      totalProgress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      timeSpent: {
        type: Number,
        default: 0 // in minutes
      },
      lastAccessedAt: Date
    },
    assignments: [{
      assignmentId: String,
      submittedAt: Date,
      score: Number,
      feedback: String
    }],
    notes: [{
      lesson: String,
      note: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  }],

  // Social features 
  social: {
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    followersCount: {
      type: Number,
      default: 0
    },
    followingCount: {
      type: Number,
      default: 0
    },
    postsCount: {
      type: Number,
      default: 0
    }
  },

  // Community engagement
  community: {
    reputation: {
      type: Number,
      default: 0
    },
    badges: [{
      type: String,
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }],
    contributions: {
      questionsAsked: {
        type: Number,
        default: 0
      },
      answersProvided: {
        type: Number,
        default: 0
      },
      helpfulVotes: {
        type: Number,
        default: 0
      }
    }
  },

  // Verification status
  verification: {
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerifiedAt: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    phoneVerificationCode: String,
    phoneVerificationExpires: Date
  },

  // Account settings and security
  settings: {
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public'
      },
      showEmail: {
        type: Boolean,
        default: false
      },
      showPhone: {
        type: Boolean,
        default: false
      }
    },
    notifications: {
      email: {
        courseUpdates: {
          type: Boolean,
          default: true
        },
        communityActivity: {
          type: Boolean,
          default: true
        },
        marketing: {
          type: Boolean,
          default: false
        }
      },
      push: {
        studyReminders: {
          type: Boolean,
          default: true
        },
        newContent: {
          type: Boolean,
          default: true
        }
      }
    }
  },

  // Payment and subscription
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired'],
      default: 'active'
    },
    startDate: Date,
    endDate: Date,
    renewalDate: Date,
    paymentHistory: [{
      amount: Number,
      currency: {
        type: String,
        default: 'INR'
      },
      paymentDate: Date,
      transactionId: String,
      status: String
    }]
  },

  // Account status and metadata
  metadata: {
    isActive: {
      type: Boolean,
      default: true
    },
    accountCreated: {
      type: Date,
      default: Date.now
    },
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0
    },
    ipAddress: String,
    userAgent: String,
    deviceInfo: {
      platform: String,
      browser: String,
      version: String
    },
    source: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web'
    },
    utmSource: String,
    utmMedium: String,
    utmCampaign: String
  },

  // Security settings
  security: {
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,
    loginAttempts: {
      count: {
        type: Number,
        default: 0
      },
      lastAttempt: Date,
      lockedUntil: Date
    },
    twoFactorAuth: {
      enabled: {
        type: Boolean,
        default: false
      },
      secret: String,
      backupCodes: [String]
    },
    sessionTokens: [{
      token: String,
      createdAt: {
        type: Date,
        default: Date.now
      },
      expiresAt: Date,
      deviceInfo: String
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ 'profile.location.coordinates': '2dsphere' });
userSchema.index({ 'metadata.isActive': 1 });
userSchema.index({ role: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Virtual for age
userSchema.virtual('age').get(function() {
  if (!this.profile.dateOfBirth) return null;
  return Math.floor((Date.now() - this.profile.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update password change timestamp
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  this.security.passwordChangedAt = Date.now() - 1000;
  next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to generate JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      role: this.role 
    }, 
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Instance method to check if password changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.security.passwordChangedAt) {
    const changedTimestamp = parseInt(this.security.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to create password reset token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  this.security.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  // Set expire
  this.security.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  // Generate random token
  const verifyToken = crypto.randomBytes(20).toString('hex');

  // Hash and set verification token
  this.verification.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verifyToken)
    .digest('hex');

  // Set token expiry (24 hours)
  this.verification.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  return verifyToken;
};

// Method to apply to become a guru
userSchema.methods.applyForGuru = function(credentials, experience) {
  this.guruProfile.applicationStatus = 'pending';
  this.guruProfile.credentials = credentials;
  this.guruProfile.experience = experience;
  this.guruProfile.verification.applicationDate = new Date();
  return this.save();
};

// Static method to get active users
userSchema.statics.getActiveUsers = function() {
  return this.find({ 'metadata.isActive': true });
};

// Static method to get users by location
userSchema.statics.getUsersByLocation = function(coordinates, maxDistance = 1000) {
  return this.find({
    'profile.location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance * 1000 // Convert km to meters
      }
    }
  });
};

module.exports = mongoose.model('User', userSchema);