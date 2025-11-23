const mongoose = require('mongoose');

// Simplified Payment Transaction Model for testing/development
const paymentTransactionSchema = new mongoose.Schema({
  // Unique transaction identifier
  transactionId: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  
  // Reference to related entities (optional for testing)
  enrollmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
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
    index: true
  },
  guruId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
      sparse: true
    },
    signature: {
      type: String,
      sparse: true
    }
  },

  // Amount information
  amount: {
    total: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    coursePrice: {
      type: Number,
      min: [0, 'Course price cannot be negative']
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
      min: [0, 'Guru share cannot be negative']
    },
    platformShare: {
      type: Number,
      min: [0, 'Platform share cannot be negative']
    },
    guruSharePercentage: {
      type: Number,
      default: 80
    },
    platformSharePercentage: {
      type: Number,
      default: 20
    },
    distributedAt: Date,
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
    enum: ['card', 'upi', 'netbanking', 'wallet', 'emi', 'paylater', 'razorpay'],
    index: true
  },

  // Timing information
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  completedAt: {
    type: Date,
    index: true
  },
  failedAt: Date,

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
    refundReason: String,
    refundedAt: Date,
    refundTransactionId: String
  },

  // Event log for audit trail
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
        'refund_processed'
      ]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: mongoose.Schema.Types.Mixed,
    source: {
      type: String,
      enum: ['system', 'webhook', 'admin', 'user'],
      default: 'system'
    }
  }],

  // Metadata for tracking
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'admin', 'test_verification'],
      default: 'web'
    },
    enrollmentType: String,
    sessionId: String,
    notes: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
paymentTransactionSchema.index({ userId: 1, createdAt: -1 });
paymentTransactionSchema.index({ 'razorpay.paymentId': 1 }, { sparse: true });
paymentTransactionSchema.index({ status: 1, createdAt: -1 });

// Virtual fields
paymentTransactionSchema.virtual('isSuccess').get(function() {
  return this.status === 'success';
});

paymentTransactionSchema.virtual('isPending').get(function() {
  return ['pending', 'processing'].includes(this.status);
});

// Instance methods
paymentTransactionSchema.methods.addEvent = function(event, details = {}, source = 'system') {
  this.events.push({
    event,
    timestamp: new Date(),
    details,
    source
  });
  return this;
};

paymentTransactionSchema.methods.markSuccess = function(paymentId, signature) {
  this.status = 'success';
  this.razorpay.paymentId = paymentId;
  this.razorpay.signature = signature;
  this.completedAt = new Date();
  this.addEvent('payment_success', { paymentId, signature });
  return this;
};

paymentTransactionSchema.methods.markFailed = function(reason, errorCode) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.addEvent('payment_failed', { reason, errorCode });
  return this;
};

// Static methods
paymentTransactionSchema.statics.findSuccessfulPayments = function(userId = null) {
  const filter = { status: 'success' };
  if (userId) filter.userId = userId;
  
  return this.find(filter)
    .sort({ completedAt: -1 });
};

paymentTransactionSchema.statics.getRevenueStats = function(guruId = null, period = 'month') {
  const matchStage = { status: 'success' };
  if (guruId) matchStage.guruId = new mongoose.Types.ObjectId(guruId);
  
  let groupBy = { $dateToString: { format: '%Y-%m', date: '$completedAt' } };
  
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
  });
};

// Pre-save middleware
paymentTransactionSchema.pre('save', function(next) {
  // Generate transaction ID if not provided
  if (!this.transactionId) {
    const timestamp = Date.now().toString().slice(-8);
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.transactionId = `TXN_${timestamp}_${randomSuffix}`;
  }
  
  // Calculate revenue distribution if amount is provided
  if (this.amount && this.amount.total && (!this.revenue.guruShare || this.isModified('amount.total'))) {
    const guruPercentage = this.revenue?.guruSharePercentage || 80;
    const platformPercentage = this.revenue?.platformSharePercentage || 20;
    
    this.revenue = this.revenue || {};
    this.revenue.guruShare = Math.round((this.amount.total * guruPercentage / 100) * 100) / 100;
    this.revenue.platformShare = Math.round((this.amount.total * platformPercentage / 100) * 100) / 100;
    this.revenue.guruSharePercentage = guruPercentage;
    this.revenue.platformSharePercentage = platformPercentage;
  }
  
  next();
});

// Post-save middleware
paymentTransactionSchema.post('save', function(doc) {
  if (this.wasNew) {
    console.log(`✓ Payment transaction saved to database: ${doc.transactionId}`);
  }
});

module.exports = mongoose.model('PaymentTransactionSimple', paymentTransactionSchema);