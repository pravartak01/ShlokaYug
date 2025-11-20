const mongoose = require('mongoose');

// Schema to manage course enrollments and subscriptions
const enrollmentSchema = new mongoose.Schema({
  // Core identification
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
  
  // Enrollment type and payment information
  enrollmentType: {
    type: String,
    required: [true, 'Enrollment type is required'],
    enum: ['one_time_purchase', 'monthly_subscription', 'yearly_subscription'],
    index: true
  },
  
  payment: {
    // Payment gateway information
    paymentId: {
      type: String,
      required: [true, 'Payment ID is required'],
      unique: true,
      index: true
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    
    // Amount details
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR']
    },
    
    // Discount information
    discountApplied: {
      code: String,
      type: {
        type: String,
        enum: ['percentage', 'fixed']
      },
      value: Number,
      discountAmount: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    
    originalAmount: {
      type: Number, // Before discount
      min: [0, 'Original amount cannot be negative']
    },
    
    // Payment status and tracking
    status: {
      type: String,
      required: [true, 'Payment status is required'],
      enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
      index: true
    },
    
    paidAt: Date,
    failedAt: Date,
    failureReason: String,
    
    // Refund information
    refund: {
      amount: {
        type: Number,
        default: 0,
        min: 0
      },
      reason: {
        type: String,
        maxlength: [500, 'Refund reason cannot exceed 500 characters']
      },
      requestedAt: Date,
      processedAt: Date,
      refundId: String,
      status: {
        type: String,
        enum: ['none', 'requested', 'approved', 'processed', 'rejected'],
        default: 'none'
      }
    }
  },
  
  // Subscription-specific information (for subscription types)
  subscription: {
    // Subscription lifecycle
    startDate: {
      type: Date,
      required: function() {
        return this.enrollmentType.includes('subscription');
      }
    },
    endDate: {
      type: Date,
      required: function() {
        return this.enrollmentType.includes('subscription');
      }
    },
    nextBillingDate: Date,
    
    // Subscription status
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'paused', 'grace_period'],
      default: function() {
        return this.enrollmentType.includes('subscription') ? 'active' : undefined;
      }
    },
    
    // Cancellation information
    cancellation: {
      requestedAt: Date,
      effectiveDate: Date,
      reason: {
        type: String,
        enum: ['user_request', 'payment_failure', 'admin_action', 'policy_violation'],
      },
      userReason: {
        type: String,
        maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
      },
      allowReactivation: {
        type: Boolean,
        default: true
      }
    },
    
    // Auto-renewal settings
    autoRenew: {
      type: Boolean,
      default: true
    },
    renewalAttempts: {
      type: Number,
      default: 0,
      min: 0
    },
    lastRenewalAttempt: Date,
    
    // Subscription history
    renewalHistory: [{
      renewedAt: {
        type: Date,
        default: Date.now
      },
      amount: Number,
      paymentId: String,
      status: {
        type: String,
        enum: ['success', 'failed'],
        required: true
      },
      failureReason: String,
      periodStart: Date,
      periodEnd: Date
    }],
    
    // Grace period for failed payments
    gracePeriod: {
      isActive: {
        type: Boolean,
        default: false
      },
      startDate: Date,
      endDate: Date,
      attempts: {
        type: Number,
        default: 0,
        min: 0
      }
    }
  },
  
  // Access control and permissions
  access: {
    status: {
      type: String,
      enum: ['active', 'expired', 'suspended', 'revoked'],
      default: 'active',
      index: true
    },
    grantedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: function() {
        return this.enrollmentType.includes('subscription');
      }
    },
    lastAccessedAt: Date,
    
    // Content access tracking
    accessibleContent: {
      allContent: {
        type: Boolean,
        default: true
      },
      specificUnits: [String], // unit IDs if access is limited
      restrictedContent: [String], // content IDs that are restricted
    },
    
    // Device and location tracking
    accessDevices: [{
      deviceId: String,
      deviceType: {
        type: String,
        enum: ['mobile', 'tablet', 'desktop', 'tv']
      },
      platform: {
        type: String,
        enum: ['ios', 'android', 'web', 'windows', 'macos', 'linux']
      },
      lastUsed: Date,
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    
    maxConcurrentDevices: {
      type: Number,
      default: 3,
      min: 1,
      max: 10
    }
  },
  
  // Communication and notifications
  notifications: {
    enrollmentConfirmation: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    },
    
    welcomeMessage: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      guruMessageIncluded: {
        type: Boolean,
        default: false
      }
    },
    
    paymentReminders: [{
      type: {
        type: String,
        enum: ['upcoming_renewal', 'payment_failed', 'grace_period', 'cancellation_warning']
      },
      sentAt: Date,
      scheduledFor: Date,
      status: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'cancelled']
      }
    }],
    
    courseUpdates: {
      newContent: {
        type: Boolean,
        default: true
      },
      progressReminders: {
        type: Boolean,
        default: true
      },
      achievements: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Enrollment statistics and analytics
  analytics: {
    // Source tracking
    enrollmentSource: {
      type: String,
      enum: ['web', 'mobile_app', 'referral', 'social_media', 'search', 'direct', 'promotion'],
      default: 'direct'
    },
    referralCode: String,
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Marketing attribution
    utmParameters: {
      source: String,
      medium: String,
      campaign: String,
      term: String,
      content: String
    },
    
    // Engagement metrics
    totalLoginDays: {
      type: Number,
      default: 0,
      min: 0
    },
    firstContentAccess: Date,
    lastActivityDate: Date,
    
    // Learning patterns
    preferredStudyTimes: [{
      hour: {
        type: Number,
        min: 0,
        max: 23
      },
      frequency: {
        type: Number,
        default: 1,
        min: 0
      }
    }],
    
    studyPattern: {
      type: String,
      enum: ['morning_learner', 'evening_learner', 'weekend_warrior', 'consistent_daily', 'binge_learner'],
      default: 'consistent_daily'
    },
    
    // Completion prediction
    completionLikelihood: {
      type: Number, // 0-100 score
      min: 0,
      max: 100,
      default: 50
    },
    riskFactors: [{
      type: String,
      enum: ['low_engagement', 'payment_issues', 'slow_progress', 'no_recent_activity'],
      detectedAt: Date
    }]
  },
  
  // Course-specific settings and preferences
  courseSettings: {
    language: {
      type: String,
      enum: ['english', 'hindi', 'sanskrit', 'auto'],
      default: 'auto'
    },
    
    playbackPreferences: {
      defaultSpeed: {
        type: Number,
        default: 1.0,
        min: 0.25,
        max: 3.0
      },
      autoplay: {
        type: Boolean,
        default: false
      },
      subtitles: {
        type: Boolean,
        default: false
      }
    },
    
    learningGoals: {
      weeklyTarget: {
        type: Number, // minutes per week
        default: 120,
        min: 0
      },
      completionDeadline: Date,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
      }
    },
    
    practiceSettings: {
      reminderFrequency: {
        type: String,
        enum: ['none', 'daily', 'weekly', 'custom'],
        default: 'daily'
      },
      difficultyLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'adaptive'],
        default: 'adaptive'
      },
      pronunciationFeedback: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ guruId: 1, 'payment.status': 1 });
