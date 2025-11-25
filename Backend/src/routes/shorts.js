const express = require('express');
const shortsController = require('../controllers/shortsController');
const engagementController = require('../controllers/engagementController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Shorts feed routes
router.get('/feed', shortsController.getShortsFeed);

// Hashtag routes
router.get('/hashtags/trending', shortsController.getTrendingHashtags);
router.get('/hashtag/:hashtag', shortsController.getShortsByHashtag);

// Audio/Music routes
router.get('/audio/:audioId', shortsController.getShortsByAudio);

// Shorts interaction routes
router.post('/:shortId/view', shortsController.recordShortsView);
router.post('/:shortId/react', 
  auth,
  engagementController.toggleVideoReaction
);

// Comments for shorts (same as videos)
router.get('/:shortId/comments', engagementController.getVideoComments);
router.post('/:shortId/comments', 
  auth,
  engagementController.addComment
);

module.exports = router;