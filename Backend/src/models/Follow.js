/**
 * Follow Model - Twitter-like follow/following system
 * Handles user relationships, follower/following counts, mutual follows
 */

const mongoose = require('mongoose');

const FollowSchema = new mongoose.Schema({
  // User who is following
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // User being followed
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Follow status
  status: {
    type: String,
    enum: ['active', 'pending', 'blocked'],
    default: 'active',
    index: true
  },
  
  // Timestamps
  followedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Mutual follow indicator
  isMutual: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Notification preferences
  notifications: {
    posts: {
      type: Boolean,
      default: true
    },
    
    videos: {
      type: Boolean,
      default: true
    },
    
    liveStreams: {
      type: Boolean,
      default: false
    }
  },
  
  // Categories for organized following
  category: {
    type: String,
    enum: ['general', 'sanskrit_teacher', 'spiritual_guru', 'student', 'friend', 'institution'],
    default: 'general'
  },
  
  // Notes about the user (private to follower)
  notes: {
    type: String,
    maxlength: 200
  },
  
  // Analytics
  unfollowedAt: Date,
  refollowCount: {
    type: Number,
    default: 0
  }
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

// Compound indexes for efficient queries
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });
FollowSchema.index({ following: 1, status: 1, followedAt: -1 });
FollowSchema.index({ follower: 1, status: 1, followedAt: -1 });
FollowSchema.index({ isMutual: 1, status: 1 });

// Virtual for follow duration
FollowSchema.virtual('followDuration').get(function() {
  return Date.now() - this.followedAt;
});

// Static methods
FollowSchema.statics.isFollowing = async function(followerId, followingId) {
  const follow = await this.findOne({
    follower: followerId,
    following: followingId,
    status: 'active'
  });
  return !!follow;
};

FollowSchema.statics.areMutualFollows = async function(userId1, userId2) {
  const follow1 = await this.findOne({
    follower: userId1,
    following: userId2,
    status: 'active'
  });
  
  const follow2 = await this.findOne({
    follower: userId2,
    following: userId1,
    status: 'active'
  });
  
  return !!(follow1 && follow2);
};

FollowSchema.statics.getFollowersCount = function(userId) {
  return this.countDocuments({
    following: userId,
    status: 'active'
  });
};

FollowSchema.statics.getFollowingCount = function(userId) {
  return this.countDocuments({
    follower: userId,
    status: 'active'
  });
};

FollowSchema.statics.getFollowers = function(userId, options = {}) {
  return this.find({
    following: userId,
    status: 'active'
  })
  .populate('follower', 'username firstName lastName avatar bio')
  .sort({ followedAt: -1 })
  .limit(options.limit || 20)
  .skip(options.skip || 0);
};

FollowSchema.statics.getFollowing = function(userId, options = {}) {
  return this.find({
    follower: userId,
    status: 'active'
  })
  .populate('following', 'username firstName lastName avatar bio')
  .sort({ followedAt: -1 })
  .limit(options.limit || 20)
  .skip(options.skip || 0);
};

FollowSchema.statics.getMutualFollows = function(userId, otherUserId) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { follower: userId, status: 'active' },
          { follower: otherUserId, status: 'active' }
        ]
      }
    },
    {
      $group: {
        _id: '$following',
        followers: { $addToSet: '$follower' }
      }
    },
    {
      $match: {
        followers: { $size: 2 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        _id: '$user._id',
        username: '$user.username',
        firstName: '$user.firstName',
        lastName: '$user.lastName',
        avatar: '$user.avatar'
      }
    }
  ]);
};

FollowSchema.statics.getSuggestedFollows = function(userId, options = {}) {
  return this.aggregate([
    // Get users that people I follow also follow
    {
      $match: {
        follower: userId,
        status: 'active'
      }
    },
    {
      $lookup: {
        from: 'follows',
        localField: 'following',
        foreignField: 'follower',
        as: 'theirFollows'
      }
    },
    {
      $unwind: '$theirFollows'
    },
    {
      $match: {
        'theirFollows.following': { $ne: userId },
        'theirFollows.status': 'active'
      }
    },
    {
      $group: {
        _id: '$theirFollows.following',
        mutualConnections: { $sum: 1 },
        connectedThrough: { $addToSet: '$following' }
      }
    },
    // Exclude users I already follow
    {
      $lookup: {
        from: 'follows',
        let: { suggestedUserId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$follower', userId] },
                  { $eq: ['$following', '$$suggestedUserId'] },
                  { $eq: ['$status', 'active'] }
                ]
              }
            }
          }
        ],
        as: 'existingFollow'
      }
    },
    {
      $match: {
        existingFollow: { $size: 0 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        _id: '$user._id',
        username: '$user.username',
        firstName: '$user.firstName',
        lastName: '$user.lastName',
        avatar: '$user.avatar',
        bio: '$user.bio',
        mutualConnections: 1,
        reason: 'mutual_follows'
      }
    },
    {
      $sort: { mutualConnections: -1 }
    },
    {
      $limit: options.limit || 10
    }
  ]);
};

// Instance methods
FollowSchema.methods.updateMutualStatus = async function() {
  const mutualFollow = await this.constructor.findOne({
    follower: this.following,
    following: this.follower,
    status: 'active'
  });
  
  this.isMutual = !!mutualFollow;
  
  if (mutualFollow) {
    mutualFollow.isMutual = true;
    await mutualFollow.save();
  }
  
  return this.save();
};

// Pre-save middleware
FollowSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Check for mutual follow
    const mutualFollow = await this.constructor.findOne({
      follower: this.following,
      following: this.follower,
      status: 'active'
    });
    
    if (mutualFollow) {
      this.isMutual = true;
      mutualFollow.isMutual = true;
      await mutualFollow.save();
    }
  }
  
  next();
});

// Post-remove middleware to update mutual status
FollowSchema.post('findOneAndDelete', async function(doc) {
  if (doc && doc.isMutual) {
    const mutualFollow = await this.model.findOne({
      follower: doc.following,
      following: doc.follower,
      status: 'active'
    });
    
    if (mutualFollow) {
      mutualFollow.isMutual = false;
      await mutualFollow.save();
    }
  }
});

module.exports = mongoose.model('Follow', FollowSchema);