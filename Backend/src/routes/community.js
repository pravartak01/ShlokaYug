/**
 * Community Routes - Twitter-like social media API endpoints
 * Handles posts, follows, timeline, trending, search functionality
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const multer = require('multer');
const path = require('path');

// Import middleware
const { auth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');

// Import controller
const communityController = require('../controllers/communityController');

// =====================================
// MULTER CONFIGURATION FOR IMAGE UPLOADS
// =====================================

const upload = multer({
  dest: 'uploads/temp/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 4 // Maximum 4 images per post
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
    }
  }
});

// =====================================
// VALIDATION RULES
// =====================================

const createPostValidation = [
  body('text')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Post text cannot exceed 500 characters')
    .trim(),
    
  body('videoId')
    .optional()
    .isMongoId()
    .withMessage('Invalid video ID'),
    
  body('hashtags')
    .optional()
    .isArray()
    .withMessage('Hashtags must be an array'),
    
  body('mentions')
    .optional()
    .isArray()
    .withMessage('Mentions must be an array'),
    
  body('visibility')
    .optional()
    .isIn(['public', 'followers', 'private'])
    .withMessage('Invalid visibility option'),
    
  body('location.name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location name too long'),
];

const commentValidation = [
  body('text')
    .notEmpty()
    .withMessage('Comment text is required')
    .isLength({ max: 280 })
    .withMessage('Comment cannot exceed 280 characters')
    .trim(),
];

const searchValidation = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be 2-100 characters'),
    
  query('type')
    .optional()
    .isIn(['all', 'posts', 'users', 'hashtags'])
    .withMessage('Invalid search type'),
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];

// =====================================
// POST MANAGEMENT ROUTES
// =====================================

/**
 * @route   POST /api/v1/community/posts
 * @desc    Create a new community post/tweet
 * @access  Private
 */
router.post('/posts',
  auth,
  upload.array('images', 4),
  createPostValidation,
  validateRequest,
  communityController.createPost
);

/**
 * @route   GET /api/v1/community/timeline
 * @desc    Get user's personalized timeline/feed
 * @access  Private
 */
router.get('/timeline',
  auth,
  [
    ...paginationValidation,
    query('type')
      .optional()
      .isIn(['all', 'text', 'video', 'image', 'retweet'])
      .withMessage('Invalid post type filter')
  ],
  validateRequest,
  communityController.getTimeline
);

/**
 * @route   GET /api/v1/community/explore
 * @desc    Get public/explore feed
 * @access  Public
 */
router.get('/explore',
  [
    ...paginationValidation,
    query('sort')
      .optional()
      .isIn(['recent', 'popular', 'trending'])
      .withMessage('Invalid sort option')
  ],
  validateRequest,
  communityController.getExploreFeed
);

/**
 * @route   GET /api/v1/community/users/:username/posts
 * @desc    Get user's posts
 * @access  Public
 */
router.get('/users/:username/posts',
  [
    param('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Invalid username')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    ...paginationValidation
  ],
  validateRequest,
  communityController.getUserPosts
);

/**
 * @route   POST /api/v1/community/posts/:postId/like
 * @desc    Like/Unlike a post
 * @access  Private
 */
router.post('/posts/:postId/like',
  auth,
  [
    param('postId')
      .isMongoId()
      .withMessage('Invalid post ID')
  ],
  validateRequest,
  communityController.likePost
);

/**
 * @route   POST /api/v1/community/posts/:postId/repost
 * @desc    Retweet/Quote a post
 * @access  Private
 */
router.post('/posts/:postId/repost',
  auth,
  [
    param('postId')
      .isMongoId()
      .withMessage('Invalid post ID'),
    body('quoteText')
      .optional()
      .isLength({ max: 280 })
      .withMessage('Quote text cannot exceed 280 characters')
      .trim()
  ],
  validateRequest,
  communityController.repost
);

/**
 * @route   POST /api/v1/community/posts/:postId/comments
 * @desc    Add comment to a post
 * @access  Private
 */
