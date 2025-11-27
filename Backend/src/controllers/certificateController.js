/**
 * Certificate Controller
 * Handles certificate generation and retrieval for completed courses
 */

const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { v4: uuidv4 } = require('uuid');

/**
 * Get certificate for a completed course
 */
exports.getCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if user has completed the course
    const enrollment = await Enrollment.findOne({
      userId,
      courseId,
      'progress.isCompleted': true,
    }).populate('courseId', 'title instructor structure');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Course not completed or enrollment not found',
      });
    }

    // Check if certificate already exists
    let certificate = await Certificate.findOne({ userId, courseId });

    // If not, generate it
    if (!certificate) {
      certificate = await this.generateCertificateForUser(userId, courseId, enrollment);
    }

    res.status(200).json({
      success: true,
      data: {
        certificate: {
          certificateId: certificate.certificateId,
          studentName: req.user.fullName || req.user.email,
          courseName: enrollment.courseId.title,
          instructorName: enrollment.courseId.instructor.name,
          completedAt: enrollment.progress.completedAt,
          courseDuration: `${Math.ceil(enrollment.courseId.structure.totalDuration / 60)} hours`,
          totalLectures: enrollment.courseId.structure.totalLectures,
          totalWatchTime: `${Math.ceil(enrollment.progress.totalWatchTime / 60)} hours`,
          finalScore: '100%',
          issuedAt: certificate.issuedAt,
        },
      },
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve certificate',
      error: error.message,
    });
  }
};

/**
 * Generate certificate (internal method)
 */
exports.generateCertificateForUser = async (userId, courseId, enrollment) => {
  const certificateId = `CERT-${uuidv4().toUpperCase().substring(0, 8)}`;

  const certificate = new Certificate({
    userId,
    courseId,
    certificateId,
    issuedAt: new Date(),
    metadata: {
      completionDate: enrollment.progress.completedAt,
      totalLectures: enrollment.progress.lecturesCompleted,
      totalWatchTime: enrollment.progress.totalWatchTime,
      finalScore: 100,
    },
  });

  await certificate.save();
  return certificate;
};

/**
 * Generate certificate (API endpoint)
 */
exports.generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // Check if user has completed the course
    const enrollment = await Enrollment.findOne({
      userId,
      courseId,
      'progress.isCompleted': true,
    });

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: 'Course not completed',
      });
    }

    // Check if certificate already exists
    let certificate = await Certificate.findOne({ userId, courseId });

    if (certificate) {
      return res.status(200).json({
        success: true,
        message: 'Certificate already exists',
        data: { certificate },
      });
    }

    // Generate new certificate
    certificate = await this.generateCertificateForUser(userId, courseId, enrollment);

    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully',
      data: { certificate },
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate certificate',
      error: error.message,
    });
  }
};

/**
 * Verify certificate by ID
 */
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate('userId', 'fullName email')
      .populate('courseId', 'title instructor');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        valid: true,
        certificate: {
          certificateId: certificate.certificateId,
          studentName: certificate.userId.fullName,
          courseName: certificate.courseId.title,
          instructorName: certificate.courseId.instructor.name,
          issuedAt: certificate.issuedAt,
          completedAt: certificate.metadata.completionDate,
        },
      },
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate',
      error: error.message,
    });
  }
};