enrollmentSchema.index({ enrollmentType: 1, 'access.status': 1 });
enrollmentSchema.index({ 'subscription.status': 1, 'subscription.nextBillingDate': 1 });
enrollmentSchema.index({ 'payment.paymentId': 1 });
enrollmentSchema.index({ createdAt: -1 });
enrollmentSchema.index({ 'analytics.lastActivityDate': -1 });

// Text search index
enrollmentSchema.index({
  'payment.paymentId': 'text'
});

// Virtual for subscription days remaining
enrollmentSchema.virtual('daysRemaining').get(function() {
  if (this.enrollmentType === 'one_time_purchase') return null;
  if (!this.subscription.endDate) return null;
  
  const now = new Date();
  const endDate = new Date(this.subscription.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
});

// Virtual for active status
enrollmentSchema.virtual('isActive').get(function() {
  if (this.access.status !== 'active') return false;
  if (this.payment.status !== 'completed') return false;
  
  if (this.enrollmentType.includes('subscription')) {
    return this.subscription.status === 'active' && 
           (!this.subscription.endDate || new Date() < this.subscription.endDate);
  }
  
  return true; // One-time purchases are always active if payment completed
});

// Virtual for next billing amount
enrollmentSchema.virtual('nextBillingAmount').get(function() {
  if (this.enrollmentType === 'one_time_purchase') return null;
  return this.payment.amount; // Same amount for renewal
});

// Method to process enrollment
enrollmentSchema.methods.processEnrollment = async function() {
  if (this.payment.status !== 'completed') {
    throw new Error('Cannot process enrollment without completed payment');
  }
  
  // Set access permissions
  this.access.status = 'active';
  this.access.grantedAt = new Date();
  
  // Set subscription dates if applicable
  if (this.enrollmentType.includes('subscription')) {
    const now = new Date();
    this.subscription.startDate = now;
    this.subscription.status = 'active';
    
    if (this.enrollmentType === 'monthly_subscription') {
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      this.subscription.endDate = nextMonth;
      this.subscription.nextBillingDate = nextMonth;
    } else if (this.enrollmentType === 'yearly_subscription') {
      const nextYear = new Date(now);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      this.subscription.endDate = nextYear;
      this.subscription.nextBillingDate = nextYear;
    }
  }
  
  // Record first content access
  if (!this.analytics.firstContentAccess) {
    this.analytics.firstContentAccess = new Date();
  }
  
  return this.save();
};

// Method to cancel subscription
enrollmentSchema.methods.cancelSubscription = function(reason, userReason, effectiveImmediately = false) {
  if (this.enrollmentType === 'one_time_purchase') {
    throw new Error('Cannot cancel one-time purchase');
  }
  
  const now = new Date();
  
  this.subscription.cancellation.requestedAt = now;
  this.subscription.cancellation.reason = reason;
  this.subscription.cancellation.userReason = userReason;
  
  if (effectiveImmediately) {
    this.subscription.status = 'cancelled';
    this.subscription.cancellation.effectiveDate = now;
    this.access.status = 'expired';
  } else {
    // Cancel at end of current billing period
    this.subscription.cancellation.effectiveDate = this.subscription.endDate;
    this.subscription.autoRenew = false;
  }
  
  return this.save();
};

// Method to renew subscription
enrollmentSchema.methods.renewSubscription = async function(paymentId, amount) {
  if (this.enrollmentType === 'one_time_purchase') {
    throw new Error('Cannot renew one-time purchase');
  }
  
  const now = new Date();
  
  // Add to renewal history
  this.subscription.renewalHistory.push({
    renewedAt: now,
    amount: amount,
    paymentId: paymentId,
    status: 'success',
    periodStart: this.subscription.endDate,
    periodEnd: this.enrollmentType === 'monthly_subscription' ? 
      new Date(this.subscription.endDate.getTime() + 30 * 24 * 60 * 60 * 1000) :
      new Date(this.subscription.endDate.getTime() + 365 * 24 * 60 * 60 * 1000)
  });
  
  // Update subscription dates
  if (this.enrollmentType === 'monthly_subscription') {
    this.subscription.endDate.setMonth(this.subscription.endDate.getMonth() + 1);
    this.subscription.nextBillingDate = new Date(this.subscription.endDate);
  } else if (this.enrollmentType === 'yearly_subscription') {
    this.subscription.endDate.setFullYear(this.subscription.endDate.getFullYear() + 1);
    this.subscription.nextBillingDate = new Date(this.subscription.endDate);
  }
  
  // Reset grace period
  this.subscription.gracePeriod.isActive = false;
  this.subscription.gracePeriod.attempts = 0;
  
  // Reactivate if was cancelled or expired
  if (['cancelled', 'expired'].includes(this.subscription.status)) {
    this.subscription.status = 'active';
    this.access.status = 'active';
  }
  
  return this.save();
};

// Method to handle failed payment
enrollmentSchema.methods.handleFailedPayment = function(failureReason) {
  this.payment.status = 'failed';
  this.payment.failedAt = new Date();
  this.payment.failureReason = failureReason;
  
  if (this.enrollmentType.includes('subscription')) {
    this.subscription.renewalAttempts += 1;
    this.subscription.lastRenewalAttempt = new Date();
    
    // Start grace period if not already active
    if (!this.subscription.gracePeriod.isActive) {
      const gracePeriodEnd = new Date();
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7); // 7 days grace period
      
      this.subscription.gracePeriod.isActive = true;
      this.subscription.gracePeriod.startDate = new Date();
      this.subscription.gracePeriod.endDate = gracePeriodEnd;
      this.subscription.status = 'grace_period';
    }
    
    this.subscription.gracePeriod.attempts += 1;
    
    // If too many attempts, suspend access
    if (this.subscription.gracePeriod.attempts >= 3) {
      this.subscription.status = 'expired';
      this.access.status = 'suspended';
    }
  } else {
    this.access.status = 'suspended';
  }
  
  return this.save();
};

