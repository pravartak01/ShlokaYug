const Video = require('../models/Video');
const { VideoReaction, ViewHistory } = require('../models/VideoInteractions');

/**
 * Get shorts feed (swipeable format)
 * @route GET /api/v1/shorts/feed
 * @access Public
 */
const getShortsFeed = async (req, res) => {
  try {
    const {
      lastVideoId, // For pagination in swipe format
      limit = 20,
      category,
      hashtag
    } = req.query;

    const userId = req.user?._id;
    let query = {
      type: 'short',
      status: 'published',
      visibility: 'public'
    };

    // Add filters
    if (category) query.category = category;
    if (hashtag) query['shorts.hashtags'] = hashtag;

    // Exclude videos user has already seen (if logged in)
    if (userId && lastVideoId) {
      // Get recently viewed shorts to avoid repetition
      const recentViews = await ViewHistory.find({
        userId,
        'video.type': 'short',
        watchedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }).distinct('videoId');

      query._id = { $nin: recentViews };
    }

    // For infinite scroll, exclude already loaded videos
    if (lastVideoId) {
      const lastVideo = await Video.findById(lastVideoId).select('createdAt');
      if (lastVideo) {
        query.createdAt = { $lt: lastVideo.createdAt };
      }
    }

    // Get shorts optimized for mobile viewing
    const shorts = await Video.find(query)
      .sort({ 'metrics.engagement.rate': -1, createdAt: -1 }) // Prioritize engaging content
      .limit(parseInt(limit))
      .select(`
        title description creator type category language
        video.thumbnail video.duration video.aspectRatio
        metrics.views metrics.likes metrics.comments
        shorts.hashtags shorts.music shorts.effects
        createdAt
      `)
      .populate('creator.userId', 'username profile.displayName profile.avatar verification.isVerified')
      .lean();

    // Add user-specific data if authenticated
    const enrichedShorts = await Promise.all(shorts.map(async (short) => {
      let userReaction = null;
      
      if (userId) {
        const reaction = await VideoReaction.findOne({
          videoId: short._id,
          userId
        }).select('type');
        userReaction = reaction?.type || null;
      }

      return {
        ...short,
        userReaction,
        // Optimized URLs for mobile
        videoUrl: short.video?.processedVersions?.['720p']?.url || short.video?.originalFile?.url,
        thumbnailUrl: short.video?.thumbnail?.url,
        // Format for shorts UI
        formattedViews: formatViewCount(short.metrics?.views || 0),
        isLoop: short.shorts?.isLoop || false
      };
    }));

    res.json({
      success: true,
      data: {
        shorts: enrichedShorts,
        hasMore: enrichedShorts.length === parseInt(limit),
        lastVideoId: enrichedShorts.length > 0 ? enrichedShorts[enrichedShorts.length - 1]._id : null
      }
    });

  } catch (error) {
    console.error('Get shorts feed error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch shorts',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Get trending hashtags for shorts
 * @route GET /api/v1/shorts/hashtags/trending
 * @access Public
 */
const getTrendingHashtags = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Aggregate hashtags from recent shorts
    const trendingHashtags = await Video.aggregate([
      {
        $match: {
          type: 'short',
          status: 'published',
          visibility: 'public',
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        }
      },
      {
        $unwind: '$shorts.hashtags'
      },
      {
        $group: {
          _id: '$shorts.hashtags',
          count: { $sum: 1 },
          totalViews: { $sum: '$metrics.views' },
          totalLikes: { $sum: '$metrics.likes' }
        }
      },
      {
        $sort: { count: -1, totalViews: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          hashtag: '$_id',
          videosCount: '$count',
          totalViews: 1,
          totalLikes: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        hashtags: trendingHashtags
      }
    });

  } catch (error) {
    console.error('Get trending hashtags error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch trending hashtags',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Get shorts by hashtag
 * @route GET /api/v1/shorts/hashtag/:hashtag
 * @access Public
 */
const getShortsByHashtag = async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const shorts = await Video.find({
      type: 'short',
      status: 'published',
      visibility: 'public',
      'shorts.hashtags': { $in: [hashtag.toLowerCase()] }
    })
    .sort({ 'metrics.views': -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select(`
      title description creator
      video.thumbnail video.duration
      metrics.views metrics.likes metrics.comments
      shorts.hashtags shorts.music
      createdAt
    `)
    .populate('creator.userId', 'username profile.displayName profile.avatar')
    .lean();

    const total = await Video.countDocuments({
      type: 'short',
      status: 'published',
      visibility: 'public',
      'shorts.hashtags': { $in: [hashtag.toLowerCase()] }
    });

    res.json({
      success: true,
      data: {
        hashtag,
        shorts: shorts.map(short => ({
          ...short,
          thumbnailUrl: short.video?.thumbnail?.url,
          formattedViews: formatViewCount(short.metrics?.views || 0)
        })),
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: shorts.length,
          totalShorts: total
        }
      }
    });

  } catch (error) {
    console.error('Get shorts by hashtag error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch shorts',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Get shorts with audio/music
 * @route GET /api/v1/shorts/audio/:audioId
 * @access Public
 */
const getShortsByAudio = async (req, res) => {
  try {
    const { audioId } = req.params; // This could be music title or ID
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      type: 'short',
      status: 'published',
      visibility: 'public'
    };

    // Search by music title or artist
    if (audioId) {
      query.$or = [
        { 'shorts.music.title': new RegExp(audioId, 'i') },
        { 'shorts.music.artist': new RegExp(audioId, 'i') }
      ];
    }

    const shorts = await Video.find(query)
      .sort({ 'metrics.views': -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select(`
        title description creator
        video.thumbnail video.duration
        metrics.views metrics.likes metrics.comments
        shorts.music shorts.hashtags
        createdAt
      `)
      .populate('creator.userId', 'username profile.displayName profile.avatar')
      .lean();

    const total = await Video.countDocuments(query);

    res.json({
      success: true,
      data: {
        audio: audioId,
        shorts: shorts.map(short => ({
          ...short,
          thumbnailUrl: short.video?.thumbnail?.url,
          formattedViews: formatViewCount(short.metrics?.views || 0)
        })),
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: shorts.length,
          totalShorts: total
        }
      }
    });

  } catch (error) {
    console.error('Get shorts by audio error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch shorts',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Record shorts view with enhanced tracking
 * @route POST /api/v1/shorts/:shortId/view
 * @access Public
 */
const recordShortsView = async (req, res) => {
  try {
    const { shortId } = req.params;
    const {
      watchTime = 0,
      deviceInfo = 'mobile',
      viewType = 'swipe', // swipe, direct, share
      previousVideoId,
      sessionId
    } = req.body;

    const userId = req.user?._id;

    const short = await Video.findOne({
      _id: shortId,
      type: 'short'
    });

    if (!short) {
      return res.status(404).json({
        success: false,
        error: { message: 'Short not found' }
      });
    }

    // Record view with shorts-specific analytics
    await short.incrementView(userId, watchTime);

    // Enhanced view tracking for shorts
    if (userId) {
      const completionPercentage = short.video.duration > 0 
        ? (watchTime / short.video.duration) * 100 
        : 0;

      await ViewHistory.create({
        userId,
        videoId: shortId,
        watchTime,
        duration: short.video.duration,
        completionPercentage: Math.min(completionPercentage, 100),
        deviceInfo,
        metadata: {
          viewType,
          previousVideoId,
          sessionId,
          platform: 'shorts'
        }
      });

      // Update shorts-specific engagement metrics
      if (completionPercentage >= 80) {
        // Consider as fully watched for shorts
        await Video.findByIdAndUpdate(shortId, {
          $inc: { 'analytics.performance.completedViews': 1 }
        });
      }
    }

    res.json({
      success: true,
      data: {
        views: short.metrics.views,
        averageWatchTime: short.metrics.watchTime.average
      }
    });

  } catch (error) {
    console.error('Record shorts view error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to record view' }
    });
  }
};

/**
 * Format view count for display
 */
const formatViewCount = (count) => {
  if (count < 1000) return count.toString();
  if (count < 1000000) return Math.floor(count / 1000) + 'K';
  if (count < 1000000000) return Math.floor(count / 1000000) + 'M';
  return Math.floor(count / 1000000000) + 'B';
};

module.exports = {
  getShortsFeed,
  getTrendingHashtags,
  getShortsByHashtag,
  getShortsByAudio,
  recordShortsView
};