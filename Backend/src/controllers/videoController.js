const Video = require('../models/Video');
const { VideoReaction, ViewHistory, Playlist } = require('../models/VideoInteractions');
const Comment = require('../models/Comment');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

/**
 * Upload and process video
 * @route POST /api/v1/videos/upload
 * @access Private
 */
const uploadVideo = async (req, res) => {
  try {
    console.log('📤 Video upload request received');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Files:', req.files);

    const {
      title,
      description,
      type = 'video', // 'video' or 'short'
      category,
      tags: tagsRaw = '[]',
      language = 'hindi',
      visibility = 'public',
      scheduledAt,
      isAgeRestricted = false,
      shortsData = {} // For shorts: music info, effects, etc.
    } = req.body;

    // Parse tags from JSON string (sent from FormData)
    let tags = [];
    try {
      tags = typeof tagsRaw === 'string' ? JSON.parse(tagsRaw) : tagsRaw;
    } catch (e) {
      console.warn('Could not parse tags, using empty array');
      tags = [];
    }

    // Validate required fields - REMOVED VALIDATION
    // if (!title || !category) {
    //   return res.status(400).json({
    //     success: false,
    //     error: {
    //       message: 'Title and category are required',
    //       code: 'VALIDATION_ERROR'
    //     }
    //   });
    // }

    // Check if video file was uploaded
    const videoFile = req.files?.video?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];

    if (!videoFile) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Video file is required',
          code: 'FILE_REQUIRED'
        }
      });
    }

    const user = req.user;

    // Create initial video document
    const videoData = {
      title: title?.trim() || 'Untitled Video',
      description: description?.trim(),
      creator: {
        userId: user._id,
        username: user.username,
        displayName: user.profile?.firstName && user.profile?.lastName 
          ? `${user.profile.firstName} ${user.profile.lastName}`
          : user.username,
        avatar: user.profile?.avatar
      },
      type,
      category: category || 'other',
      tags: Array.isArray(tags) ? tags.map(tag => tag.trim()) : [],
      contentLanguage: language,
      visibility,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      isAgeRestricted,
      status: 'processing',
      video: {
        originalFile: {
          originalName: videoFile.originalname,
          size: videoFile.size
        },
        processedVersions: {},
        thumbnail: {},
        duration: 0 // Will be updated during processing
      }
    };

    // Add shorts-specific data
    if (type === 'short') {
      videoData.shorts = {
        isLoop: shortsData.isLoop || false,
        music: shortsData.music || {},
        effects: shortsData.effects || [],
        hashtags: shortsData.hashtags || []
      };
    }

    const video = new Video(videoData);
    await video.save();

    // Start background processing
    processVideoFile(videoFile, video._id, type, thumbnailFile);

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully and is being processed',
      data: {
        video: {
          _id: video._id,
          title: video.title,
          status: video.status
        },
        videoId: video._id,
        title: video.title,
        status: video.status,
        estimatedProcessingTime: type === 'short' ? '1-2 minutes' : '5-10 minutes'
      }
    });

  } catch (error) {
    console.error('Video upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to upload video',
        code: 'UPLOAD_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Background video processing function
 */
const processVideoFile = async (file, videoId, type, thumbnailFile = null) => {
  try {
    console.log(`🎬 Starting processing for video ${videoId}`);
    console.log(`📁 File path: ${file.path}`);
    console.log(`🖼️ Thumbnail file:`, thumbnailFile ? thumbnailFile.path : 'None provided');
    
    // Get video metadata - with fallback if ffmpeg fails
    let metadata = { duration: 0, width: 1920, height: 1080, format: 'mp4' };
    try {
      metadata = await getVideoMetadata(file.path);
      console.log(`📊 Video metadata:`, metadata);
    } catch (metaError) {
      console.warn(`⚠️ Could not get video metadata (ffmpeg may not be installed):`, metaError.message);
      // Continue with default metadata - Cloudinary will handle the video
    }
    
    // Validate video for shorts
    if (type === 'short' && metadata.duration > 60) {
      await Video.findByIdAndUpdate(videoId, {
        status: 'draft',
        'processing.error': 'Short videos must be 60 seconds or less'
      });
      return;
    }

    console.log(`☁️ Uploading to Cloudinary...`);
    
    // Upload original to Cloudinary
    const originalUpload = await cloudinary.uploader.upload(file.path, {
      resource_type: 'video',
      folder: `ShlokaYug/videos/${type}s`,
      public_id: `${videoId}_original`,
      quality: 'auto',
      format: 'mp4'
    });
    
    console.log(`✅ Cloudinary upload success:`, originalUpload.secure_url);

    // Handle thumbnail upload
    let thumbnailUpload;
    
    if (thumbnailFile) {
      // Upload user-provided thumbnail
      console.log(`🖼️ Uploading user-provided thumbnail...`);
      thumbnailUpload = await cloudinary.uploader.upload(thumbnailFile.path, {
        folder: `ShlokaYug/thumbnails`,
        public_id: `${videoId}_thumbnail`,
        quality: 'auto'
      });
      console.log(`✅ Thumbnail upload success:`, thumbnailUpload.secure_url);
      
      // Clean up local thumbnail file
      await fs.unlink(thumbnailFile.path).catch(() => {});
    } else {
      // Generate thumbnail using Cloudinary (no ffmpeg needed)
      // Cloudinary can generate thumbnails from video automatically
      const thumbnailUrl = originalUpload.secure_url.replace('/video/upload/', '/video/upload/so_1,w_640,h_360,c_fill/').replace('.mp4', '.jpg');
      
      thumbnailUpload = { secure_url: thumbnailUrl, public_id: `${videoId}_thumbnail_auto` };
      
      // Try to generate local thumbnail with ffmpeg, fallback to Cloudinary's
      try {
        const thumbnailPath = await generateThumbnail(file.path, videoId);
        thumbnailUpload = await cloudinary.uploader.upload(thumbnailPath, {
          folder: `ShlokaYug/thumbnails`,
          public_id: `${videoId}_thumbnail`,
          quality: 'auto'
        });
        // Clean up local thumbnail
        await fs.unlink(thumbnailPath).catch(() => {});
      } catch (thumbError) {
        console.warn(`⚠️ Local thumbnail generation failed, using Cloudinary's auto-thumbnail:`, thumbError.message);
      }
    }

    // Process different quality versions for regular videos
    const processedVersions = {};
    if (type === 'video') {
      const qualities = ['240p', '480p', '720p', '1080p'];
      for (const quality of qualities) {
        try {
          const processedUrl = await processVideoQuality(file.path, quality, videoId);
          if (processedUrl) {
            processedVersions[quality] = {
              url: processedUrl.secure_url,
              cloudinaryId: processedUrl.public_id,
              size: processedUrl.bytes
            };
          }
        } catch (err) {
          console.error(`Failed to process ${quality} for video ${videoId}:`, err);
        }
      }
    }

    // Update video with processed data
    await Video.findByIdAndUpdate(videoId, {
      status: 'published',
      publishedAt: new Date(),
      'video.originalFile': {
        url: originalUpload.secure_url,
        cloudinaryId: originalUpload.public_id,
        size: originalUpload.bytes,
        originalName: file.originalname
      },
      'video.processedVersions': processedVersions,
      'video.thumbnail': {
        url: thumbnailUpload.secure_url,
        cloudinaryId: thumbnailUpload.public_id,
        timestamps: [Math.floor(metadata.duration / 2)] // Middle frame
      },
      'video.duration': metadata.duration || 0,
      'video.resolution': {
        width: metadata.width || 1920,
        height: metadata.height || 1080
      },
      'video.format': metadata.format || 'mp4',
      'video.aspectRatio': calculateAspectRatio(metadata.width || 1920, metadata.height || 1080)
    });

    // Clean up local video file
    try {
      await fs.unlink(file.path);
      console.log(`🗑️ Cleaned up local file: ${file.path}`);
    } catch (e) {
      console.warn(`⚠️ Could not delete local file:`, e.message);
    }

    console.log(`✅ Processing completed for video ${videoId}`);

  } catch (error) {
    console.error(`❌ Processing failed for video ${videoId}:`, error);
    
    // Update video status to show error
    await Video.findByIdAndUpdate(videoId, {
      status: 'draft',
      'processing.error': 'Processing failed. Please try uploading again.'
    });

    // Clean up files if they exist
    try {
      await fs.unlink(file.path);
    } catch (e) {
      // File might already be deleted
    }
  }
};

/**
 * Get video metadata using ffmpeg
 */
const getVideoMetadata = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      
      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
      resolve({
        duration: metadata.format.duration,
        width: videoStream.width,
        height: videoStream.height,
        format: metadata.format.format_name,
        size: metadata.format.size
      });
    });
  });
};