router.post('/posts/:postId/comments',
  auth,
  [
    param('postId')
      .isMongoId()
      .withMessage('Invalid post ID'),
    ...commentValidation
  ],
  validateRequest,
  communityController.addComment
);

// =====================================
// FOLLOW SYSTEM ROUTES
// =====================================

/**
 * @route   POST /api/v1/community/users/:username/follow
 * @desc    Follow a user
 * @access  Private
 */
router.post('/users/:username/follow',
  auth,
  [
    param('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Invalid username')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores')
  ],
  validateRequest,
  communityController.followUser
);

/**
 * @route   DELETE /api/v1/community/users/:username/follow
 * @desc    Unfollow a user
 * @access  Private
 */
router.delete('/users/:username/follow',
  auth,
  [
    param('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Invalid username')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores')
  ],
  validateRequest,
  communityController.unfollowUser
);

/**
 * @route   GET /api/v1/community/users/:username/followers
 * @desc    Get user's followers
 * @access  Public
 */
router.get('/users/:username/followers',
  [
    param('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Invalid username')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    ...paginationValidation
  ],
  validateRequest,
  communityController.getFollowers
);

/**
 * @route   GET /api/v1/community/users/:username/following
 * @desc    Get user's following
 * @access  Public
 */
router.get('/users/:username/following',
  [
    param('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Invalid username')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    ...paginationValidation
  ],
  validateRequest,
  communityController.getFollowing
);

/**
 * @route   GET /api/v1/community/suggestions/follow
 * @desc    Get suggested users to follow
 * @access  Private
 */
router.get('/suggestions/follow',
  auth,
  [
    query('limit')
      .optional()
      .isInt({ min: 5, max: 20 })
      .withMessage('Limit must be between 5 and 20')
  ],
  validateRequest,
  communityController.getSuggestedFollows
);

// =====================================
// DISCOVERY & TRENDING ROUTES
// =====================================

/**
 * @route   GET /api/v1/community/trending/hashtags
 * @desc    Get trending hashtags
 * @access  Public
 */
router.get('/trending/hashtags',
  [
    query('timeframe')
      .optional()
      .isInt({ min: 1, max: 168 })
      .withMessage('Timeframe must be between 1 and 168 hours')
  ],
  validateRequest,
  communityController.getTrendingHashtags
);

/**
 * @route   GET /api/v1/community/hashtags/:hashtag/posts
 * @desc    Get posts by hashtag
 * @access  Public
 */
router.get('/hashtags/:hashtag/posts',
  [
    param('hashtag')
      .isLength({ min: 1, max: 50 })
      .withMessage('Invalid hashtag')
      .matches(/^[a-zA-Z0-9\u0900-\u097F_]+$/)
      .withMessage('Hashtag contains invalid characters'),
    ...paginationValidation
  ],
  validateRequest,
  communityController.getPostsByHashtag
);

/**
 * @route   GET /api/v1/community/search
 * @desc    Search posts, users, and hashtags
 * @access  Public
 */
router.get('/search',
  [
    ...searchValidation,
    ...paginationValidation
  ],
  validateRequest,
  communityController.search
);

// =====================================
// ADDITIONAL UTILITY ROUTES
// =====================================

/**
 * @route   GET /api/v1/community/stats
 * @desc    Get community statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    const CommunityPost = require('../models/CommunityPost');
    const Follow = require('../models/Follow');
    const User = require('../models/User');
    
    const [
      totalPosts,
      totalFollows,
      totalUsers,
      postsToday
    ] = await Promise.all([
      CommunityPost.countDocuments({ visibility: 'public', isHidden: false }),
      Follow.countDocuments({ status: 'active' }),
      User.countDocuments(),
      CommunityPost.countDocuments({
        visibility: 'public',
        isHidden: false,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    ]);
    
    res.json({
      success: true,
      data: {
        totalPosts,
        totalFollows,
        totalUsers,
        postsToday,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get community stats' }
    });
  }
});

/**
 * @route   GET /api/v1/community/health
 * @desc    Health check for community service
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      service: 'community',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      features: [
        'posts',
        'follows',
        'timeline',
        'trending',
        'search'
      ]
    }
  });
});

module.exports = router;