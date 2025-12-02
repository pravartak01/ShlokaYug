const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body } = require('express-validator');

const videoController = require('../controllers/videoController');
const engagementController = require('../controllers/engagementController');
const { auth, checkRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/videos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${extension}`);
  }
});

// File filter for videos - REMOVED TO ALLOW ALL FILE TYPES
// const fileFilter = (req, file, cb) => {
//   const allowedMimes = [
//     'video/mp4',
//     'video/mpeg',
//     'video/quicktime',
//     'video/x-msvideo', // AVI
//     'video/x-ms-wmv',   // WMV
//     'video/webm'
//   ];

//   if (allowedMimes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Invalid file type. Only video files are allowed.'), false);
//   }
// };

const upload = multer({
  storage,
  // fileFilter,  // REMOVED - Accept all file types
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size
    fieldSize: 10 * 1024 * 1024   // 10MB max field size
  }
});

// Validation schemas
const videoUploadValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 150 })
    .withMessage('Title must be between 1 and 150 characters')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters')
    .trim(),
  
  body('type')
    .optional()
    .isIn(['video', 'short'])
    .withMessage('Type must be either "video" or "short"'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'sanskrit', 'chandas', 'mantras', 'shlokas', 'bhajans',
      'tutorials', 'spiritual', 'classical-music', 'dance',
      'storytelling', 'philosophy', 'meditation', 'yoga',
      'cultural', 'educational', 'entertainment', 'comedy', 'other'
    ])
    .withMessage('Invalid category'),
  
  body('language')
    .optional()
    .isIn(['sanskrit', 'hindi', 'english', 'bengali', 'tamil', 'telugu', 'marathi', 'gujarati', 'other'])
    .withMessage('Invalid language'),
  
  body('visibility')
    .optional()
    .isIn(['public', 'unlisted', 'private'])
    .withMessage('Invalid visibility setting'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Each tag must be 50 characters or less'),
  
  body('isAgeRestricted')
    .optional()
    .isBoolean()
    .withMessage('Age restriction must be a boolean')
];

const commentValidation = [
  body('text')
    .notEmpty()
    .withMessage('Comment text is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
    .trim(),
  
  body('parentCommentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent comment ID')
];

const reactionValidation = [
  body('type')
    .notEmpty()
    .withMessage('Reaction type is required')
    .isIn(['like', 'dislike'])
    .withMessage('Reaction type must be "like" or "dislike"')
];

// Video upload and management routes
// Simple test endpoint for upload debugging
router.post('/upload-test', auth, (req, res) => {
  console.log('📨 Upload-test endpoint hit');
  res.json({ 
    success: true, 
    message: 'Upload endpoint is reachable',
    headers: req.headers,
    body: req.body 
  });
});

// Debug middleware for upload
const uploadDebugMiddleware = (req, res, next) => {
  console.log('📨 Upload route hit');
  console.log('📨 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('📨 Content-Type:', req.headers['content-type']);
  next();
};

router.post('/upload', 
  uploadDebugMiddleware,
  auth,
  (req, res, next) => {
    console.log('📨 After auth, before multer');
    console.log('📨 User:', req.user?.username);
    next();
  },
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  (req, res, next) => {
    console.log('📨 After multer');
    console.log('📨 Files:', req.files);
    console.log('📨 Body:', JSON.stringify(req.body, null, 2));
    next();
  },
  // videoUploadValidation,
  // validate,
  videoController.uploadVideo
);

router.get('/feed', videoController.getVideosFeed);
router.get('/search', videoController.searchVideos);
router.get('/my-videos', auth, videoController.getMyVideos);
router.get('/bookmarks', auth, engagementController.getBookmarks);
router.get('/subscriptions', auth, engagementController.getUserSubscriptions);
router.get('/channel/analytics', auth, videoController.getChannelAnalytics);
router.get('/:videoId', videoController.getVideoById);
router.get('/:videoId/related', videoController.getRelatedVideos);
router.get('/:videoId/analytics', auth, videoController.getVideoAnalytics);

// Video interaction routes
router.post('/:videoId/view', videoController.recordView);
router.post('/:videoId/react', 
  auth,
  reactionValidation,
  validate,
  engagementController.toggleVideoReaction
);
router.post('/:videoId/share', auth, engagementController.shareVideo);
router.post('/:videoId/bookmark', auth, engagementController.bookmarkVideo);
router.delete('/:videoId/bookmark', auth, engagementController.removeBookmark);

// Comment routes
router.get('/:videoId/comments', engagementController.getVideoComments);
router.post('/:videoId/comments', 
  auth,
  commentValidation,
  validate,
  engagementController.addComment
);

// Comment interaction routes
router.post('/:videoId/comments/:commentId/like', 
  auth,
  engagementController.toggleCommentLike
);

// Subscription routes
router.post('/channels/:channelId/subscribe', 
  auth,
  engagementController.toggleSubscription
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'File too large. Maximum size is 500MB.',
          code: 'FILE_TOO_LARGE'
        }
      });
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Unexpected file field. Please use "video" field name.',
          code: 'UNEXPECTED_FILE'
        }
      });
    }
  } else if (error.message === 'Invalid file type. Only video files are allowed.') {
    return res.status(400).json({
      success: false,
      error: {
        message: error.message,
        code: 'INVALID_FILE_TYPE'
      }
    });
  }
  
  next(error);
});

module.exports = router;