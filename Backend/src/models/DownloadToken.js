/**
 * DownloadToken Model - Manages secure download tokens for offline content access
 * Tracks download permissions and usage limits
 */

const mongoose = require('mongoose');

const downloadTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
  contentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentFile',
    required: true
  }],
  
  // Token validity
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  
  // Download limits
  maxDownloads: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 3
  },
  
  currentDownloads: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Download tracking
  downloads: [{
    downloadedAt: {
      type: Date,
      default: Date.now
    },
    userAgent: String,
    ipAddress: String,
    contentSize: Number, // Total bytes downloaded
    downloadDuration: Number // Time taken in seconds
  }],
  
  // Token metadata
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  lastDownloadAt: {
    type: Date
  },
  
  // Security
  ipAddress: {
    type: String,
    required: true
  },
  
  userAgent: {
    type: String,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'expired', 'exhausted', 'revoked'],
    default: 'active',
    index: true
  },
  
  revokedAt: {
    type: Date
  },
  
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  revokeReason: {
    type: String
  }
}, {
  timestamps: true,
  versionKey: false
});

// Compound indexes for better query performance
downloadTokenSchema.index({ userId: 1, courseId: 1 });
downloadTokenSchema.index({ expiresAt: 1, status: 1 });
downloadTokenSchema.index({ token: 1, status: 1 });
downloadTokenSchema.index({ createdAt: -1 });

// Methods
downloadTokenSchema.methods.isValid = function() {
  return this.status === 'active' && 
         this.expiresAt > new Date() && 
         this.currentDownloads < this.maxDownloads;
};

downloadTokenSchema.methods.recordDownload = function(downloadInfo = {}) {
  if (!this.isValid()) {
    throw new Error('Token is not valid for download');
  }
  
  this.currentDownloads += 1;
  this.lastDownloadAt = new Date();
  
  // Add download record
  this.downloads.push({
    downloadedAt: new Date(),
    userAgent: downloadInfo.userAgent || 'Unknown',
    ipAddress: downloadInfo.ipAddress || 'Unknown',
    contentSize: downloadInfo.contentSize || 0,
    downloadDuration: downloadInfo.downloadDuration || 0
  });
  
  // Update status if limits reached
  if (this.currentDownloads >= this.maxDownloads) {
    this.status = 'exhausted';
  }
  
  return this.save();
};

downloadTokenSchema.methods.revoke = function(revokedBy, reason = 'Manually revoked') {
  this.status = 'revoked';
  this.revokedAt = new Date();
  this.revokedBy = revokedBy;
  this.revokeReason = reason;
  
  return this.save();
};

downloadTokenSchema.methods.getRemainingDownloads = function() {
  return Math.max(0, this.maxDownloads - this.currentDownloads);
};

downloadTokenSchema.methods.getTotalDownloadSize = function() {
  return this.downloads.reduce((total, download) => total + (download.contentSize || 0), 0);
};

// Static methods
downloadTokenSchema.statics.findValidToken = function(token) {
  return this.findOne({
    token,
    status: 'active',
    expiresAt: { $gt: new Date() }
  });
};

downloadTokenSchema.statics.getUserActiveTokens = function(userId, courseId = null) {
  const query = {
    userId,
    status: 'active',
    expiresAt: { $gt: new Date() }
  };
  
  if (courseId) {
    query.courseId = courseId;
  }
  
  return this.find(query).sort({ createdAt: -1 });
};

downloadTokenSchema.statics.cleanupExpiredTokens = function() {
  return this.updateMany(
    {
      status: 'active',
      expiresAt: { $lte: new Date() }
    },
    {
      $set: { status: 'expired' }
    }
  );
};

downloadTokenSchema.statics.getDownloadStatistics = function(courseId, dateRange = {}) {
  const matchStage = { courseId };
  
  if (dateRange.startDate || dateRange.endDate) {
    matchStage.createdAt = {};
    if (dateRange.startDate) matchStage.createdAt.$gte = new Date(dateRange.startDate);
    if (dateRange.endDate) matchStage.createdAt.$lte = new Date(dateRange.endDate);
  }
  
  return this.aggregate([
    { $match: matchStage },
    { $unwind: { path: '$downloads', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$courseId',
        totalTokens: { $sum: 1 },
        totalDownloads: { $sum: { $cond: ['$downloads', 1, 0] } },
        totalDataDownloaded: { $sum: { $ifNull: ['$downloads.contentSize', 0] } },
        uniqueUsers: { $addToSet: '$userId' },
        averageDownloadsPerToken: { $avg: '$currentDownloads' }
      }
    },
    {
      $project: {
        totalTokens: 1,
        totalDownloads: 1,
        totalDataDownloaded: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        averageDownloadsPerToken: { $round: ['$averageDownloadsPerToken', 2] }
      }
    }
  ]);
};

// Pre-save middleware
downloadTokenSchema.pre('save', function(next) {
  // Auto-generate token if not provided
  if (!this.token) {
    const crypto = require('crypto');
    this.token = crypto.randomUUID();
  }
  
  // Set default expiration if not set (24 hours)
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000));
  }
  
  next();
});

// Pre-save middleware to update status based on conditions
downloadTokenSchema.pre('save', function(next) {
  // Auto-expire if past expiration date
  if (this.expiresAt <= new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  
  // Auto-exhaust if download limit reached
  if (this.currentDownloads >= this.maxDownloads && this.status === 'active') {
    this.status = 'exhausted';
  }
  
  next();
});

// TTL index to automatically delete expired tokens after 7 days
downloadTokenSchema.index(
  { expiresAt: 1 },
  { 
    expireAfterSeconds: 7 * 24 * 60 * 60, // 7 days
    partialFilterExpression: { status: { $in: ['expired', 'exhausted'] } }
  }
);

// Virtual for time remaining
downloadTokenSchema.virtual('timeRemaining').get(function() {
  if (this.expiresAt <= new Date()) {
    return 0;
  }
  return this.expiresAt - new Date();
});

// Virtual for time remaining in human readable format
downloadTokenSchema.virtual('timeRemainingFormatted').get(function() {
  const ms = this.timeRemaining;
  if (ms <= 0) return 'Expired';
  
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Transform JSON output
downloadTokenSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    // Only include token for active tokens
    if (ret.status !== 'active') {
      delete ret.token;
    }
    return ret;
  }
});

module.exports = mongoose.model('DownloadToken', downloadTokenSchema);