const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  // Basic video information
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters'],
    index: 'text'
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
    index: 'text'
  },
  
  // Creator information
  creator: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
      index: true
    },
    username: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      required: true
    },
    avatar: {
      type: String // URL to creator's profile picture
    }
  },
  
  // Video type and format
  type: {
    type: String,
    enum: ['video', 'short'],
    required: [true, 'Video type is required'],
    index: true
  },
  
  // Video files and processing
  video: {
    originalFile: {
      url: String,
      cloudinaryId: String,
      size: Number, // in bytes
      originalName: String
    },
    processedVersions: {
      // Different quality versions
      '240p': {
        url: String,
        cloudinaryId: String,
        size: Number
      },
      '480p': {
        url: String,
        cloudinaryId: String,
        size: Number
      },
      '720p': {
        url: String,
        cloudinaryId: String,
        size: Number
      },
      '1080p': {
        url: String,
        cloudinaryId: String,
        size: Number
      }
    },
    thumbnail: {
      url: String,
      cloudinaryId: String,
      timestamps: [Number] // Multiple thumbnail timestamps
    },
    duration: {
      type: Number, // in seconds
      default: 0 // Set during video processing
    },
    resolution: {
      width: Number,
      height: Number
    },
    format: String, // mp4, webm, etc.
    aspectRatio: {
      type: String,
      enum: ['16:9', '9:16', '1:1', '4:3'],
      default: '16:9'
    }
  },
  
  // Content categorization
  category: {
    type: String,
    enum: [
      'sanskrit',
      'chandas',
      'mantras',
      'shlokas',
      'bhajans',
      'tutorials',
      'spiritual',
      'classical-music',
      'dance',
      'storytelling',
      'philosophy',
      'meditation',
      'yoga',
      'cultural',
      'educational',
      'entertainment',
      'comedy',
      'other'
    ],
    required: [true, 'Category is required'],
    index: true
  },
  
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  
  contentLanguage: {
    type: String,
    enum: ['sanskrit', 'hindi', 'english', 'bengali', 'tamil', 'telugu', 'marathi', 'gujarati', 'other'],
    default: 'hindi',
    index: true
  },
  
  // Visibility and access control
  visibility: {
    type: String,
    enum: ['public', 'unlisted', 'private'],
    default: 'public',
    index: true
  },
  
  isAgeRestricted: {
    type: Boolean,
    default: false
  },
  
  // Publishing status
  status: {
    type: String,
    enum: ['draft', 'processing', 'published', 'hidden', 'deleted'],
    default: 'processing',
    index: true
  },
  
  publishedAt: {
    type: Date,
    index: -1
  },
  
  scheduledAt: {
    type: Date,
    index: 1
  },
  
  // Engagement metrics
  metrics: {
    views: {
      type: Number,
      default: 0,
      index: -1
    },
    likes: {
      type: Number,
      default: 0,
      index: -1
    },
    dislikes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    watchTime: {
      total: {
        type: Number,
        default: 0 // in seconds
      },
      average: {
        type: Number,
        default: 0 // average watch time per view
      }
    },
    engagement: {
      rate: {
        type: Number,
        default: 0 // (likes + comments + shares) / views
      },
      lastCalculated: Date
    }
  },
  
  // Analytics for creators
  analytics: {
    demographics: {
      ageGroups: {
        '13-17': { type: Number, default: 0 },
        '18-24': { type: Number, default: 0 },
        '25-34': { type: Number, default: 0 },
        '35-44': { type: Number, default: 0 },
        '45-54': { type: Number, default: 0 },
        '55+': { type: Number, default: 0 }
      },
      locations: [{
        country: String,
        views: Number
      }],
      languages: [{
        language: String,
        views: Number
      }]
    },
    performance: {
      impressions: { type: Number, default: 0 },
      clickThroughRate: { type: Number, default: 0 },
      averageViewDuration: { type: Number, default: 0 },
      watchTimeRetention: [{ // Array of retention percentages at different points
        timestamp: Number,
        retentionRate: Number
      }]
    }
  },
  
  // Special features for shorts
  shorts: {
    isLoop: {
      type: Boolean,
      default: false
    },
    music: {
      title: String,
      artist: String,
      isOriginal: { type: Boolean, default: true }
    },
    effects: [String], // filters, effects used
    hashtags: [String] // trending hashtags
  },
  
  // Content moderation
  moderation: {
    isReviewed: {
      type: Boolean,
      default: false
    },
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    flags: [{
      type: {
        type: String,
        enum: ['inappropriate', 'copyright', 'spam', 'misleading', 'violence', 'other']
      },
      reason: String,
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reportedAt: {
        type: Date,
        default: Date.now
      }
    }],
    warningLevel: {
      type: Number,
      min: 0,
      max: 3,
      default: 0
    }
  },
  
  // SEO and discovery
  seo: {
    slug: {
      type: String,
      unique: true,
      sparse: true
    },
    metaDescription: String,
    keywords: [String]
  },
  
  // Comments settings
  commentsSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    allowedUsers: {
      type: String,
      enum: ['all', 'subscribers', 'none'],
      default: 'all'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
videoSchema.index({ 'creator.userId': 1, status: 1, publishedAt: -1 });
videoSchema.index({ type: 1, category: 1, publishedAt: -1 });
videoSchema.index({ status: 1, publishedAt: -1 });
videoSchema.index({ 'metrics.views': -1, publishedAt: -1 });
videoSchema.index({ 'metrics.engagement.rate': -1, publishedAt: -1 });
videoSchema.index({ tags: 1, publishedAt: -1 });
videoSchema.index({ language: 1, category: 1, publishedAt: -1 });
videoSchema.index({ visibility: 1, status: 1, publishedAt: -1 });

// Text search index
videoSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  'creator.displayName': 'text'
}, {
  weights: {
    title: 10,
    tags: 5,
    'creator.displayName': 3,
    description: 1
  }
});

