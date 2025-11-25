/**
 * ContentFile Model - Manages uploaded content files
 * Stores file metadata and security tokens for content delivery
 */

const mongoose = require('mongoose');

const contentFileSchema = new mongoose.Schema({
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
  
  contentType: {
    type: String,
    enum: ['video', 'audio', 'document', 'image', 'subtitle'],
    required: true,
    index: true
  },
  
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  
  fileName: {
    type: String,
    required: true,
    unique: true
  },
  
  filePath: {
    type: String,
    required: true
  },
  
  fileSize: {
    type: Number,
    required: true,
    min: 0
  },
  
  mimeType: {
    type: String,
    required: true
  },
  
  secureUrl: {
    type: String,
    required: true
  },
  
  secureToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Video-specific fields
  streamingUrl: {
    type: String
  },
  
  thumbnailUrl: {
    type: String
  },
  
  thumbnailPath: {
    type: String
  },
  
  duration: {
    type: Number, // in seconds
    min: 0
  },
  
  resolutions: [{
    type: String // e.g., ['480p', '720p', '1080p']
  }],
  
  // Audio-specific fields
  waveformData: [{
    type: Number // Amplitude values for waveform visualization
  }],
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Upload information
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  uploadedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Access tracking
  accessCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  lastAccessedAt: {
    type: Date
  },
  
  // Status
  status: {
    type: String,
    enum: ['processing', 'ready', 'error'],
    default: 'ready'
  },
  
  processingStatus: {
    transcoding: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    thumbnail: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    }
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better query performance
contentFileSchema.index({ courseId: 1, lectureId: 1 });
contentFileSchema.index({ contentType: 1, status: 1 });
contentFileSchema.index({ uploadedBy: 1, uploadedAt: -1 });
contentFileSchema.index({ fileName: 1 }, { unique: true });
contentFileSchema.index({ secureToken: 1 }, { unique: true });

// Methods
contentFileSchema.methods.trackAccess = function() {
  this.accessCount += 1;
  this.lastAccessedAt = new Date();
  return this.save();
};

contentFileSchema.methods.updateProcessingStatus = function(type, status) {
  if (this.processingStatus && this.processingStatus[type] !== undefined) {
    this.processingStatus[type] = status;
    
    // Update overall status based on processing states
    const states = Object.values(this.processingStatus);
    if (states.every(state => state === 'completed')) {
      this.status = 'ready';
    } else if (states.some(state => state === 'failed')) {
      this.status = 'error';
    } else if (states.some(state => state === 'processing')) {
      this.status = 'processing';
    }
    
    return this.save();
  }
  return Promise.resolve(this);
};

// Static methods
contentFileSchema.statics.findByCourseAndLecture = function(courseId, lectureId) {
  return this.find({ courseId, lectureId, status: 'ready' });
};

contentFileSchema.statics.findBySecureToken = function(token) {
  return this.findOne({ secureToken: token, status: 'ready' });
};

contentFileSchema.statics.getStorageStats = function(courseId) {
  return this.aggregate([
    { $match: { courseId: mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: '$contentType',
        count: { $sum: 1 },
        totalSize: { $sum: '$fileSize' }
      }
    }
  ]);
};

// Pre-save middleware
contentFileSchema.pre('save', function(next) {
  // Ensure secure token is set
  if (!this.secureToken) {
    const crypto = require('crypto');
    this.secureToken = crypto.randomBytes(32).toString('hex');
  }
  
  // Set secure URL if not set
  if (!this.secureUrl) {
    this.secureUrl = `/api/v1/content/secure/${this.secureToken}`;
  }
  
  next();
});

// Post-save middleware for cleanup
contentFileSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    try {
      const fs = require('fs').promises;
      const fsSync = require('fs');
      
      // Delete physical file
      if (doc.filePath && fsSync.existsSync(doc.filePath)) {
        await fs.unlink(doc.filePath);
      }
      
      // Delete thumbnail if exists
      if (doc.thumbnailPath && fsSync.existsSync(doc.thumbnailPath)) {
        await fs.unlink(doc.thumbnailPath);
      }
      
      console.log(`Cleaned up files for deleted content: ${doc.fileName}`);
    } catch (error) {
      console.error(`Error cleaning up files for content ${doc.fileName}:`, error);
    }
  }
});

// Virtual for file URL
contentFileSchema.virtual('fileUrl').get(function() {
  if (this.contentType === 'video' || this.contentType === 'audio') {
    return this.streamingUrl;
  }
  return this.secureUrl;
});

// Transform JSON output
contentFileSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.filePath; // Don't expose actual file paths
    delete ret.secureToken; // Don't expose security tokens
    return ret;
  }
});

module.exports = mongoose.model('ContentFile', contentFileSchema);