/**
 * Generate video thumbnail
 */
const generateThumbnail = (videoPath, videoId) => {
  return new Promise((resolve, reject) => {
    const thumbnailPath = path.join(path.dirname(videoPath), `${videoId}_thumbnail.jpg`);
    
    ffmpeg(videoPath)
      .screenshots({
        count: 1,
        folder: path.dirname(thumbnailPath),
        filename: path.basename(thumbnailPath),
        timemarks: ['50%'] // Middle of the video
      })
      .on('end', () => resolve(thumbnailPath))
      .on('error', reject);
  });
};

/**
 * Process video for different qualities
 */
const processVideoQuality = async (videoPath, quality, videoId) => {
  const resolutions = {
    '240p': '426x240',
    '480p': '854x480',
    '720p': '1280x720',
    '1080p': '1920x1080'
  };

  const outputPath = path.join(path.dirname(videoPath), `${videoId}_${quality}.mp4`);
  
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .size(resolutions[quality])
      .videoBitrate('1000k')
      .audioBitrate('128k')
      .format('mp4')
      .output(outputPath)
      .on('end', async () => {
        try {
          // Upload processed version to Cloudinary
          const upload = await cloudinary.uploader.upload(outputPath, {
            resource_type: 'video',
            folder: `ShlokaYug/videos/processed`,
            public_id: `${videoId}_${quality}`,
            quality: 'auto'
          });
          
          // Clean up local file
          await fs.unlink(outputPath);
          resolve(upload);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject)
      .run();
  });
};

