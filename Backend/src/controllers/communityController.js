/**
 * Community Controller - Twitter-like social media functionality
 * Handles posts, follows, timeline, trending, and social interactions
 */

const CommunityPost = require('../models/CommunityPost');
const Follow = require('../models/Follow');
const User = require('../models/User');
const Video = require('../models/Video');
const cloudinary = require('cloudinary').v2;
const { validationResult } = require('express-validator');

class CommunityController {
  
  // =====================================
  // POST MANAGEMENT
  // =====================================
  
  /**
   * Create a new community post/tweet
   */
  async createPost(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: errors.array()
          }
        });
      }
      
      const userId = req.user.id;
      const { text, hashtags, mentions, videoId, visibility = 'public', location } = req.body;
      
      // CRITICAL SECURITY: Check for teaching-related content from unverified users
      if (hashtags?.includes('guru') || hashtags?.includes('teacher') || 
          text?.toLowerCase().includes('teaching') || text?.toLowerCase().includes('sanskrit lesson')) {
        if (req.user.role !== 'guru' || !req.user.guruProfile?.verification?.isVerified) {
          return res.status(403).json({
            success: false,
            error: {
              message: 'Teaching-related content requires verified guru status',
              code: 'TEACHING_CONTENT_RESTRICTED'
            }
          });
        }
      }
      
      // Validate content
      if (!text && !videoId && (!req.files || !req.files.images)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Post must contain text, video, or images'
          }
        });
      }
      
      const postData = {
        author: userId,
        content: {
          text,
          hashtags: hashtags || [],
          mentions: mentions || []
        },
        visibility,
        location
      };
      
      // Handle video attachment
      if (videoId) {
        const video = await Video.findById(videoId);
        if (!video) {
          return res.status(404).json({
            success: false,
            error: { message: 'Video not found' }
          });
        }
        
        postData.content.media = { video: videoId };
        postData.postType = 'video';
      }
      
      // Handle image uploads
      if (req.files && req.files.images) {
        const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        const imageUploads = [];
        
        for (const image of images) {
          const result = await cloudinary.uploader.upload(image.tempFilePath, {
            folder: 'ShlokaYug/community/images',
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 675, crop: 'limit' },
              { quality: 'auto', format: 'auto' }
            ]
          });
          
          imageUploads.push({
            url: result.secure_url,
            publicId: result.public_id,
            alt: `Image by ${req.user.username}`
          });
        }
        
        if (!postData.content.media) postData.content.media = {};
        postData.content.media.images = imageUploads;
        postData.postType = 'image';
      }
      
      const post = new CommunityPost(postData);
      await post.save();
      
      await post.populate([
        { path: 'author', select: 'username firstName lastName avatar' },
        { path: 'content.media.video', select: 'title thumbnail duration' }
      ]);
      
      res.status(201).json({
        success: true,
        data: { post },
        message: 'Post created successfully'
      });
      
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to create post',
          details: error.message
        }
      });
    }
  }
  
  /**
   * Get user's timeline/feed
   */
  async getTimeline(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, type = 'all' } = req.query;
      const skip = (page - 1) * limit;
      
      // Get users that current user follows
      const following = await Follow.find({
        follower: userId,
        status: 'active'
      }).select('following');
      
      const followingIds = following.map(f => f.following);
      followingIds.push(userId); // Include own posts
      
      // Build query based on type
      let query = {
        author: { $in: followingIds },
        visibility: { $in: ['public', 'followers'] },
        isHidden: false
      };
      
      if (type !== 'all') {
        query.postType = type;
      }
      
      const posts = await CommunityPost.find(query)
        .populate('author', 'username firstName lastName avatar isVerified')
        .populate('originalPost')
        .populate({
          path: 'originalPost',
          populate: {
            path: 'author',
            select: 'username firstName lastName avatar isVerified'
          }
        })
        .populate('content.media.video', 'title thumbnail duration views')
        .populate('content.mentions', 'username firstName lastName')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);
      
      // Update view counts
      const postIds = posts.map(p => p._id);
      await CommunityPost.updateMany(
        { _id: { $in: postIds } },
        { $inc: { 'metrics.views': 1 } }
      );
      
      const totalPosts = await CommunityPost.countDocuments(query);
      const hasMore = skip + posts.length < totalPosts;
      
      res.json({
        success: true,
        data: {
          posts,
          pagination: {
            current: parseInt(page),
            total: Math.ceil(totalPosts / limit),
            hasMore
          }
        }
      });
      
    } catch (error) {
      console.error('Get timeline error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get timeline',
          details: error.message
        }
      });
    }
  }
  
  /**
   * Get public/explore feed
   */
  async getExploreFeed(req, res) {
    try {
      const { page = 1, limit = 20, sort = 'recent' } = req.query;
      const skip = (page - 1) * limit;
      
      const query = {
        visibility: 'public',
        isHidden: false
      };
      
      let sortOptions;
      switch (sort) {
        case 'popular':
          sortOptions = { 'metrics.likes': -1, 'metrics.retweets': -1 };
          break;
        case 'trending':
          // Posts from last 24 hours with high engagement
          query.createdAt = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
          sortOptions = { 
            'metrics.likes': -1, 
            'metrics.retweets': -1, 
            'metrics.comments': -1 
          };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }
      
      const posts = await CommunityPost.find(query)
        .populate('author', 'username firstName lastName avatar isVerified')
        .populate('originalPost')
        .populate('content.media.video', 'title thumbnail duration views')
        .sort(sortOptions)
        .limit(parseInt(limit))
        .skip(skip);
      
      res.json({
        success: true,
        data: { posts }
      });
      
    } catch (error) {
      console.error('Get explore feed error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get explore feed' }
      });
    }
  }
  
  /**
   * Get user's posts
   */
  async getUserPosts(req, res) {
    try {
      const { username } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;
      
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }
      
      const query = {
        author: user._id,
        isHidden: false
      };
      
      // Check privacy
      const isOwnProfile = req.user && req.user.id === user._id.toString();
      if (!isOwnProfile) {
        query.visibility = { $in: ['public', 'followers'] };
        
        // If not following and not own profile, only show public
        if (req.user) {
          const isFollowing = await Follow.isFollowing(req.user.id, user._id);
          if (!isFollowing) {
            query.visibility = 'public';
          }
        } else {
          query.visibility = 'public';
        }
      }
      
      const posts = await CommunityPost.find(query)
        .populate('author', 'username firstName lastName avatar isVerified')
        .populate('content.media.video', 'title thumbnail duration views')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);
      
      res.json({
        success: true,
        data: { posts, user: { username: user.username, firstName: user.firstName, lastName: user.lastName } }
      });
      
    } catch (error) {
      console.error('Get user posts error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get user posts' }
      });
    }
  }
  
  /**
   * Like a post
   */
  async likePost(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;
      
      const post = await CommunityPost.findById(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          error: { message: 'Post not found' }
        });
      }
      
      const alreadyLiked = post.likedBy.some(like => like.user.toString() === userId);
      
      if (alreadyLiked) {
        await post.unlike(userId);
      } else {
        await post.like(userId);
      }
      
      res.json({
        success: true,
        data: {
          liked: !alreadyLiked,
          likesCount: post.metrics.likes
        },
        message: alreadyLiked ? 'Post unliked' : 'Post liked'
      });
      
    } catch (error) {
      console.error('Like post error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to like/unlike post' }
      });
    }
  }
  
  /**
   * Retweet/Repost
   */
  async repost(req, res) {
    try {
      const { postId } = req.params;
      const { quoteText } = req.body;
      const userId = req.user.id;
      
      const originalPost = await CommunityPost.findById(postId);
      if (!originalPost) {
        return res.status(404).json({
          success: false,
          error: { message: 'Post not found' }
        });
      }
      
      // Check if already retweeted
      const alreadyRetweeted = originalPost.retweetedBy.some(rt => rt.user.toString() === userId);
      if (alreadyRetweeted) {
        return res.status(400).json({
          success: false,
          error: { message: 'Already retweeted' }
        });
      }
      
      const [updatedOriginalPost, repost] = await originalPost.repost(userId, quoteText);
      
      await repost.populate('author', 'username firstName lastName avatar');
      await repost.populate('originalPost');
      
      res.status(201).json({
        success: true,
        data: { repost },
        message: quoteText ? 'Quote posted' : 'Retweeted successfully'
      });
      
    } catch (error) {
      console.error('Repost error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to repost' }
      });
    }
  }
  
  /**
   * Add comment to post
   */
  async addComment(req, res) {
    try {
      const { postId } = req.params;
      const { text } = req.body;
      const userId = req.user.id;
      
      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Comment text is required' }
        });
      }
      
      const post = await CommunityPost.findById(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          error: { message: 'Post not found' }
        });
      }
      
      await post.addComment(userId, text.trim());
      
      await post.populate({
        path: 'comments.author',
        select: 'username firstName lastName avatar'
      });
      
      const newComment = post.comments[post.comments.length - 1];
      
      res.status(201).json({
        success: true,
        data: { comment: newComment },
        message: 'Comment added successfully'
      });
      
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to add comment' }
      });
    }
  }
  
  // =====================================
  // FOLLOW SYSTEM
  // =====================================
  
  /**
   * Follow a user
   */
  async followUser(req, res) {
    try {
      const { username } = req.params;
      const userId = req.user.id;
      
      const userToFollow = await User.findOne({ username });
      if (!userToFollow) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }
      
      if (userToFollow._id.toString() === userId) {
        return res.status(400).json({
          success: false,
          error: { message: 'Cannot follow yourself' }
        });
      }
      
      // Check if already following
      const existingFollow = await Follow.findOne({
        follower: userId,
        following: userToFollow._id
      });
      
      if (existingFollow) {
        if (existingFollow.status === 'active') {
          return res.status(400).json({
            success: false,
            error: { message: 'Already following this user' }
          });
        } else {
          // Reactivate follow
          existingFollow.status = 'active';
          existingFollow.followedAt = new Date();
          await existingFollow.save();
          await existingFollow.updateMutualStatus();
        }
      } else {
        // Create new follow
        const follow = new Follow({
          follower: userId,
          following: userToFollow._id
        });
        await follow.save();
        await follow.updateMutualStatus();
      }
      
      // Update user follower counts (if you have these fields in User model)
      // await User.findByIdAndUpdate(userToFollow._id, { $inc: { followersCount: 1 } });
      // await User.findByIdAndUpdate(userId, { $inc: { followingCount: 1 } });
      
      res.json({
        success: true,
        message: `Now following ${userToFollow.username}`
      });
      
    } catch (error) {
      console.error('Follow user error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to follow user' }
      });
    }
  }
  
  /**
   * Unfollow a user
   */
  async unfollowUser(req, res) {
    try {
      const { username } = req.params;
      const userId = req.user.id;
      
      const userToUnfollow = await User.findOne({ username });
      if (!userToUnfollow) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }
      
      const follow = await Follow.findOneAndDelete({
        follower: userId,
        following: userToUnfollow._id,
        status: 'active'
      });
      
      if (!follow) {
        return res.status(400).json({
          success: false,
          error: { message: 'Not following this user' }
        });
      }
      
      res.json({
        success: true,
        message: `Unfollowed ${userToUnfollow.username}`
      });
      
    } catch (error) {
      console.error('Unfollow user error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to unfollow user' }
      });
    }
  }
  
  /**
   * Get user's followers
   */
  async getFollowers(req, res) {
    try {
      const { username } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }
      
      const followers = await Follow.getFollowers(user._id, {
        limit: parseInt(limit),
        skip: (page - 1) * limit
      });
      
      const totalFollowers = await Follow.getFollowersCount(user._id);
      
      res.json({
        success: true,
        data: {
          followers: followers.map(f => f.follower),
          pagination: {
            current: parseInt(page),
            total: Math.ceil(totalFollowers / limit),
            count: totalFollowers
          }
        }
      });
      
    } catch (error) {
      console.error('Get followers error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get followers' }
      });
    }
  }
  
  /**
   * Get user's following
   */
  async getFollowing(req, res) {
    try {
      const { username } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }
      
      const following = await Follow.getFollowing(user._id, {
        limit: parseInt(limit),
        skip: (page - 1) * limit
      });
      
      const totalFollowing = await Follow.getFollowingCount(user._id);
      
      res.json({
        success: true,
        data: {
          following: following.map(f => f.following),
          pagination: {
            current: parseInt(page),
            total: Math.ceil(totalFollowing / limit),
            count: totalFollowing
          }
        }
      });
      
    } catch (error) {
      console.error('Get following error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get following' }
      });
    }
  }
  
  /**
   * Get suggested users to follow
   */
  async getSuggestedFollows(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10 } = req.query;
      
      const suggestions = await Follow.getSuggestedFollows(userId, {
        limit: parseInt(limit)
      });
      
      res.json({
        success: true,
        data: { suggestions }
      });
      
    } catch (error) {
      console.error('Get suggested follows error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get suggested follows' }
      });
    }
  }
  
  // =====================================
  // DISCOVERY & TRENDING
  // =====================================
  
  /**
   * Get trending hashtags
   */
  async getTrendingHashtags(req, res) {
    try {
      const { timeframe = 24 } = req.query;
      
      const trending = await CommunityPost.getTrendingHashtags(parseInt(timeframe));
      
      res.json({
        success: true,
        data: { hashtags: trending }
      });
      
    } catch (error) {
      console.error('Get trending hashtags error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get trending hashtags' }
      });
    }
  }
  
  /**
   * Search posts by hashtag
   */
  async getPostsByHashtag(req, res) {
    try {
      const { hashtag } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const posts = await CommunityPost.findByHashtag(hashtag, {
        limit: parseInt(limit),
        skip: (page - 1) * limit
      });
      
      res.json({
        success: true,
        data: { posts, hashtag }
      });
      
    } catch (error) {
      console.error('Get posts by hashtag error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get posts by hashtag' }
      });
    }
  }
  
  /**
   * Search posts and users
   */
  async search(req, res) {
    try {
      const { q, type = 'all', page = 1, limit = 20 } = req.query;
      
      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Search query is required' }
        });
      }
      
      const searchTerm = q.trim();
      const skip = (page - 1) * limit;
      
      const results = { posts: [], users: [], hashtags: [] };
      
      if (type === 'all' || type === 'posts') {
        results.posts = await CommunityPost.find({
          $text: { $search: searchTerm },
          visibility: 'public',
          isHidden: false
        })
        .populate('author', 'username firstName lastName avatar')
        .sort({ score: { $meta: 'textScore' } })
        .limit(parseInt(limit))
        .skip(skip);
      }
      
      if (type === 'all' || type === 'users') {
        results.users = await User.find({
          $or: [
            { username: { $regex: searchTerm, $options: 'i' } },
            { firstName: { $regex: searchTerm, $options: 'i' } },
            { lastName: { $regex: searchTerm, $options: 'i' } },
            { bio: { $regex: searchTerm, $options: 'i' } }
          ]
        })
        .select('username firstName lastName avatar bio isVerified')
        .limit(parseInt(limit))
        .skip(skip);
      }
      
      if (type === 'all' || type === 'hashtags') {
        results.hashtags = await CommunityPost.aggregate([
          {
            $match: {
              'content.hashtags': { $regex: searchTerm, $options: 'i' },
              visibility: 'public',
              isHidden: false
            }
          },
          {
            $unwind: '$content.hashtags'
          },
          {
            $match: {
              'content.hashtags': { $regex: searchTerm, $options: 'i' }
            }
          },
          {
            $group: {
              _id: '$content.hashtags',
              count: { $sum: 1 }
            }
          },
          {
            $sort: { count: -1 }
          },
          {
            $limit: 10
          }
        ]);
      }
      
      res.json({
        success: true,
        data: results
      });
      
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Search failed' }
      });
    }
  }
}

module.exports = new CommunityController();