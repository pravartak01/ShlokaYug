const Video = require('../models/Video');
const Comment = require('../models/Comment');
const { VideoReaction, Playlist, Subscription } = require('../models/VideoInteractions');
const User = require('../models/User');

/**
 * Toggle video like/dislike
 * @route POST /api/v1/videos/:videoId/react
 * @access Private
 */
const toggleVideoReaction = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { type } = req.body; // 'like' or 'dislike'
    const userId = req.user._id;

    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid reaction type. Must be "like" or "dislike"',
          code: 'INVALID_REACTION_TYPE'
        }
      });
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        error: { message: 'Video not found' }
      });
    }

    // Find existing reaction
    const existingReaction = await VideoReaction.findOne({ videoId, userId });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Remove reaction if clicking same type
        await VideoReaction.deleteOne({ videoId, userId });
        
        // Update video metrics
        if (type === 'like') {
          video.metrics.likes = Math.max(0, video.metrics.likes - 1);
        } else {
          video.metrics.dislikes = Math.max(0, video.metrics.dislikes - 1);
        }
        
        await video.save();
        await video.updateEngagement();

        return res.json({
          success: true,
          data: {
            action: 'removed',
            type,
            likes: video.metrics.likes,
            dislikes: video.metrics.dislikes,
            userReaction: null
          }
        });
      } else {
        // Change reaction type
        const oldType = existingReaction.type;
        existingReaction.type = type;
        await existingReaction.save();
        
        // Update video metrics
        if (oldType === 'like') {
          video.metrics.likes = Math.max(0, video.metrics.likes - 1);
          video.metrics.dislikes += 1;
        } else {
          video.metrics.dislikes = Math.max(0, video.metrics.dislikes - 1);
          video.metrics.likes += 1;
        }
        
        await video.save();
        await video.updateEngagement();

        return res.json({
          success: true,
          data: {
            action: 'changed',
            type,
            likes: video.metrics.likes,
            dislikes: video.metrics.dislikes,
            userReaction: type
          }
        });
      }
    } else {
      // Create new reaction
      await VideoReaction.create({ videoId, userId, type });
      
      // Update video metrics
      if (type === 'like') {
        video.metrics.likes += 1;
      } else {
        video.metrics.dislikes += 1;
      }
      
      await video.save();
      await video.updateEngagement();

      res.json({
        success: true,
        data: {
          action: 'added',
          type,
          likes: video.metrics.likes,
          dislikes: video.metrics.dislikes,
          userReaction: type
        }
      });
    }

  } catch (error) {
    console.error('Toggle video reaction error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update reaction',
        code: 'REACTION_ERROR'
      }
    });
  }
};

/**
 * Add comment to video
 * @route POST /api/v1/videos/:videoId/comments
 * @access Private
 */
const addComment = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { text, parentCommentId } = req.body;
    const user = req.user;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Comment text is required',
          code: 'COMMENT_TEXT_REQUIRED'
        }
      });
    }

    // Check if video exists and comments are enabled
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        error: { message: 'Video not found' }
      });
    }

    if (!video.commentsSettings.enabled) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Comments are disabled for this video',
          code: 'COMMENTS_DISABLED'
        }
      });
    }

    // Check comment permissions
    if (video.commentsSettings.allowedUsers === 'subscribers') {
      const isSubscribed = await Subscription.isSubscribed(user._id, video.creator.userId);
      if (!isSubscribed) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Only subscribers can comment on this video',
            code: 'SUBSCRIBERS_ONLY'
          }
        });
      }
    }

    // Validate parent comment if replying
    if (parentCommentId) {
      const parentComment = await Comment.findOne({
        _id: parentCommentId,
        videoId,
        status: 'published'
      });

      if (!parentComment) {
        return res.status(404).json({
          success: false,
          error: { message: 'Parent comment not found' }
        });
      }
    }

    // Process mentions and hashtags
    const mentions = extractMentions(text);
    const hashtags = extractHashtags(text);

    // Create comment
    const comment = new Comment({
      videoId,
      author: {
        userId: user._id,
        username: user.username,
        displayName: user.profile?.firstName && user.profile?.lastName
          ? `${user.profile.firstName} ${user.profile.lastName}`
          : user.username,
        avatar: user.profile?.avatar,
        isVerified: user.verification?.isVerified || false
      },
      content: {
        text: text.trim(),
        mentions,
        hashtags
      },
      parentComment: parentCommentId || null
    });

    await comment.save();

    // Update parent comment reply count
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $inc: { 'replies.count': 1 },
        $push: { 'replies.latest': comment._id }
      });
    }

    // Update video comment count
    video.metrics.comments += 1;
    await video.save();
    await video.updateEngagement();

    // Populate comment for response
    await comment.populate('author.userId', 'username profile.displayName profile.avatar verification.isVerified');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: {
          ...comment.toObject(),
          netLikes: comment.netLikes
        }
      }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to add comment',
        code: 'COMMENT_ERROR'
      }
    });
  }
};

/**
 * Get video comments
 * @route GET /api/v1/videos/:videoId/comments
 * @access Public
 */
const getVideoComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    const {
      page = 1,
      limit = 20,
      sortBy = 'newest', // newest, oldest, popular
      parentOnly = false
    } = req.query;

    const skip = (page - 1) * limit;
    let query = {
      videoId,
      status: 'published'
    };

    // Filter for top-level comments only if specified
    if (parentOnly === 'true') {
      query.parentComment = null;
    }

    // Determine sort order
    let sort = {};
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'popular':
        sort = { 'likes.count': -1, createdAt: -1 };
        break;
      default: // newest
        sort = { createdAt: -1 };
    }

    const comments = await Comment.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author.userId', 'username profile.displayName profile.avatar verification.isVerified')
      .populate({
        path: 'replies.latest',
        select: 'author content createdAt likes.count',
        populate: {
          path: 'author.userId',
          select: 'username profile.displayName profile.avatar'
        },
        options: { limit: 3 }
      });

    const total = await Comment.countDocuments(query);

    res.json({
      success: true,
      data: {
        comments: comments.map(comment => ({
          ...comment.toObject(),
          netLikes: comment.netLikes
        })),
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: comments.length,
          totalComments: total
        }
      }
    });

  } catch (error) {
    console.error('Get video comments error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch comments',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Toggle comment like
 * @route POST /api/v1/comments/:commentId/like
 * @access Private
 */
const toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Comment not found' }
      });
    }

    const hasLiked = comment.likes.users.includes(userId);
    
    if (hasLiked) {
      await comment.removeLike(userId);
      res.json({
        success: true,
        data: {
          action: 'removed',
          likes: comment.likes.count,
          userHasLiked: false
        }
      });
    } else {
      await comment.addLike(userId);
      res.json({
        success: true,
        data: {
          action: 'added',
          likes: comment.likes.count,
          userHasLiked: true
        }
      });
    }

  } catch (error) {
    console.error('Toggle comment like error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update comment like',
        code: 'LIKE_ERROR'
      }
    });
  }
};

/**
 * Subscribe/Unsubscribe to channel
 * @route POST /api/v1/channels/:channelId/subscribe
 * @access Private
 */
const toggleSubscription = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    // Can't subscribe to yourself
    if (channelId === userId.toString()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot subscribe to your own channel',
          code: 'SELF_SUBSCRIPTION'
        }
      });
    }

    // Check if channel exists
    const channel = await User.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        error: { message: 'Channel not found' }
      });
    }

    // Check existing subscription
    const existingSubscription = await Subscription.findOne({
      'subscriber.userId': userId,
      'channel.userId': channelId
    });

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        // Unsubscribe
        existingSubscription.isActive = false;
        existingSubscription.unsubscribedAt = new Date();
        await existingSubscription.save();

        res.json({
          success: true,
          data: {
            action: 'unsubscribed',
            isSubscribed: false,
            subscriberCount: await Subscription.getSubscriberCount(channelId)
          }
        });
      } else {
        // Resubscribe
        existingSubscription.isActive = true;
        existingSubscription.subscribedAt = new Date();
        existingSubscription.unsubscribedAt = null;
        await existingSubscription.save();

        res.json({
          success: true,
          data: {
            action: 'subscribed',
            isSubscribed: true,
            subscriberCount: await Subscription.getSubscriberCount(channelId)
          }
        });
      }
    } else {
      // Create new subscription
      await Subscription.create({
        subscriber: {
          userId,
          username: req.user.username,
          avatar: req.user.profile?.avatar
        },
        channel: {
          userId: channelId,
          username: channel.username,
          displayName: channel.profile?.firstName && channel.profile?.lastName
            ? `${channel.profile.firstName} ${channel.profile.lastName}`
            : channel.username,
          avatar: channel.profile?.avatar
        }
      });

      res.json({
        success: true,
        data: {
          action: 'subscribed',
          isSubscribed: true,
          subscriberCount: await Subscription.getSubscriberCount(channelId)
        }
      });
    }

  } catch (error) {
    console.error('Toggle subscription error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update subscription',
        code: 'SUBSCRIPTION_ERROR'
      }
    });
  }
};

/**
 * Get user's subscriptions
 * @route GET /api/v1/subscriptions
 * @access Private
 */
const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const subscriptions = await Subscription.find({
      'subscriber.userId': userId,
      isActive: true
    })
    .sort({ subscribedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('channel.userId', 'username profile.displayName profile.avatar');

    const total = await Subscription.countDocuments({
      'subscriber.userId': userId,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        subscriptions: subscriptions.map(sub => ({
          channelId: sub.channel.userId._id,
          channelName: sub.channel.displayName || sub.channel.username,
          channelUsername: sub.channel.username,
          avatar: sub.channel.avatar,
          subscribedAt: sub.subscribedAt,
          notifications: sub.notifications
        })),
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: subscriptions.length,
          totalSubscriptions: total
        }
      }
    });

  } catch (error) {
    console.error('Get user subscriptions error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch subscriptions',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Helper functions
 */
const extractMentions = (text) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({
      username: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });
  }

  return mentions;
};

const extractHashtags = (text) => {
  const hashtagRegex = /#(\w+)/g;
  const hashtags = [];
  let match;

  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1].toLowerCase());
  }

  return [...new Set(hashtags)]; // Remove duplicates
};

module.exports = {
  toggleVideoReaction,
  addComment,
  getVideoComments,
  toggleCommentLike,
  toggleSubscription,
  getUserSubscriptions
};