/**
 * Calculate aspect ratio from dimensions
 */
const calculateAspectRatio = (width, height) => {
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  const aspectWidth = width / divisor;
  const aspectHeight = height / divisor;
  
  // Common aspect ratios
  if (aspectWidth === 16 && aspectHeight === 9) return '16:9';
  if (aspectWidth === 9 && aspectHeight === 16) return '9:16';
  if (aspectWidth === 1 && aspectHeight === 1) return '1:1';
  if (aspectWidth === 4 && aspectHeight === 3) return '4:3';
  
  return `${aspectWidth}:${aspectHeight}`;
};

/**
 * Get video by ID
 * @route GET /api/v1/videos/:videoId
 * @access Public
 */
const getVideoById = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user?._id;

    // For development: allow viewing any video status
    // In production: only show 'published' videos to non-owners
    const video = await Video.findById(videoId)
      .populate('creator.userId', 'username profile.displayName profile.avatar');

    if (!video) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Video not found',
          code: 'VIDEO_NOT_FOUND'
        }
      });
    }

    // In production, check if video is published or user is owner
    // For now, allow viewing any video for testing
    console.log(`📺 Fetching video ${videoId}:`);
    console.log(`  Status: ${video.status}`);
    console.log(`  Has originalFile URL: ${!!video.video?.originalFile?.url}`);
    console.log(`  originalFile URL: ${video.video?.originalFile?.url}`);
    console.log(`  Has thumbnail URL: ${!!video.video?.thumbnail?.url}`);

    // Check visibility
    if (video.visibility === 'private' && (!userId || !video.creator.userId._id.equals(userId))) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Video is private',
          code: 'PRIVATE_VIDEO'
        }
      });
    }

    // Get user's reaction if authenticated
    let userReaction = null;
    if (userId) {
      const reaction = await VideoReaction.findOne({ videoId, userId });
      userReaction = reaction?.type || null;
    }

    // Get related videos
    const relatedVideos = await Video.find({
      _id: { $ne: videoId },
      category: video.category,
      status: 'published',
      visibility: 'public'
    })
    .limit(10)
    .select('title thumbnail creator metrics.views video.duration')
    .populate('creator.userId', 'username profile.displayName');

    res.json({
      success: true,
      data: {
        video: {
          ...video.toObject(),
          userReaction,
          formattedDuration: video.formattedDuration,
          thumbnailUrl: video.thumbnailUrl,
          bestVideoUrl: video.bestVideoUrl
        },
        relatedVideos
      }
    });

  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch video',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Get videos feed (trending, popular, etc.)
 * @route GET /api/v1/videos/feed
 * @access Public
 */
