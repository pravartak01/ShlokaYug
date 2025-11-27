/**
 * Community Post Model - Twitter-like social posts
 * Supports text tweets, video posts, images, likes, retweets, comments
 */

const mongoose = require('mongoose');

const CommunityPostSchema = new mongoose.Schema({
  // Author information
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Post content
  content: {
    text: {
      type: String,
      maxlength: 500, // Twitter-like character limit
      trim: true
    },
    
    // Media attachments
    media: {
      // Video attachment (from video platform)
      video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
      },
      
      // Image attachments
      images: [{
        url: String,
        publicId: String,
        alt: String
      }],
      
      // Audio attachments for Sanskrit chants
      audio: {
        url: String,
        publicId: String,
        duration: Number
      }
    },
    
    // Hashtags and mentions
    hashtags: [{
      type: String,
      lowercase: true,
      index: true
    }],
    
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // Post type
  postType: {
    type: String,
    enum: ['text', 'video', 'image', 'audio', 'retweet', 'quote'],
    default: 'text',
    required: true,
    index: true
  },
  
  // Retweet/Quote functionality
  originalPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityPost'
  },
  
  quoteText: {
    type: String,
    maxlength: 280
  },
  
  // Engagement metrics
  metrics: {
    likes: {
      type: Number,
      default: 0,
      min: 0
    },
    
    retweets: {
      type: Number,
      default: 0,
      min: 0
    },
    
    comments: {
      type: Number,
      default: 0,
      min: 0
    },
    
    views: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Engagement tracking
  likedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  retweetedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Comments/Replies
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    text: {
      type: String,
      required: true,
      maxlength: 280
    },
    
    createdAt: {
      type: Date,
      default: Date.now
    },
    
    likes: {
      type: Number,
      default: 0
    },
    
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  
  // Privacy and moderation
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public',
    index: true
  },
  
  isReported: {
    type: Boolean,
    default: false,
    index: true
  },
  
  reports: [{
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'copyright', 'other']
    },
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  isHidden: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Location (optional)
  location: {
    name: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  
  // Scheduling
  scheduledFor: Date,
  isScheduled: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Analytics
  analytics: {
    impressions: {
      type: Number,
      default: 0
    },
    
    clicks: {
      type: Number,
      default: 0
    },
    
    shares: {
      type: Number,
      default: 0
    },
    
    saves: {
      type: Number,
      default: 0
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  editedAt: Date
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
CommunityPostSchema.index({ author: 1, createdAt: -1 });
CommunityPostSchema.index({ 'content.hashtags': 1, createdAt: -1 });
CommunityPostSchema.index({ postType: 1, createdAt: -1 });
CommunityPostSchema.index({ visibility: 1, isHidden: 1, createdAt: -1 });
CommunityPostSchema.index({ 'metrics.likes': -1, createdAt: -1 });

// Virtual for engagement rate
CommunityPostSchema.virtual('engagementRate').get(function() {
  const totalEngagement = this.metrics.likes + this.metrics.retweets + this.metrics.comments;
  return this.metrics.views > 0 ? (totalEngagement / this.metrics.views * 100).toFixed(2) : 0;
});

// Virtual for relative time
CommunityPostSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
});

// Pre-save middleware
CommunityPostSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Extract hashtags from text
  if (this.content.text) {
    const hashtags = this.content.text.match(/#[\w\u0900-\u097F]+/g);
    if (hashtags) {
      this.content.hashtags = hashtags.map(tag => tag.slice(1).toLowerCase());
    }
    
    // Extract mentions from text
    const mentions = this.content.text.match(/@[\w\u0900-\u097F]+/g);
    if (mentions) {
      // Would need to resolve usernames to ObjectIds
      // Implementation depends on username lookup
    }
  }
  
  next();
});

// Static methods
CommunityPostSchema.statics.findByHashtag = function(hashtag, options = {}) {
  const query = {
    'content.hashtags': hashtag.toLowerCase(),
    visibility: 'public',
    isHidden: false
  };
  
  return this.find(query)
    .populate('author', 'username firstName lastName avatar')
    .populate('originalPost')
    .sort({ createdAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

CommunityPostSchema.statics.getTrendingHashtags = function(timeframe = 24) {
  const since = new Date(Date.now() - timeframe * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: since },
        visibility: 'public',
        isHidden: false
      }
    },
    {
      $unwind: '$content.hashtags'
    },
    {
      $group: {
        _id: '$content.hashtags',
        count: { $sum: 1 },
        totalEngagement: {
          $sum: {
            $add: ['$metrics.likes', '$metrics.retweets', '$metrics.comments']
          }
        }
      }
    },
    {
      $sort: { totalEngagement: -1, count: -1 }
    },
    {
      $limit: 10
    }
  ]);
};

// Instance methods
CommunityPostSchema.methods.like = function(userId) {
  const alreadyLiked = this.likedBy.some(like => like.user.toString() === userId.toString());
  
  if (!alreadyLiked) {
    this.likedBy.push({ user: userId });
    this.metrics.likes += 1;
  }
  
  return this.save();
};

CommunityPostSchema.methods.unlike = function(userId) {
  this.likedBy = this.likedBy.filter(like => like.user.toString() !== userId.toString());
  this.metrics.likes = Math.max(0, this.metrics.likes - 1);
  
  return this.save();
};

CommunityPostSchema.methods.addComment = function(authorId, text) {
  const comment = {
    author: authorId,
    text: text,
    createdAt: new Date()
  };
  
  this.comments.push(comment);
  this.metrics.comments += 1;
  
  return this.save();
};

CommunityPostSchema.methods.repost = function(userId, quoteText = null) {
  this.retweetedBy.push({ user: userId });
  this.metrics.retweets += 1;
  
  // Create new post as retweet
  const repost = new this.constructor({
    author: userId,
    postType: quoteText ? 'quote' : 'retweet',
    originalPost: this._id,
    quoteText: quoteText,
    visibility: 'public'
  });
  
  return Promise.all([this.save(), repost.save()]);
};

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);