const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  // Video reference
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: [true, 'Video ID is required'],
    index: true
  },
  
  // Commenter information
  author: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author ID is required'],
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
      type: String
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  
  // Comment content
  content: {
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    mentions: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      username: String,
      startIndex: Number,
      endIndex: Number
    }],
    hashtags: [String]
  },
  
  // Comment threading
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },
  
  replies: {
    count: {
      type: Number,
      default: 0
    },
    latest: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }]
  },
  
  // Engagement
  likes: {
    count: {
      type: Number,
      default: 0,
      index: -1
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  dislikes: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // Moderation
  isEdited: {
    type: Boolean,
    default: false
  },
  
  editedAt: Date,
  
  isHidden: {
    type: Boolean,
    default: false
  },
  
  isPinned: {
    type: Boolean,
    default: false
  },
  
  isReported: {
    type: Boolean,
    default: false,
    index: true
  },
  
  reports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'hate', 'harassment', 'misinformation', 'inappropriate', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['published', 'hidden', 'deleted', 'pending_review'],
    default: 'published',
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
commentSchema.index({ videoId: 1, createdAt: -1 });
commentSchema.index({ 'author.userId': 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, createdAt: -1 });
commentSchema.index({ 'likes.count': -1, createdAt: -1 });
commentSchema.index({ isPinned: -1, 'likes.count': -1, createdAt: -1 });

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
  return this.replies.count;
});

// Virtual for net likes (likes - dislikes)
commentSchema.virtual('netLikes').get(function() {
  return this.likes.count - this.dislikes.count;
});

// Methods
commentSchema.methods.addLike = async function(userId) {
  if (!this.likes.users.includes(userId)) {
    this.likes.users.push(userId);
    this.likes.count += 1;
    
    // Remove from dislikes if present
    const dislikeIndex = this.dislikes.users.indexOf(userId);
    if (dislikeIndex > -1) {
      this.dislikes.users.splice(dislikeIndex, 1);
      this.dislikes.count -= 1;
    }
    
    await this.save();
  }
  return this;
};

commentSchema.methods.addDislike = async function(userId) {
  if (!this.dislikes.users.includes(userId)) {
    this.dislikes.users.push(userId);
    this.dislikes.count += 1;
    
    // Remove from likes if present
    const likeIndex = this.likes.users.indexOf(userId);
    if (likeIndex > -1) {
      this.likes.users.splice(likeIndex, 1);
      this.likes.count -= 1;
    }
    
    await this.save();
  }
  return this;
};

commentSchema.methods.removeLike = async function(userId) {
  const index = this.likes.users.indexOf(userId);
  if (index > -1) {
    this.likes.users.splice(index, 1);
    this.likes.count -= 1;
    await this.save();
  }
  return this;
};

commentSchema.methods.removeDislike = async function(userId) {
  const index = this.dislikes.users.indexOf(userId);
  if (index > -1) {
    this.dislikes.users.splice(index, 1);
    this.dislikes.count -= 1;
    await this.save();
  }
  return this;
};

module.exports = mongoose.model('Comment', commentSchema);