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
        validator: function(date) {
          return date < new Date();
        },
        message: 'Date of birth must be in the past'
      }
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function(phone) {
          return !phone || /^[\+]?[1-9][\d]{0,15}$/.test(phone);
        },
        message: 'Please provide a valid phone number'
      }
    },
    preferredScript: {
      type: String,
      enum: ['devanagari', 'iast', 'bengali', 'gujarati', 'telugu'],
      default: 'devanagari'
    },
    nativeLanguage: {
      type: String,
      trim: true,
      maxlength: [50, 'Native language cannot exceed 50 characters']
    },
    learningGoals: [{
      type: String,
      trim: true,
      maxlength: [100, 'Each learning goal cannot exceed 100 characters']
    }]
  },
  role: {
    type: String,
    enum: ['student', 'guru', 'admin', 'moderator'],
    default: 'student'
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'guru'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'trial'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: function() {
        // Free plan never expires, others get 30 days by default
        return this.subscription?.plan === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
    },
    paymentDetails: {
      provider: {
        type: String,
        enum: ['razorpay', 'stripe', 'manual']
      },
      subscriptionId: String,
      lastPayment: Date,
      amount: {
        type: Number,
        min: 0
      },
      currency: {
        type: String,
        default: 'INR'
      }
    }
  },
  gamification: {
    level: {
      type: Number,
      default: 1,
      min: 1
    },
    totalXP: {
      type: Number,
      default: 0,
      min: 0
    },
    currentXP: {
      type: Number,
      default: 0,
      min: 0
    },
    xpToNextLevel: {
      type: Number,
      default: 100,
      min: 0
    },
    badges: [{
      badgeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge'
      },
      earnedAt: {
        type: Date,
        default: Date.now
      },
      category: String
    }],
    streaks: {
      current: {
        type: Number,
        default: 0,
        min: 0
      },
      longest: {
        type: Number,
        default: 0,
        min: 0
      },
      lastActivity: {
        type: Date,
        default: Date.now
      }
    },
    achievements: [{
      achievementId: String,
      unlockedAt: {
        type: Date,
        default: Date.now
      },
      progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      }
    }]
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      dailyReminders: {
        type: Boolean,
        default: true
      },
      newContent: {
        type: Boolean,
        default: true
      },
      community: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'followers', 'private'],
        default: 'public'
      },
      showProgress: {
        type: Boolean,
        default: true
      },
      allowMessages: {
        type: Boolean,
        default: true
      }
    },
    audio: {
      autoplay: {
        type: Boolean,
        default: false
      },
      defaultSpeed: {
        type: Number,
        default: 1.0,
        min: 0.5,
        max: 2.0
      },
      backgroundAudio: {
        type: Boolean,
        default: false
      }
    }
  },
  socialAuth: {
    googleId: String,
    facebookId: String,
    appleId: String
  },
  verification: {
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  metadata: {
    lastLogin: {
      type: Date,
      default: Date.now
    },
    loginCount: {
      type: Number,
      default: 0,
      min: 0
    },
    accountCreated: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    bannedUntil: Date,
    banReason: String
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'socialAuth.googleId': 1 }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ 'subscription.status': 1 });
userSchema.index({ 'metadata.isActive': 1 });
userSchema.index({ 'gamification.totalXP': -1 });

// Virtual for full name
userSchema.virtual('profile.fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Virtual for subscription status
userSchema.virtual('isSubscriptionActive').get(function() {
  if (this.subscription.plan === 'free') return true;
  return this.subscription.status === 'active' && 
         (!this.subscription.endDate || this.subscription.endDate > new Date());
});

// Virtual for account age
userSchema.virtual('accountAge').get(function() {
  const now = new Date();
  const created = this.metadata.accountCreated;
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's new or modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update XP level calculation
userSchema.pre('save', function(next) {
  if (this.isModified('gamification.totalXP')) {
    // Simple level calculation: level = floor(sqrt(totalXP / 100)) + 1
    const newLevel = Math.floor(Math.sqrt(this.gamification.totalXP / 100)) + 1;
    const currentLevelXP = Math.pow(newLevel - 1, 2) * 100;
    const nextLevelXP = Math.pow(newLevel, 2) * 100;
    
    this.gamification.level = newLevel;
    this.gamification.currentXP = this.gamification.totalXP - currentLevelXP;
    this.gamification.xpToNextLevel = nextLevelXP - this.gamification.totalXP;
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  const payload = {
    id: this._id,
    email: this.email,
    username: this.username,
    role: this.role
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
  const payload = {
    id: this._id,
    type: 'refresh'
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  });
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  // Generate random token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash and set reset token
  this.verification.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set token expiry (10 minutes)
  this.verification.passwordResetExpires = Date.now() + 10 * 60 * 1000;

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

// Method to add XP
userSchema.methods.addXP = function(points) {
  this.gamification.totalXP += points;
  
  // Update streak if activity is today
  const today = new Date();
  const lastActivity = this.gamification.streaks.lastActivity;
  const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) {
    // Continue streak
    this.gamification.streaks.current += 1;
    this.gamification.streaks.longest = Math.max(
      this.gamification.streaks.longest,
      this.gamification.streaks.current
    );
  } else if (daysDiff > 1) {
    // Streak broken
    this.gamification.streaks.current = 1;
  }
  // If daysDiff === 0, it's the same day, don't change streak
  
  this.gamification.streaks.lastActivity = today;
  return this.save();
};

// Method to check if user can access feature
userSchema.methods.canAccessFeature = function(feature) {
  const featurePermissions = {
    'advanced_analytics': ['premium', 'guru'],
    'unlimited_uploads': ['premium', 'guru'],
    'create_courses': ['guru'],
    'moderate_content': ['admin', 'moderator'],
    'access_admin_panel': ['admin']
  };

  const allowedPlans = featurePermissions[feature];
  if (!allowedPlans) return true; // Feature not restricted

  // Check subscription
  if (allowedPlans.includes(this.subscription.plan) && this.isSubscriptionActive) {
    return true;
  }

  // Check role-based access
  return allowedPlans.includes(this.role);
};

// Static method to find by email or username
userSchema.statics.findByIdentifier = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ],
    'metadata.isActive': true
  });
};

// Static method to get leaderboard
userSchema.statics.getLeaderboard = function(limit = 10, type = 'xp') {
  const sortField = type === 'xp' ? 'gamification.totalXP' : 'gamification.streaks.longest';
  
  return this.find(
    { 'metadata.isActive': true },
    'username profile.firstName profile.lastName profile.avatar gamification.level gamification.totalXP gamification.streaks'
  )
  .sort({ [sortField]: -1 })
  .limit(limit);
};

module.exports = mongoose.model('User', userSchema);