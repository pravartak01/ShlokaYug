/**
 * Content Controller - Content Delivery and Management System
 * Handles video streaming, file uploads, content protection, and offline capabilities
 */

const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const crypto = require('crypto');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), 'uploads', file.fieldname);
    
    // Create directory if it doesn't exist
    if (!fsSync.existsSync(uploadPath)) {
      fsSync.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  // Define allowed file types based on fieldname
  const allowedTypes = {
    'video': ['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/wmv'],
    'audio': ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac'],
    'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    'subtitle': ['text/plain', 'text/vtt', 'application/x-subrip']
  };

  const fieldAllowedTypes = allowedTypes[file.fieldname] || [];
  
  if (fieldAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${fieldAllowedTypes.join(', ')}`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
    files: 10 // Maximum 10 files per request
  }
});

/**
 * Upload Content Files
 * POST /api/v1/content/upload
 */
exports.uploadContent = [
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'audio', maxCount: 5 },
    { name: 'document', maxCount: 10 },
    { name: 'image', maxCount: 20 },
    { name: 'subtitle', maxCount: 5 }
  ]),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const instructorId = req.user.id;
      const { courseId, lectureId, contentType, metadata } = req.body;

      // Verify instructor owns the course
      const course = await Course.findOne({
        _id: courseId,
        'instructor.userId': instructorId
      });

      if (!course) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to upload content for this course'
        });
      }

      const uploadedFiles = [];
      const uploadResults = {};

      // Process uploaded files
      if (req.files) {
        for (const [fieldname, files] of Object.entries(req.files)) {
          uploadResults[fieldname] = [];
          
          for (const file of files) {
            const fileData = {
              originalName: file.originalname,
              fileName: file.filename,
              filePath: file.path,
              fileSize: file.size,
              mimeType: file.mimetype,
              uploadedAt: new Date(),
              uploadedBy: instructorId
            };

            // Generate secure file URL
            const secureToken = generateSecureToken();
            fileData.secureUrl = `/api/v1/content/secure/${secureToken}`;
            fileData.secureToken = secureToken;

            // Add metadata if provided
            if (metadata && metadata[fieldname]) {
              fileData.metadata = JSON.parse(metadata[fieldname]);
            }

            // Process video files for streaming optimization
            if (fieldname === 'video') {
              fileData.streamingUrl = `/api/v1/content/stream/${secureToken}`;
              fileData.thumbnailUrl = await generateVideoThumbnail(file.path, secureToken);
              fileData.duration = await getVideoDuration(file.path);
              fileData.resolutions = await generateVideoResolutions(file.path);
            }

            // Process audio files
            if (fieldname === 'audio') {
              fileData.streamingUrl = `/api/v1/content/stream/${secureToken}`;
              fileData.duration = await getAudioDuration(file.path);
              fileData.waveformData = await generateWaveform(file.path);
            }

            uploadResults[fieldname].push(fileData);
            uploadedFiles.push(fileData);

            // Store file reference in database
            await storeFileReference({
              courseId,
              lectureId,
              contentType: fieldname,
              ...fileData
            });
          }
        }
      }

      res.status(200).json({
        success: true,
        message: 'Content uploaded successfully',
        data: {
          uploadId: crypto.randomUUID(),
          files: uploadResults,
          totalFiles: uploadedFiles.length,
          totalSize: uploadedFiles.reduce((sum, file) => sum + file.fileSize, 0)
        }
      });

    } catch (error) {
      console.error('Upload content error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload content',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
];

/**
 * Stream Video Content
 * GET /api/v1/content/stream/:token
 */
exports.streamContent = async (req, res) => {
  try {
    const { token } = req.params;
    const { range } = req.headers;

    // Verify user has access to this content
    const contentAccess = await verifyContentAccess(token, req.user?.id);
    if (!contentAccess.success) {
      return res.status(contentAccess.status).json({
        success: false,
        message: contentAccess.message
      });
    }

    const filePath = contentAccess.filePath;
    const stat = await fs.stat(filePath);
    const fileSize = stat.size;

    // Handle range requests for video streaming
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      const readStream = fsSync.createReadStream(filePath, { start, end });

      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentAccess.mimeType,
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff'
      };

      res.writeHead(206, headers);
      readStream.pipe(res);

      // Track watch time
      trackWatchTime(req.user?.id, contentAccess.courseId, contentAccess.lectureId, chunksize);

    } else {
      // Send entire file
      const headers = {
        'Content-Length': fileSize,
        'Content-Type': contentAccess.mimeType,
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff'
      };

      res.writeHead(200, headers);
      fsSync.createReadStream(filePath).pipe(res);
    }

  } catch (error) {
    console.error('Stream content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stream content',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get Secure Content
 * GET /api/v1/content/secure/:token
 */
exports.getSecureContent = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify user has access to this content
    const contentAccess = await verifyContentAccess(token, req.user?.id);
    if (!contentAccess.success) {
      return res.status(contentAccess.status).json({
        success: false,
        message: contentAccess.message
      });
    }

    const filePath = contentAccess.filePath;
    
    // Set appropriate headers
    const headers = {
      'Content-Type': contentAccess.mimeType,
      'Cache-Control': 'private, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': `inline; filename="${contentAccess.originalName}"`
    };

    res.set(headers);

    // Stream the file
    const readStream = fsSync.createReadStream(filePath);
    readStream.pipe(res);

    // Track content access
    trackContentAccess(req.user?.id, contentAccess.courseId, contentAccess.lectureId, token);

  } catch (error) {
    console.error('Get secure content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to access content',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get Content Metadata
 * GET /api/v1/content/metadata/:courseId/:lectureId
 */
exports.getContentMetadata = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.user.id;

    // Verify user has access to this course
    const enrollment = await Enrollment.findOne({
      userId,
      courseId,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Get content metadata from database
    const ContentFile = require('../models/ContentFile');
    const contentFiles = await ContentFile.find({
      courseId,
      lectureId
    }).select('-secureToken -filePath');

    // Organize content by type
    const contentByType = {
      videos: [],
      audios: [],
      documents: [],
      images: [],
      subtitles: []
    };

    contentFiles.forEach(file => {
      const contentData = {
        id: file._id,
        fileName: file.fileName,
        originalName: file.originalName,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        secureUrl: file.secureUrl,
        uploadedAt: file.uploadedAt,
        metadata: file.metadata || {}
      };

      // Add type-specific data
      if (file.contentType === 'video') {
        contentData.streamingUrl = file.streamingUrl;
        contentData.thumbnailUrl = file.thumbnailUrl;
        contentData.duration = file.duration;
        contentData.resolutions = file.resolutions;
        contentByType.videos.push(contentData);
      } else if (file.contentType === 'audio') {
        contentData.streamingUrl = file.streamingUrl;
        contentData.duration = file.duration;
        contentData.waveformData = file.waveformData;
        contentByType.audios.push(contentData);
      } else if (file.contentType === 'document') {
        contentByType.documents.push(contentData);
      } else if (file.contentType === 'image') {
        contentByType.images.push(contentData);
      } else if (file.contentType === 'subtitle') {
        contentByType.subtitles.push(contentData);
      }
    });

    // Get user progress for this lecture
    const progress = await Progress.findOne({ userId, courseId });
    const lectureProgress = progress?.lectures?.find(
      l => l.lectureId.toString() === lectureId
    );

    res.status(200).json({
      success: true,
      data: {
        courseId,
        lectureId,
        content: contentByType,
        userProgress: {
          watchTime: lectureProgress?.watchTime || 0,
          completed: lectureProgress?.completed || false,
          lastAccessedAt: lectureProgress?.lastAccessedAt,
          bookmarks: lectureProgress?.bookmarks || []
        }
      }
    });

  } catch (error) {
    console.error('Get content metadata error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve content metadata',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Generate Download Token for Offline Access
 * POST /api/v1/content/download-token
 */
exports.generateDownloadToken = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { courseId, lectureId, contentIds } = req.body;
    const userId = req.user.id;

    // Verify user has access to this course
    const enrollment = await Enrollment.findOne({
      userId,
      courseId,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Check course offline download settings
    const course = await Course.findById(courseId);
    if (!course?.settings?.allowOfflineDownload) {
      return res.status(403).json({
        success: false,
        message: 'Offline downloads are not allowed for this course'
      });
    }

    // Generate download token with expiration
    const downloadToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours

    // Store download token in database
    const DownloadToken = require('../models/DownloadToken');
    await DownloadToken.create({
      token: downloadToken,
      userId,
      courseId,
      lectureId,
      contentIds,
      expiresAt,
      maxDownloads: 3,
      currentDownloads: 0
    });

    res.status(200).json({
      success: true,
      message: 'Download token generated successfully',
      data: {
        downloadToken,
        expiresAt,
        downloadUrl: `/api/v1/content/download/${downloadToken}`,
        maxDownloads: 3,
        validFor: '24 hours'
      }
    });

  } catch (error) {
    console.error('Generate download token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate download token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Download Content for Offline Access
 * GET /api/v1/content/download/:token
 */
exports.downloadContent = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify download token
    const DownloadToken = require('../models/DownloadToken');
    const downloadToken = await DownloadToken.findOne({
      token,
      expiresAt: { $gt: new Date() }
    });

    if (!downloadToken) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired download token'
      });
    }

    // Check download limits
    if (downloadToken.currentDownloads >= downloadToken.maxDownloads) {
      return res.status(403).json({
        success: false,
        message: 'Download limit exceeded for this token'
      });
    }

    // Get content files
    const ContentFile = require('../models/ContentFile');
    const contentFiles = await ContentFile.find({
      _id: { $in: downloadToken.contentIds },
      courseId: downloadToken.courseId,
      lectureId: downloadToken.lectureId
    });

    if (contentFiles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No content files found for download'
      });
    }

    // Create ZIP archive for multiple files
    if (contentFiles.length > 1) {
      const archiver = require('archiver');
      const archive = archiver('zip', { zlib: { level: 9 } });

      res.attachment('course_content.zip');
      archive.pipe(res);

      // Add files to archive
      contentFiles.forEach(file => {
        if (fsSync.existsSync(file.filePath)) {
          archive.file(file.filePath, { name: file.originalName });
        }
      });

      archive.finalize();

      // Update download count
      downloadToken.currentDownloads += 1;
      downloadToken.lastDownloadAt = new Date();
      await downloadToken.save();

    } else {
      // Single file download
      const file = contentFiles[0];
      
      if (!fsSync.existsSync(file.filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Content file not found on server'
        });
      }

      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimeType);
      
      const readStream = fsSync.createReadStream(file.filePath);
      readStream.pipe(res);

      // Update download count
      downloadToken.currentDownloads += 1;
      downloadToken.lastDownloadAt = new Date();
      await downloadToken.save();
    }

    // Track download activity
    trackDownloadActivity(downloadToken.userId, downloadToken.courseId, downloadToken.lectureId);

  } catch (error) {
    console.error('Download content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download content',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete Content
 * DELETE /api/v1/content/:contentId
 */
exports.deleteContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const instructorId = req.user.id;

    const ContentFile = require('../models/ContentFile');
    const contentFile = await ContentFile.findById(contentId);

    if (!contentFile) {
      return res.status(404).json({
        success: false,
        message: 'Content file not found'
      });
    }

    // Verify instructor owns the course
    const course = await Course.findOne({
      _id: contentFile.courseId,
      'instructor.userId': instructorId
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this content'
      });
    }

    // Delete file from filesystem
    try {
      if (fsSync.existsSync(contentFile.filePath)) {
        await fs.unlink(contentFile.filePath);
      }
      
      // Delete associated files (thumbnails, etc.)
      if (contentFile.thumbnailPath && fsSync.existsSync(contentFile.thumbnailPath)) {
        await fs.unlink(contentFile.thumbnailPath);
      }
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
    }

    // Delete from database
    await ContentFile.findByIdAndDelete(contentId);

    res.status(200).json({
      success: true,
      message: 'Content deleted successfully'
    });

  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete content',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper Functions

/**
 * Generate secure token for content access
 */
function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify user has access to content
 */
async function verifyContentAccess(token, userId) {
  try {
    const ContentFile = require('../models/ContentFile');
    const contentFile = await ContentFile.findOne({ secureToken: token });

    if (!contentFile) {
      return { success: false, status: 404, message: 'Content not found' };
    }

    if (!userId) {
      return { success: false, status: 401, message: 'Authentication required' };
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      userId,
      courseId: contentFile.courseId,
      status: 'active'
    });

    if (!enrollment) {
      return { success: false, status: 403, message: 'You are not enrolled in this course' };
    }

    return {
      success: true,
      filePath: contentFile.filePath,
      mimeType: contentFile.mimeType,
      originalName: contentFile.originalName,
      courseId: contentFile.courseId,
      lectureId: contentFile.lectureId
    };

  } catch (error) {
    console.error('Verify content access error:', error);
    return { success: false, status: 500, message: 'Failed to verify access' };
  }
}

/**
 * Store file reference in database
 */
async function storeFileReference(fileData) {
  try {
    const ContentFile = require('../models/ContentFile');
    await ContentFile.create(fileData);
  } catch (error) {
    console.error('Store file reference error:', error);
  }
}

/**
 * Track watch time for video content
 */
async function trackWatchTime(userId, courseId, lectureId, bytesStreamed) {
  try {
    if (!userId || !courseId || !lectureId) return;

    // Estimate watch time based on bytes streamed (rough approximation)
    const estimatedSeconds = Math.floor(bytesStreamed / (1024 * 100)); // Very rough estimation

    await Progress.findOneAndUpdate(
      { userId, courseId },
      {
        $inc: { 
          'lectures.$[lecture].watchTime': estimatedSeconds,
          totalWatchTime: estimatedSeconds 
        },
        $set: { 'lectures.$[lecture].lastAccessedAt': new Date() }
      },
      {
        arrayFilters: [{ 'lecture.lectureId': lectureId }],
        upsert: false
      }
    );

  } catch (error) {
    console.error('Track watch time error:', error);
  }
}

/**
 * Track content access
 */
async function trackContentAccess(userId, courseId, lectureId, contentToken) {
  try {
    if (!userId || !courseId || !lectureId) return;

    await Progress.findOneAndUpdate(
      { userId, courseId },
      {
        $push: {
          interactions: {
            type: 'content_access',
            lectureId,
            content: `Accessed content: ${contentToken}`,
            timestamp: new Date()
          }
        },
        $set: { lastActiveAt: new Date() }
      },
      { upsert: false }
    );

  } catch (error) {
    console.error('Track content access error:', error);
  }
}

/**
 * Track download activity
 */
async function trackDownloadActivity(userId, courseId, lectureId) {
  try {
    await Progress.findOneAndUpdate(
      { userId, courseId },
      {
        $push: {
          interactions: {
            type: 'content_download',
            lectureId,
            content: 'Downloaded content for offline access',
            timestamp: new Date()
          }
        }
      },
      { upsert: false }
    );

  } catch (error) {
    console.error('Track download activity error:', error);
  }
}

/**
 * Generate video thumbnail (placeholder - would need actual implementation)
 */
async function generateVideoThumbnail(videoPath, token) {
  // This would use a library like ffmpeg to generate thumbnails
  return `/api/v1/content/thumbnail/${token}`;
}

/**
 * Get video duration (placeholder - would need actual implementation)
 */
async function getVideoDuration(videoPath) {
  // This would use a library like ffprobe to get duration
  return 0;
}

/**
 * Get audio duration (placeholder - would need actual implementation)
 */
async function getAudioDuration(audioPath) {
  // This would use a library to get audio duration
  return 0;
}

/**
 * Generate video resolutions (placeholder - would need actual implementation)
 */
async function generateVideoResolutions(videoPath) {
  // This would generate different resolution versions
  return ['480p', '720p', '1080p'];
}

/**
 * Generate waveform data (placeholder - would need actual implementation)
 */
async function generateWaveform(audioPath) {
  // This would generate waveform data for audio visualization
  return [];
}