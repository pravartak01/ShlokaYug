const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  // Subscriber information
  subscriber: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Subscriber ID is required'],
      index: true
    },
    username: String,
    avatar: String
  },
  
  // Channel being subscribed to
  channel: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Channel ID is required'],
      index: true
    },
    username: String,
    displayName: String,
    avatar: String
  },
  
  // Subscription settings
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    level: {
      type: String,
      enum: ['all', 'custom', 'none'],
      default: 'all'
    },
    types: {
      newVideo: { type: Boolean, default: true },
      liveStream: { type: Boolean, default: true },
      communityPost: { type: Boolean, default: false }
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  subscribedAt: {
    type: Date,
    default: Date.now,
    index: -1
  },
  
  unsubscribedAt: Date
}, {
  timestamps: true
});

// Compound indexes
subscriptionSchema.index({ 'subscriber.userId': 1, 'channel.userId': 1 }, { unique: true });
subscriptionSchema.index({ 'channel.userId': 1, isActive: 1, subscribedAt: -1 });
subscriptionSchema.index({ 'subscriber.userId': 1, isActive: 1, subscribedAt: -1 });

// Static methods
subscriptionSchema.statics.getSubscriberCount = function(channelUserId) {
  return this.countDocuments({ 
    'channel.userId': channelUserId, 
    isActive: true 
  });
};

subscriptionSchema.statics.getSubscriptionCount = function(userId) {
  return this.countDocuments({ 
    'subscriber.userId': userId, 
    isActive: true 
  });
};

subscriptionSchema.statics.isSubscribed = function(subscriberUserId, channelUserId) {
  return this.findOne({
    'subscriber.userId': subscriberUserId,
    'channel.userId': channelUserId,
    isActive: true
  });
};

// Video Like/Dislike Model
const videoReactionSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
    index: true
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  type: {
    type: String,
    enum: ['like', 'dislike'],
    required: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: -1
  }
}, {
  timestamps: true
});

// Compound unique index
videoReactionSchema.index({ videoId: 1, userId: 1 }, { unique: true });
videoReactionSchema.index({ userId: 1, type: 1, createdAt: -1 });

const VideoReaction = mongoose.model('VideoReaction', videoReactionSchema);


// View History Model
const viewHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
    index: true
  },
  
  watchTime: {
    type: Number, // seconds watched
    default: 0
  },
  
  duration: {
    type: Number, // total video duration when watched
    required: true
  },
  
  completionPercentage: {
    type: Number, // percentage of video watched
    default: 0
  },
  
  deviceInfo: {
    type: String, // mobile, desktop, tablet
    enum: ['mobile', 'desktop', 'tablet', 'tv', 'other'],
    default: 'other'
  },
  
  location: {
    country: String,
    region: String,
    city: String
  },
  
  watchedAt: {
    type: Date,
    default: Date.now,
    index: -1
  }
}, {
  timestamps: true
});

// Indexes for analytics
viewHistorySchema.index({ userId: 1, watchedAt: -1 });
viewHistorySchema.index({ videoId: 1, watchedAt: -1 });
viewHistorySchema.index({ watchedAt: -1 });

const ViewHistory = mongoose.model('ViewHistory', viewHistorySchema);


// Playlist Model
const playlistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Playlist title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters'],
    index: 'text'
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  creator: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    username: String,
    displayName: String,
    avatar: String
  },
  
  videos: [{
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    position: {
      type: Number,
      required: true
    }
  }],
  
  thumbnail: {
    url: String, // Custom thumbnail or first video's thumbnail
    cloudinaryId: String
  },
  
  visibility: {
    type: String,
    enum: ['public', 'unlisted', 'private'],
    default: 'public',
    index: true
  },
  
  category: {
    type: String,
    enum: [
      'favorites',
      'watch-later',
      'custom',
      'liked-videos',
      'history'
    ],
    default: 'custom'
  },
  
  isSystemPlaylist: {
    type: Boolean,
    default: false // For Watch Later, Liked Videos, etc.
  },
  
  metrics: {
    views: { type: Number, default: 0 },
    subscribers: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
playlistSchema.index({ 'creator.userId': 1, category: 1, createdAt: -1 });
playlistSchema.index({ visibility: 1, createdAt: -1 });
playlistSchema.index({ 'metrics.views': -1 });

// Virtual for video count
playlistSchema.virtual('videoCount').get(function() {
  return this.videos.length;
});

// Virtual for total duration
playlistSchema.virtual('totalDuration').get(function() {
  // This would need to be populated with video data to calculate
  return 0;
});

const Playlist = mongoose.model('Playlist', playlistSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = {
  VideoReaction,
  ViewHistory,
  Playlist,
  Subscription
};