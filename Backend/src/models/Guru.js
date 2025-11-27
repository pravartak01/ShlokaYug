/**
 * Guru Model - Separate from regular Users
 * Handles teachers/instructors who need admin verification
 * This separates the guru application and approval process
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const guruSchema = new mongoose.Schema({
  // Basic Authentication Info
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username cannot exceed 50 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
    index: true
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    index: true
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  
  // Personal Information
  profile: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    phoneNumber: {
      type: String,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number']
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    profilePicture: String,
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters']
    },
    location: {
      country: String,
      state: String,
      city: String
    }
  },
  
  // Guru-Specific Professional Information
  credentials: {
    education: [{
      degree: {
        type: String,
        required: [true, 'Degree is required for guru application']
      },
      institution: {
        type: String,
        required: [true, 'Institution is required']
      },
      year: {
        type: Number,
        min: [1950, 'Invalid graduation year'],
        max: [new Date().getFullYear(), 'Future graduation year not allowed']
      },
      fieldOfStudy: String,
      documents: [String] // URLs to uploaded certificates
    }],
    
    certifications: [{
      name: String,
      issuingOrganization: String,
      issueDate: Date,
      expiryDate: Date,
      credentialId: String,
      documentUrl: String
    }],
    
    teachingExperience: {
      totalYears: {
        type: Number,
        min: [0, 'Experience cannot be negative'],
        required: [true, 'Teaching experience is required']
      },
      previousInstitutions: [{
        name: String,
        position: String,
        duration: String,
        responsibilities: String
      }]
    }
  },
  
  // Specializations and Expertise
  expertise: {
    subjects: [{
      type: String,
      enum: [
        'sanskrit-grammar',
        'vedic-chanting',
        'chandas-prosody',
        'shloka-composition',
        'classical-literature',
        'vedic-literature',
        'bhagavad-gita',
        'ramayana',
        'mahabharata',
        'upanishads',
        'puranas',
        'ayurveda',
        'jyotisha',
        'yoga-philosophy',
        'meditation',
        'other'
      ]
    }],
    
    specializations: [String], // Free text for specific areas
    
    languagesKnown: [{
      language: String,
      proficiency: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'native']
      }
    }],
    
    teachingStyle: {
      type: String,
      enum: ['traditional', 'modern', 'hybrid'],
      default: 'hybrid'
    },
    
    preferredStudentLevel: [{
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all-levels']
    }]
  },
  
  // Application and Verification Status
  applicationStatus: {
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under-review', 'approved', 'rejected', 'suspended'],
      default: 'draft'
    },
    submittedAt: Date,
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Admin who reviewed
    },
    rejectionReason: String,
    approvalNotes: String,
    
    // Internal admin notes
    adminNotes: [{
      note: String,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Verification Details
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
    phoneVerificationExpires: Date,
    
    // Document verification by admin
    documentsVerified: {
      type: Boolean,
      default: false
    },
    documentsVerifiedAt: Date,
    documentsVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Account Management
  accountStatus: {
    isActive: {
      type: Boolean,
      default: true
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    canCreateContent: {
      type: Boolean,
      default: false
    },
    canTeach: {
      type: Boolean,
      default: false
    },
    suspensionReason: String,
    suspendedAt: Date,
    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Teaching Preferences and Settings
  teachingPreferences: {
    availability: {
      timezone: String,
      preferredDays: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }],
      preferredTimeSlots: [{
        start: String, // "09:00"
        end: String    // "17:00"
      }]
    },
    
    classSize: {
      min: {
        type: Number,
        default: 1
      },
      max: {
        type: Number,
        default: 50
      }
    },
    
    teachingModes: [{
      type: String,
      enum: ['online', 'offline', 'hybrid']
    }]
  },
  
  // Performance and Analytics
  performance: {
    totalStudents: {
      type: Number,
      default: 0
    },
    totalCourses: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    totalTeachingHours: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // Security and Authentication
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
      secret: String
    }
  },
  
  // Metadata
  metadata: {
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastLogin: Date,
    lastActivity: Date,
    ipAddress: String,
    userAgent: String,
    source: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web'
    }
  },
  
  // Social and Community
  social: {
    website: String,
    linkedin: String,
    youtube: String,
    facebook: String,
    instagram: String,
    twitter: String
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
guruSchema.index({ email: 1 }, { unique: true });
guruSchema.index({ username: 1 }, { unique: true });
guruSchema.index({ 'applicationStatus.status': 1 });
guruSchema.index({ 'accountStatus.isApproved': 1 });
guruSchema.index({ 'expertise.subjects': 1 });
guruSchema.index({ createdAt: -1 });

// Virtual for full name
guruSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Virtual for application age
guruSchema.virtual('applicationAge').get(function() {
  if (this.applicationStatus.submittedAt) {
    return Math.floor((Date.now() - this.applicationStatus.submittedAt) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Pre-save middleware to hash password
guruSchema.pre('save', async function(next) {
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
guruSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  this.security.passwordChangedAt = Date.now() - 1000;
  next();
});

// Instance method to check password
guruSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password changed after JWT was issued
guruSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.security.passwordChangedAt) {
    const changedTimestamp = parseInt(this.security.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to create password reset token
guruSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.security.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.security.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Instance method to create email verification token
guruSchema.methods.createEmailVerificationToken = function() {
  const verifyToken = crypto.randomBytes(32).toString('hex');
  
  this.verification.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verifyToken)
    .digest('hex');
    
  this.verification.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verifyToken;
};

// Instance method to submit application
guruSchema.methods.submitApplication = function() {
  this.applicationStatus.status = 'submitted';
  this.applicationStatus.submittedAt = new Date();
};

// Instance method to approve guru
guruSchema.methods.approve = function(adminId, notes = '') {
  this.applicationStatus.status = 'approved';
  this.applicationStatus.reviewedAt = new Date();
  this.applicationStatus.reviewedBy = adminId;
  this.applicationStatus.approvalNotes = notes;
  this.accountStatus.isApproved = true;
  this.accountStatus.canCreateContent = true;
  this.accountStatus.canTeach = true;
};

// Instance method to reject guru
guruSchema.methods.reject = function(adminId, reason) {
  this.applicationStatus.status = 'rejected';
  this.applicationStatus.reviewedAt = new Date();
  this.applicationStatus.reviewedBy = adminId;
  this.applicationStatus.rejectionReason = reason;
};

// Static method to get pending applications
guruSchema.statics.getPendingApplications = function() {
  return this.find({ 'applicationStatus.status': 'submitted' })
    .sort({ 'applicationStatus.submittedAt': 1 });
};

// Static method to get approved gurus
guruSchema.statics.getApprovedGurus = function() {
  return this.find({ 'accountStatus.isApproved': true });
};

module.exports = mongoose.model('Guru', guruSchema);