const mongoose = require('mongoose');

// Payment Transaction Model for detailed payment tracking and audit
const paymentTransactionSchema = new mongoose.Schema({
  // Unique transaction identifier
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  
  // Reference to related entities
  enrollmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: [true, 'Enrollment ID is required'],
    index: true
  },
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

  // Razorpay integration details
  razorpay: {
    orderId: {
      type: String,
      required: [true, 'Razorpay order ID is required'],
      index: true
    },
    paymentId: {
      type: String,
      index: true,
      sparse: true // Allow null for pending payments
    },
    signature: {
      type: String,
      sparse: true // Allow null for pending payments
    },
    webhookId: {
      type: String,
      sparse: true
    },
    webhookEventId: {
      type: String,
      sparse: true
    }
  },

  // Detailed amount breakdown
  amount: {
    total: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    coursePrice: {
      type: Number,
      required: [true, 'Course price is required'],
      min: [0, 'Course price cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    discountCode: {
      type: String,
      trim: true,
      uppercase: true
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative']
    },
    taxRate: {
      type: Number,
      default: 0,
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%']
    },
    processingFee: {
      type: Number,
      default: 0,
      min: [0, 'Processing fee cannot be negative']
    },
    currency: {
      type: String,
      enum: ['INR', 'USD'],
      default: 'INR',
      required: true
    }
  },

  // Revenue distribution (80/20 split)
  revenue: {
    guruShare: {
      type: Number,
      required: true,
      min: [0, 'Guru share cannot be negative']
    },
    platformShare: {
      type: Number,
      required: true,
      min: [0, 'Platform share cannot be negative']
    },
    guruSharePercentage: {
      type: Number,
      default: 80,
      min: [0, 'Guru share percentage cannot be negative'],
      max: [100, 'Guru share percentage cannot exceed 100']
    },
    platformSharePercentage: {
      type: Number,
      default: 20,
      min: [0, 'Platform share percentage cannot be negative'],
      max: [100, 'Platform share percentage cannot exceed 100']
    },
    distributedAt: {
      type: Date
    },
    isDistributed: {
      type: Boolean,
      default: false
    }
  },

  // Transaction status and details
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed', 'refunded', 'partially_refunded', 'cancelled'],
    default: 'pending',
    required: true,
    index: true
  },
  
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'emi', 'paylater'],
    index: true
  },
  
  paymentDetails: {
    cardType: String, // 'visa', 'mastercard', 'amex', etc.
    cardLast4: String,
    bankName: String,
    walletProvider: String, // 'paytm', 'phonepe', 'googlepay', etc.
    upiVpa: String
  },

  // Timing information
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  initiatedAt: {
    type: Date
  },
  
  completedAt: {
    type: Date,
    index: true
  },
  
  failedAt: {
    type: Date
  },

  // Refund information
  refund: {
    isRefunded: {
      type: Boolean,
      default: false
    },
    refundAmount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative']
    },
    refundReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Refund reason cannot exceed 500 characters']
    },
    refundedAt: {
      type: Date
    },
    refundTransactionId: {
      type: String
    },
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // Device and location information
  deviceInfo: {
    platform: {
      type: String,
      enum: ['web', 'mobile', 'tablet', 'desktop']
    },
    browser: String,
    os: String,
    userAgent: String,
    ipAddress: String,
    location: {
      country: String,
      state: String,
      city: String,
      timezone: String
    }
  },

  // Risk and fraud detection
  riskAssessment: {
    score: {
      type: Number,
      min: [0, 'Risk score cannot be negative'],
      max: [100, 'Risk score cannot exceed 100']
    },
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    factors: [String],
    reviewRequired: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: String
  },

  // Detailed event log for audit trail
  events: [{
    event: {
      type: String,
      required: true,
      enum: [
        'transaction_created',
        'payment_initiated', 
        'payment_processing',
        'payment_success',
        'payment_failed',
        'webhook_received',
        'refund_initiated',
        'refund_processed',
        'dispute_raised',
        'dispute_resolved'
      ]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    },
    razorpayEventId: String,
    source: {
      type: String,
      enum: ['system', 'webhook', 'admin', 'user'],
      default: 'system'
    }
  }],

  // Metadata for tracking and analytics
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'admin'],
      default: 'web'
    },
    campaignId: String,
    affiliateId: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    sessionId: String,
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
  },

  // Reconciliation information
  reconciliation: {
    isReconciled: {
      type: Boolean,
      default: false
    },
    reconciledAt: Date,
    reconciledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    discrepancies: [String],
    settlementId: String,
    settlementAmount: Number,
    settlementDate: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
paymentTransactionSchema.index({ userId: 1, createdAt: -1 });
paymentTransactionSchema.index({ guruId: 1, status: 1, createdAt: -1 });
paymentTransactionSchema.index({ 'razorpay.paymentId': 1 }, { sparse: true });
paymentTransactionSchema.index({ status: 1, createdAt: -1 });
paymentTransactionSchema.index({ 'revenue.isDistributed': 1, status: 1 });
paymentTransactionSchema.index({ 'reconciliation.isReconciled': 1, status: 1 });

// Virtual fields
paymentTransactionSchema.virtual('isSuccess').get(function() {
  return this.status === 'success';
});

paymentTransactionSchema.virtual('isPending').get(function() {
  return ['pending', 'processing'].includes(this.status);
});

paymentTransactionSchema.virtual('netAmount').get(function() {
  return this.amount.total - this.amount.tax - this.amount.processingFee;
});

paymentTransactionSchema.virtual('effectiveDiscount').get(function() {
  return this.amount.discount + (this.amount.coursePrice - this.amount.total + this.amount.discount);
});

// Instance methods
paymentTransactionSchema.methods.addEvent = function(event, details = {}, source = 'system') {
  this.events.push({
    event,
    timestamp: new Date(),
    details,
    source
  });
};

paymentTransactionSchema.methods.markSuccess = function(paymentId, signature) {
  this.status = 'success';
  this.razorpay.paymentId = paymentId;
  this.razorpay.signature = signature;
  this.completedAt = new Date();
  this.addEvent('payment_success', { paymentId, signature });
};

paymentTransactionSchema.methods.markFailed = function(reason, errorCode) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.addEvent('payment_failed', { reason, errorCode });
};