// Method to track device access
enrollmentSchema.methods.trackDeviceAccess = function(deviceInfo) {
  const existingDevice = this.access.accessDevices.find(d => d.deviceId === deviceInfo.deviceId);
  
  if (existingDevice) {
    existingDevice.lastUsed = new Date();
    existingDevice.isActive = true;
  } else {
    // Check if adding new device exceeds limit
    const activeDevices = this.access.accessDevices.filter(d => d.isActive).length;
    
    if (activeDevices >= this.access.maxConcurrentDevices) {
      // Deactivate oldest device
      const oldestDevice = this.access.accessDevices
        .filter(d => d.isActive)
        .sort((a, b) => a.lastUsed - b.lastUsed)[0];
      
      if (oldestDevice) {
        oldestDevice.isActive = false;
      }
    }
    
    this.access.accessDevices.push({
      deviceId: deviceInfo.deviceId,
      deviceType: deviceInfo.deviceType,
      platform: deviceInfo.platform,
      lastUsed: new Date(),
      isActive: true
    });
  }
  
  this.analytics.lastActivityDate = new Date();
  return this.save();
};

// Method to update engagement analytics
enrollmentSchema.methods.updateEngagementAnalytics = function(sessionData) {
  this.analytics.lastActivityDate = new Date();
  
  // Update study patterns based on session time
  const sessionHour = new Date().getHours();
  const timeSlot = this.analytics.preferredStudyTimes.find(t => t.hour === sessionHour);
  
  if (timeSlot) {
    timeSlot.frequency += 1;
  } else {
    this.analytics.preferredStudyTimes.push({
      hour: sessionHour,
      frequency: 1
    });
  }
  
  // Analyze study pattern
  const now = new Date();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const isMorning = sessionHour >= 6 && sessionHour < 12;
  const isEvening = sessionHour >= 18 && sessionHour < 22;
  
  // Simple pattern detection (could be enhanced with ML)
  if (isWeekend && this.analytics.studyPattern !== 'weekend_warrior') {
    this.analytics.studyPattern = 'weekend_warrior';
  } else if (isMorning && this.analytics.studyPattern !== 'morning_learner') {
    this.analytics.studyPattern = 'morning_learner';
  } else if (isEvening && this.analytics.studyPattern !== 'evening_learner') {
    this.analytics.studyPattern = 'evening_learner';
  }
  
  return this.save();
};

