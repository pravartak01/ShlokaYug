const mongoose = require('mongoose');

// Enhanced Enrollment Schema for Phase 2: Payment & Device Management
const enrollmentSchema = new mongoose.Schema({
  // Core enrollment information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
    index: true
  },
  guruId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Guru ID is required'],
    index: true
  },
  enrollmentType: {
    type: String,
    enum: ['subscription', 'one_time'],
    required: [true, 'Enrollment type is required']
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
    index: true
  },

  // Payment information
  payment: {
    paymentId: {
      type: String,
      required: [true, 'Payment ID is required'],
      unique: true,
      index: true
    },
    orderId: {
      type: String,
      required: [true, 'Order ID is required']
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Payment amount cannot be negative']
    },
    currency: {
      type: String,
      enum: ['INR', 'USD'],
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet'],
      required: true
    },
    razorpaySignature: {
      type: String,
      required: true
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    
    // Revenue sharing calculation
    revenueShare: {
      totalAmount: {
        type: Number,
        required: true
      },
      guruAmount: {
        type: Number,
        required: true,
        validate: {
          validator: function() {
            // Guru gets 80% of the amount
            return Math.abs(this.revenueShare.guruAmount - (this.payment.amount * 0.8)) < 0.01;
          },
          message: 'Guru amount should be 80% of total amount'
        }
      },
      platformAmount: {
        type: Number,
        required: true,
        validate: {
          validator: function() {
            // Platform gets 20% of the amount
            return Math.abs(this.revenueShare.platformAmount - (this.payment.amount * 0.2)) < 0.01;
          },
          message: 'Platform amount should be 20% of total amount'
        }
      },
      processingFee: {
        type: Number,
        default: 0,
        min: [0, 'Processing fee cannot be negative']
      },
      calculatedAt: {
        type: Date,
        default: Date.now
      }
    }
  },

  // Subscription management
  subscription: {
    startDate: {
      type: Date,
      required: function() {
        return this.enrollmentType === 'subscription';
      },
      validate: {
        validator: function(date) {
          return !date || date <= new Date();
        },
        message: 'Start date cannot be in the future'
      }
    },
    endDate: {
      type: Date,
      required: function() {
        return this.enrollmentType === 'subscription';
      },
      validate: {
        validator: function(date) {
          if (!date || !this.subscription.startDate) return true;
          return date > this.subscription.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'paused'],
      default: function() {
        return this.enrollmentType === 'subscription' ? 'active' : undefined;
      },
      required: function() {
        return this.enrollmentType === 'subscription';
      },
      index: true
    },
    renewalDate: {
      type: Date,
      required: function() {
        return this.enrollmentType === 'subscription' && this.subscription.status === 'active';
      },
      index: true
    },
    autoRenew: {
      type: Boolean,
      default: true
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: function() {
        return this.enrollmentType === 'subscription';
      }
    }
  },

  // Device access control
  access: {
    deviceLimit: {
      type: Number,
      default: 3,
      min: [1, 'Device limit must be at least 1'],
      max: [10, 'Device limit cannot exceed 10']
    },
    currentDevices: [{
      deviceId: {
        type: String,
        required: true,
        trim: true
      },
      deviceInfo: {
        platform: {
          type: String,
          enum: ['web', 'mobile', 'tablet', 'desktop'],
          required: true
        },
        browser: {
          type: String,
          trim: true
        },
        os: {
          type: String,
          trim: true
        },
        userAgent: {
          type: String,
          trim: true
        },
        ipAddress: {
          type: String,
          trim: true
        },
        lastAccess: {
          type: Date,
          default: Date.now
        }
      },
      registeredAt: {
        type: Date,
        default: Date.now
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    expiresAt: {
      type: Date,
      required: function() {
        return this.enrollmentType === 'subscription';
      },
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    accessNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Access notes cannot exceed 500 characters']
    }
  },

  // Progress tracking integration
  progress: {
    overallProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    completedLectures: [{
      lectureId: {
        type: String,
        required: true
      },
      completedAt: {
        type: Date,
        default: Date.now
      },
      timeSpent: {
        type: Number,
        min: 0,
        default: 0
      }
    }],
    totalTimeSpent: {
      type: Number,
      default: 0,
      min: [0, 'Time spent cannot be negative']
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
      index: true
    },
    certificateEligible: {
      type: Boolean,
      default: false
    },
    certificateIssued: {
      type: Boolean,
      default: false
    },
    certificateIssuedAt: {
      type: Date
    }
  },

  // Enrollment status and lifecycle
  status: {
    type: String,
    enum: ['active', 'suspended', 'expired', 'cancelled', 'pending'],
    default: 'pending',
    index: true
  },

  // Metadata and tracking
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'referral', 'direct'],
      default: 'web'
    },
    referralCode: {
      type: String,
      trim: true,
      uppercase: true
    },
    discountApplied: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%']
    },
    campaignId: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
  },

  // Audit trail
  auditLog: [{
    action: {
      type: String,
      required: true,
      enum: ['created', 'payment_completed', 'access_granted', 'device_added', 'device_removed', 'subscription_renewed', 'cancelled', 'suspended', 'reactivated']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
      type: String
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ guruId: 1, status: 1 });
enrollmentSchema.index({ 'subscription.status': 1, 'subscription.renewalDate': 1 });
enrollmentSchema.index({ 'access.expiresAt': 1, 'access.isActive': 1 });
enrollmentSchema.index({ 'payment.status': 1, 'payment.paymentDate': -1 });

// Virtual fields
enrollmentSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.access.expiresAt) return null;
  const now = new Date();
  const expiry = new Date(this.access.expiresAt);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

enrollmentSchema.virtual('isExpired').get(function() {
  if (!this.access.expiresAt) return false;
  return new Date() > new Date(this.access.expiresAt);
});

enrollmentSchema.virtual('activeDeviceCount').get(function() {
  return this.access.currentDevices.filter(device => device.isActive).length;
});

enrollmentSchema.virtual('canAddDevice').get(function() {
  return this.activeDeviceCount < this.access.deviceLimit;
});

// Instance methods
enrollmentSchema.methods.addDevice = function(deviceInfo) {
  if (!this.canAddDevice) {
    throw new Error('Device limit exceeded');
  }
  
  // Check if device already exists
  const existingDevice = this.access.currentDevices.find(
    device => device.deviceId === deviceInfo.deviceId && device.isActive
  );
  
  if (existingDevice) {
    // Update last access time
    existingDevice.deviceInfo.lastAccess = new Date();
    existingDevice.deviceInfo.ipAddress = deviceInfo.ipAddress;
    return existingDevice;
  }
  
  // Add new device
  const newDevice = {
    deviceId: deviceInfo.deviceId,
    deviceInfo: {
      platform: deviceInfo.platform,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      userAgent: deviceInfo.userAgent,
      ipAddress: deviceInfo.ipAddress,
      lastAccess: new Date()
    },
    registeredAt: new Date(),
    isActive: true
  };
  
  this.access.currentDevices.push(newDevice);
  return newDevice;
};

enrollmentSchema.methods.removeDevice = function(deviceId) {
  const device = this.access.currentDevices.find(d => d.deviceId === deviceId);
  if (device) {
    device.isActive = false;
    return true;
  }
  return false;
};

enrollmentSchema.methods.validateAccess = function(deviceId = null) {
  // Check if enrollment is active
  if (this.status !== 'active' || !this.access.isActive) {
    return { valid: false, reason: 'Enrollment not active' };
  }
  
  // Check expiration for subscriptions
  if (this.access.expiresAt && this.isExpired) {
    return { valid: false, reason: 'Access expired' };
  }
  
  // Check device access if deviceId provided
  if (deviceId) {
    const device = this.access.currentDevices.find(
      d => d.deviceId === deviceId && d.isActive
    );
    
    if (!device) {
      return { valid: false, reason: 'Device not registered' };
    }
    
    // Update last access
    device.deviceInfo.lastAccess = new Date();
  }
  
  return { valid: true, reason: 'Access granted' };
};

enrollmentSchema.methods.calculateRevenue = function() {
  const totalAmount = this.payment.amount;
  const guruAmount = Math.round(totalAmount * 0.8 * 100) / 100; // 80% to guru
  const platformAmount = Math.round(totalAmount * 0.2 * 100) / 100; // 20% to platform
  
  return {
    totalAmount,
    guruAmount,
    platformAmount,
    processingFee: this.payment.revenueShare?.processingFee || 0
  };
};

enrollmentSchema.methods.addAuditLog = function(action, performedBy, details = {}, ipAddress = null) {
  this.auditLog.push({
    action,
    performedBy,
    timestamp: new Date(),
    details,
    ipAddress
  });
};

// Static methods for business logic
enrollmentSchema.statics.findActiveEnrollments = function(userId) {
  return this.find({
    userId,
    status: 'active',
    'access.isActive': true
  }).populate('courseId', 'title instructor metadata.difficulty pricing');
};

enrollmentSchema.statics.findEnrollmentsByGuru = function(guruId, status = null) {
  const filter = { guruId };
  if (status) filter.status = status;
  
  return this.find(filter)
    .populate('userId', 'profile.firstName profile.lastName email')
    .populate('courseId', 'title metadata.category pricing')
    .sort({ enrollmentDate: -1 });
};

enrollmentSchema.statics.findExpiringSubscriptions = function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    enrollmentType: 'subscription',
    'subscription.status': 'active',
    'subscription.renewalDate': { $lte: futureDate },
    'subscription.autoRenew': true
  }).populate('userId courseId');
};