paymentTransactionSchema.methods.processRefund = function(amount, reason, refundedBy) {
  const refundAmount = amount || this.amount.total;
  
  this.refund = {
    isRefunded: true,
    refundAmount,
    refundReason: reason,
    refundedAt: new Date(),
    refundedBy
  };
  
  // Update status based on refund amount
  if (refundAmount >= this.amount.total) {
    this.status = 'refunded';
  } else {
    this.status = 'partially_refunded';
  }
  
  this.addEvent('refund_processed', { 
    amount: refundAmount, 
    reason,
    refundedBy: refundedBy.toString()
  });
};

paymentTransactionSchema.methods.distributeRevenue = function() {
  if (this.status !== 'success' || this.revenue.isDistributed) {
    throw new Error('Cannot distribute revenue for non-successful or already distributed payment');
  }
  
  this.revenue.isDistributed = true;
  this.revenue.distributedAt = new Date();
  this.addEvent('revenue_distributed', {
    guruShare: this.revenue.guruShare,
    platformShare: this.revenue.platformShare
  });
};

paymentTransactionSchema.methods.calculateRisk = function() {
  let riskScore = 0;
  const factors = [];
  
  // High amount transactions
  if (this.amount.total > 10000) {
    riskScore += 20;
    factors.push('high_amount');
  }
  
  // New user (would need to check user creation date)
  // First transaction for user (would need to check transaction history)
  
  // International payments
  if (this.deviceInfo?.location?.country && this.deviceInfo.location.country !== 'India') {
    riskScore += 15;
    factors.push('international_payment');
  }
  
  // Multiple failed attempts (would need to check recent failures)
  
  this.riskAssessment = {
    score: Math.min(riskScore, 100),
    level: riskScore < 25 ? 'low' : riskScore < 50 ? 'medium' : riskScore < 75 ? 'high' : 'critical',
    factors,
    reviewRequired: riskScore >= 50
  };
  
  return this.riskAssessment;
};

// Static methods
paymentTransactionSchema.statics.findSuccessfulPayments = function(userId = null, dateRange = null) {
  const filter = { status: 'success' };
  
  if (userId) filter.userId = userId;
  if (dateRange) {
    filter.completedAt = {
      $gte: new Date(dateRange.startDate),
      $lte: new Date(dateRange.endDate)
    };
  }
  
  return this.find(filter)
    .populate('userId', 'profile.firstName profile.lastName email')
    .populate('courseId', 'title instructor.name')
    .sort({ completedAt: -1 });
};

paymentTransactionSchema.statics.getRevenueStats = function(guruId = null, period = 'month') {
  const matchStage = { status: 'success' };
  if (guruId) matchStage.guruId = new mongoose.Types.ObjectId(guruId);
  
  let groupBy;
  switch (period) {
    case 'day':
      groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } };
      break;
    case 'week':
      groupBy = { $dateToString: { format: '%Y-W%U', date: '$completedAt' } };
      break;
    case 'month':
      groupBy = { $dateToString: { format: '%Y-%m', date: '$completedAt' } };
      break;
    case 'year':
      groupBy = { $dateToString: { format: '%Y', date: '$completedAt' } };
      break;
    default:
      groupBy = { $dateToString: { format: '%Y-%m', date: '$completedAt' } };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: groupBy,
        totalRevenue: { $sum: '$amount.total' },
        guruRevenue: { $sum: '$revenue.guruShare' },
        platformRevenue: { $sum: '$revenue.platformShare' },
        transactionCount: { $sum: 1 },
        averageTransactionValue: { $avg: '$amount.total' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

paymentTransactionSchema.statics.findPendingDistributions = function() {
  return this.find({
    status: 'success',
    'revenue.isDistributed': false
  }).populate('guruId userId courseId');
};

paymentTransactionSchema.statics.findUnreconciledPayments = function() {
  return this.find({
    status: 'success',
    'reconciliation.isReconciled': false
  }).sort({ completedAt: 1 });
};

// Pre-save middleware
paymentTransactionSchema.pre('save', function(next) {
  // Generate transaction ID if not provided
  if (!this.transactionId) {
    const timestamp = Date.now().toString();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.transactionId = `TXN_${timestamp}_${randomSuffix}`;
  }
  
  // Calculate revenue distribution
  if (this.isModified('amount.total') || !this.revenue.guruShare) {
    const guruPercentage = this.revenue.guruSharePercentage || 80;
    const platformPercentage = this.revenue.platformSharePercentage || 20;
    
    this.revenue.guruShare = Math.round((this.amount.total * guruPercentage / 100) * 100) / 100;
    this.revenue.platformShare = Math.round((this.amount.total * platformPercentage / 100) * 100) / 100;
  }
  
  // Validate revenue percentages add up to 100
  const totalPercentage = this.revenue.guruSharePercentage + this.revenue.platformSharePercentage;
  if (Math.abs(totalPercentage - 100) > 0.01) {
    return next(new Error('Revenue share percentages must add up to 100%'));
  }
  
  next();
});

// Post-save middleware
paymentTransactionSchema.post('save', function(doc) {
  if (this.wasNew) {
    console.log(`New payment transaction created: ${doc.transactionId}`);
  }
});

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);