// Virtual for video URL (get best quality available)
videoSchema.virtual('bestVideoUrl').get(function() {
  const versions = this.video.processedVersions;
  if (versions['1080p']?.url) return versions['1080p'].url;
  if (versions['720p']?.url) return versions['720p'].url;
  if (versions['480p']?.url) return versions['480p'].url;
  if (versions['240p']?.url) return versions['240p'].url;
  return this.video.originalFile?.url;
});

// Virtual for engagement rate calculation
videoSchema.virtual('engagementRate').get(function() {
  if (this.metrics.views === 0) return 0;
  return ((this.metrics.likes + this.metrics.comments + this.metrics.shares) / this.metrics.views * 100).toFixed(2);
});

// Virtual for formatted duration
videoSchema.virtual('formattedDuration').get(function() {
  const duration = this.video.duration;
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Virtual for thumbnail URL with timestamp
videoSchema.virtual('thumbnailUrl').get(function() {
  return this.video.thumbnail?.url;
});

// Pre-save middleware
videoSchema.pre('save', function(next) {
  // Generate slug if not exists
  if (!this.seo.slug && this.title) {
    this.seo.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-') + '-' + this._id.toString().slice(-6);
  }
  
  // Set publishedAt if status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Validate shorts duration (max 60 seconds)
  if (this.type === 'short' && this.video.duration > 60) {
    return next(new Error('Short videos cannot exceed 60 seconds'));
  }
  
  // Set aspect ratio for shorts
  if (this.type === 'short' && !this.video.aspectRatio) {
    this.video.aspectRatio = '9:16';
  }
  
  next();
});

// Static methods
videoSchema.statics.getPopular = function(limit = 20, type = null) {
  const query = { status: 'published', visibility: 'public' };
  if (type) query.type = type;
  
  return this.find(query)
    .sort({ 'metrics.views': -1, publishedAt: -1 })
    .limit(limit)
    .populate('creator.userId', 'username profile.displayName profile.avatar');
};

videoSchema.statics.getTrending = function(limit = 20, type = null) {
  const query = { 
    status: 'published', 
    visibility: 'public',
    publishedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
  };
  if (type) query.type = type;
  
  return this.find(query)
    .sort({ 'metrics.engagement.rate': -1, 'metrics.views': -1 })
    .limit(limit)
    .populate('creator.userId', 'username profile.displayName profile.avatar');
};

videoSchema.statics.searchVideos = function(searchTerm, filters = {}) {
  const query = {
    $text: { $search: searchTerm },
    status: 'published',
    visibility: 'public',
    ...filters
  };
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, 'metrics.views': -1 })
    .populate('creator.userId', 'username profile.displayName profile.avatar');
};

// Instance methods
videoSchema.methods.incrementView = async function(userId = null, watchTime = 0) {
  this.metrics.views += 1;
  this.metrics.watchTime.total += watchTime;
  this.metrics.watchTime.average = this.metrics.watchTime.total / this.metrics.views;
  
  // Update analytics if user info is available
  if (userId) {
    this.analytics.performance.averageViewDuration = this.metrics.watchTime.average;
  }
  
  return this.save();
};

videoSchema.methods.updateEngagement = async function() {
  const totalEngagement = this.metrics.likes + this.metrics.comments + this.metrics.shares;
  this.metrics.engagement.rate = this.metrics.views > 0 ? (totalEngagement / this.metrics.views) * 100 : 0;
  this.metrics.engagement.lastCalculated = new Date();
  return this.save();
};

module.exports = mongoose.model('Video', videoSchema);