// Static method to find expiring subscriptions
enrollmentSchema.statics.findExpiringSubscriptions = function(daysAhead = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  
  return this.find({
    enrollmentType: { $in: ['monthly_subscription', 'yearly_subscription'] },
    'subscription.status': 'active',
    'subscription.nextBillingDate': { $lte: futureDate },
    'subscription.autoRenew': true
  }).populate('userId courseId guruId');
};

// Static method to find failed subscriptions in grace period
enrollmentSchema.statics.findGracePeriodSubscriptions = function() {
  return this.find({
    'subscription.status': 'grace_period',
    'subscription.gracePeriod.isActive': true,
    'subscription.gracePeriod.endDate': { $gte: new Date() }
  }).populate('userId courseId');
};

// Static method to get guru revenue report
enrollmentSchema.statics.getGuruRevenueReport = function(guruId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        guruId: mongoose.Types.ObjectId(guruId),
        'payment.status': 'completed',
        'payment.paidAt': {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          type: '$enrollmentType',
          month: { $month: '$payment.paidAt' },
          year: { $year: '$payment.paidAt' }
        },
        totalRevenue: { $sum: '$payment.amount' },
        count: { $sum: 1 },
        averageAmount: { $avg: '$payment.amount' }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalRevenue' },
        guruEarnings: { $sum: { $multiply: ['$totalRevenue', 0.8] } },
        platformFee: { $sum: { $multiply: ['$totalRevenue', 0.2] } },
        byType: {
          $push: {
            type: '$_id.type',
            month: '$_id.month',
            year: '$_id.year',
            revenue: '$totalRevenue',
            count: '$count',
            average: '$averageAmount'
          }
        },
        totalEnrollments: { $sum: '$count' }
      }
    }
  ]);
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);