enrollmentSchema.statics.getEnrollmentStats = function(guruId = null, dateRange = null) {
  const matchStage = {};
  
  if (guruId) matchStage.guruId = new mongoose.Types.ObjectId(guruId);
  if (dateRange) {
    matchStage.enrollmentDate = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalEnrollments: { $sum: 1 },
        activeEnrollments: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        totalRevenue: { $sum: '$payment.amount' },
        averageRevenue: { $avg: '$payment.amount' },
        subscriptionEnrollments: {
          $sum: { $cond: [{ $eq: ['$enrollmentType', 'subscription'] }, 1, 0] }
        },
        oneTimeEnrollments: {
          $sum: { $cond: [{ $eq: ['$enrollmentType', 'one_time'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Pre-save middleware
enrollmentSchema.pre('save', function(next) {
  // Calculate revenue share if payment amount changed
  if (this.isModified('payment.amount')) {
    const revenue = this.calculateRevenue();
    this.payment.revenueShare = {
      totalAmount: revenue.totalAmount,
      guruAmount: revenue.guruAmount,
      platformAmount: revenue.platformAmount,
      processingFee: revenue.processingFee,
      calculatedAt: new Date()
    };
  }
  
  // Set expiry date for subscriptions
  if (this.isModified('subscription.endDate') && this.subscription.endDate) {
    this.access.expiresAt = this.subscription.endDate;
  }
  
  // Update status based on expiry
  if (this.access.expiresAt && new Date() > this.access.expiresAt) {
    if (this.enrollmentType === 'subscription') {
      this.subscription.status = 'expired';
    }
    this.status = 'expired';
    this.access.isActive = false;
  }
  
  next();
});

// Post-save middleware for logging
enrollmentSchema.post('save', function(doc) {
  if (this.wasNew) {
    console.log(`New enrollment created: User ${doc.userId} enrolled in course ${doc.courseId}`);
  }
});

// Error handling
enrollmentSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('User is already enrolled in this course'));
  } else {
    next(error);
  }
});

module.exports = mongoose.model('EnrollmentV2', enrollmentSchema);