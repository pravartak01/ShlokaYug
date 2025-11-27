/**
 * Certificate Routes
 * Handles certificate generation and retrieval
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const certificateController = require('../controllers/certificateController');

// Get certificate for a completed course
router.get('/:courseId', auth, certificateController.getCertificate);

// Generate certificate (called when course is completed)
router.post('/generate', auth, certificateController.generateCertificate);

// Verify certificate
router.get('/verify/:certificateId', certificateController.verifyCertificate);

module.exports = router;