const getVideosFeed = async (req, res) => {
  try {
    const {
      type = 'trending', // trending, popular, recent, category
      category,
      videoType, // video, short
      limit = 20,
      page = 1,
      language,
      includeAll = 'false' // Development: include all statuses
    } = req.query;

    const skip = (page - 1) * limit;
    // For development: allow fetching all videos regardless of status
    let query = includeAll === 'true' 
      ? { visibility: 'public' } 
      : { status: 'published', visibility: 'public' };
    let sort = {};

    // Add filters
    if (category) query.category = category;
    if (videoType) query.type = videoType;
    if (language) query.language = language;

    // Determine sort order based on feed type
    switch (type) {
      case 'trending':
        // Videos from last 7 days sorted by engagement
        query.publishedAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
        sort = { 'metrics.engagement.rate': -1, 'metrics.views': -1 };
        break;
      case 'popular':
        sort = { 'metrics.views': -1, publishedAt: -1 };
        break;
      case 'recent':
        sort = { publishedAt: -1 };
        break;
      default:
        sort = { 'metrics.views': -1, publishedAt: -1 };
    }

    const videos = await Video.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-video.originalFile -video.processedVersions')
      .populate('creator.userId', 'username profile.displayName profile.avatar');

    const total = await Video.countDocuments(query);

    res.json({
      success: true,
      data: {
        videos: videos.map(video => ({
          ...video.toObject(),
          formattedDuration: video.formattedDuration,
          thumbnailUrl: video.thumbnailUrl
        })),
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: videos.length,
          totalVideos: total
        }
      }
    });

  } catch (error) {
    console.error('Get videos feed error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch videos',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Search videos
 * @route GET /api/v1/videos/search
 * @access Public
 */
const searchVideos = async (req, res) => {
  try {
    const {
      q: searchTerm,
      category,
      type: videoType,
      language,
      duration, // short (< 4min), medium (4-20min), long (> 20min)
      sortBy = 'relevance', // relevance, date, views, rating
      limit = 20,
      page = 1
    } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Search term is required',
          code: 'SEARCH_TERM_REQUIRED'
        }
      });
    }

    const skip = (page - 1) * limit;
    let query = {
      $text: { $search: searchTerm },
      status: 'published',
      visibility: 'public'
    };

    // Add filters
    if (category) query.category = category;
    if (videoType) query.type = videoType;
    if (language) query.language = language;

    // Duration filter
    if (duration) {
      switch (duration) {
        case 'short':
          query['video.duration'] = { $lt: 240 }; // Less than 4 minutes
          break;
        case 'medium':
          query['video.duration'] = { $gte: 240, $lte: 1200 }; // 4-20 minutes
          break;
        case 'long':
          query['video.duration'] = { $gt: 1200 }; // More than 20 minutes
          break;
      }
    }

    // Sort options
    let sort = {};
    switch (sortBy) {
      case 'date':
        sort = { publishedAt: -1 };
        break;
      case 'views':
        sort = { 'metrics.views': -1 };
        break;
      case 'rating':
        sort = { 'metrics.engagement.rate': -1 };
        break;
      default: // relevance
        sort = { score: { $meta: 'textScore' } };
    }

    const videos = await Video.find(query, { score: { $meta: 'textScore' } })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-video.originalFile -video.processedVersions')
      .populate('creator.userId', 'username profile.displayName profile.avatar');

    const total = await Video.countDocuments(query);

    res.json({
      success: true,
      data: {
        searchTerm,
        videos: videos.map(video => ({
          ...video.toObject(),
          formattedDuration: video.formattedDuration,
          thumbnailUrl: video.thumbnailUrl
        })),
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: videos.length,
          totalResults: total
        }
      }
    });

  } catch (error) {
    console.error('Search videos error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Search failed',
        code: 'SEARCH_ERROR'
      }
    });
  }
};

/**
 * Record video view
 * @route POST /api/v1/videos/:videoId/view
 * @access Public (but can be enhanced with user data)
 */
const recordView = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { watchTime = 0, deviceInfo = 'other' } = req.body;
    const userId = req.user?._id;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        error: { message: 'Video not found' }
      });
    }

    // Record view in video metrics
    await video.incrementView(userId, watchTime);

    // Record in view history if user is logged in
    if (userId) {
      const completionPercentage = video.video.duration > 0 
        ? (watchTime / video.video.duration) * 100 
        : 0;

      await ViewHistory.create({
        userId,
        videoId,
        watchTime,
        duration: video.video.duration,
        completionPercentage: Math.min(completionPercentage, 100),
        deviceInfo
      });
    }

    res.json({
      success: true,
      data: {
        views: video.metrics.views,
        averageWatchTime: video.metrics.watchTime.average
      }
    });

  } catch (error) {
    console.error('Record view error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to record view' }
    });
  }
};

/**
 * Get related videos
 * @route GET /api/v1/videos/:videoId/related
 * @access Public
 */
const getRelatedVideos = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { limit = 10 } = req.query;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        error: { message: 'Video not found' }
      });
    }

    // Find related videos based on category and tags
    const relatedVideos = await Video.find({
      _id: { $ne: videoId },
      type: video.type,
      status: 'published',
      visibility: 'public',
      $or: [
        { category: video.category },
        { tags: { $in: video.tags } }
      ]
    })
    .sort({ 'metrics.views': -1 })
    .limit(parseInt(limit))
    .select('title creator video.thumbnail video.duration metrics.views metrics.likes createdAt')
    .lean();

    res.json({
      success: true,
      data: { videos: relatedVideos }
    });
  } catch (error) {
    console.error('Get related videos error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch related videos' }
    });
  }
};

/**
 * Get user's uploaded videos
 * @route GET /api/v1/videos/my-videos
 * @access Private
 */
const getMyVideos = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = { 'creator.userId': userId };
    if (type) query.type = type;

    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('title description type category video.thumbnail video.duration status visibility metrics createdAt')
      .lean();

    const total = await Video.countDocuments(query);

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: videos.length
        }
      }
    });
  } catch (error) {
    console.error('Get my videos error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch videos' }
    });
  }
};

/**
 * Get video analytics
 * @route GET /api/v1/videos/:videoId/analytics
 * @access Private (Owner only)
 */
const getVideoAnalytics = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        error: { message: 'Video not found' }
      });
    }

    // Check ownership
    if (video.creator.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: { message: 'Not authorized to view analytics for this video' }
      });
    }

    const analytics = {
      videoId: video._id,
      title: video.title,
      metrics: video.metrics,
      performance: {
        viewsGrowth: '+12%', // Placeholder - implement actual calculation
        likesGrowth: '+8%',
        engagementRate: video.metrics.engagement?.rate || 0
      },
      audience: {
        // Placeholder data - implement actual tracking
        topLocations: ['India', 'United States', 'United Kingdom'],
        devices: { mobile: 68, desktop: 25, tablet: 7 },
        ageGroups: { '18-24': 35, '25-34': 45, '35-44': 15, '45+': 5 }
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get video analytics error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch analytics' }
    });
  }
};

/**
 * Get channel analytics
 * @route GET /api/v1/videos/channel/analytics
 * @access Private
 */
const getChannelAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate channel stats
    const stats = await Video.aggregate([
      { $match: { 'creator.userId': userId } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$metrics.views' },
          totalLikes: { $sum: '$metrics.likes' },
          totalComments: { $sum: '$metrics.comments' },
          totalShares: { $sum: '$metrics.shares' },
          videoCount: { $sum: { $cond: [{ $eq: ['$type', 'video'] }, 1, 0] } },
          shortsCount: { $sum: { $cond: [{ $eq: ['$type', 'short'] }, 1, 0] } }
        }
      }
    ]);

    const channelStats = stats[0] || {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      videoCount: 0,
      shortsCount: 0
    };

    // Get subscriber count (implement subscription model)
    channelStats.totalSubscribers = 0; // Placeholder

    res.json({
      success: true,
      data: channelStats
    });
  } catch (error) {
    console.error('Get channel analytics error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch channel analytics' }
    });
  }
};

module.exports = {
  uploadVideo,
  getVideoById,
  getVideosFeed,
  searchVideos,
  recordView,
  getRelatedVideos,
  getMyVideos,
  getVideoAnalytics,
  getChannelAnalytics
};