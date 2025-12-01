/**
 * Challenge Certificate Controller - Certificate management for challenges
 */

const ChallengeCertificate = require('../models/ChallengeCertificate');
const Challenge = require('../models/Challenge');
const ChallengeParticipant = require('../models/ChallengeParticipant');
const User = require('../models/User');

// @desc    Verify certificate by verification code
// @route   GET /api/v1/certificates/verify/:verificationCode
// @access  Public
const verifyCertificate = async (req, res) => {
  try {
    const { verificationCode } = req.params;

    const certificate = await ChallengeCertificate.findOne({
      verificationCode,
      status: { $in: ['generated', 'issued'] }
    })
    .populate('userId', 'username profile.firstName profile.lastName profile.avatar')
    .populate('challengeId', 'title type requirements.difficulty requirements.category')
    .populate('participantId', 'score maxScore accuracy completedAt timeSpent');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Certificate not found or invalid verification code',
          code: 'CERTIFICATE_NOT_FOUND'
        }
      });
    }

    // Increment verification count
    certificate.metadata.verificationCount += 1;
    await certificate.save();

    res.status(200).json({
      success: true,
      data: {
        certificate: {
          certificateId: certificate.certificateId,
          verificationCode: certificate.verificationCode,
          title: certificate.title,
          description: certificate.description,
          recipientName: certificate.recipientName,
          issuedAt: certificate.createdAt,
          status: certificate.status,
          grade: certificate.grade,
          percentageScore: certificate.percentageScore
        },
        recipient: {
          name: `${certificate.userId.profile.firstName} ${certificate.userId.profile.lastName}`,
          username: certificate.userId.username,
          avatar: certificate.userId.profile.avatar
        },
        challenge: {
          title: certificate.challengeId.title,
          type: certificate.challengeId.type,
          difficulty: certificate.challengeId.requirements.difficulty,
          category: certificate.challengeId.requirements.category
        },
        achievement: certificate.achievement,
        verifiedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to verify certificate',
        code: 'CERTIFICATE_VERIFICATION_ERROR'
      }
    });
  }
};

// @desc    Download certificate
// @route   GET /api/v1/certificates/download/:certificateId
// @access  Private
const downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await ChallengeCertificate.findOne({
      certificateId,
      status: { $in: ['generated', 'issued'] }
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Certificate not found',
          code: 'CERTIFICATE_NOT_FOUND'
        }
      });
    }

    // Check if user owns this certificate
    if (certificate.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Mark as downloaded
    certificate.metadata.downloadCount += 1;
    certificate.metadata.lastDownloadedAt = new Date();
    await certificate.save();

    res.status(200).json({
      success: true,
      data: {
        downloadUrl: `${process.env.FRONTEND_URL}/api/v1/certificates/pdf/${certificate.certificateId}`,
        certificateId: certificate.certificateId,
        fileName: `${certificate.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      }
    });
  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to download certificate',
        code: 'CERTIFICATE_DOWNLOAD_ERROR'
      }
    });
  }
};

// @desc    Get user's certificates
// @route   GET /api/v1/certificates/my-certificates
// @access  Private
const getUserCertificates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { userId: req.user._id };
    if (status) query.status = status;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: {
        path: 'challengeId',
        select: 'title type requirements.difficulty requirements.category'
      }
    };

    const certificates = await ChallengeCertificate.find(query)
      .populate('challengeId', 'title type requirements.difficulty requirements.category')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalCertificates = await ChallengeCertificate.countDocuments(query);

    const certificatesWithDetails = certificates.map(cert => ({
      certificateId: cert.certificateId,
      verificationCode: cert.verificationCode,
      title: cert.title,
      description: cert.description,
      challenge: cert.challengeId,
      achievement: cert.achievement,
      status: cert.status,
      issuedAt: cert.createdAt,
      downloadCount: cert.metadata.downloadCount,
      shareCount: cert.metadata.shareCount,
      grade: cert.grade,
      percentageScore: cert.percentageScore,
      downloadUrl: `${process.env.FRONTEND_URL}/certificates/download/${cert.certificateId}`,
      verificationUrl: `${process.env.FRONTEND_URL}/certificates/verify/${cert.verificationCode}`
    }));

    res.status(200).json({
      success: true,
      data: {
        certificates: certificatesWithDetails,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCertificates / parseInt(limit)),
          totalCertificates,
          hasNext: parseInt(page) * parseInt(limit) < totalCertificates,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user certificates error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch certificates',
        code: 'CERTIFICATES_FETCH_ERROR'
      }
    });
  }
};

// @desc    Share certificate
// @route   POST /api/v1/certificates/:certificateId/share
// @access  Private
const shareCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { platform } = req.body;

    const certificate = await ChallengeCertificate.findOne({
      certificateId,
      userId: req.user._id
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Certificate not found',
          code: 'CERTIFICATE_NOT_FOUND'
        }
      });
    }

    // Mark as shared
    certificate.metadata.shareCount += 1;
    await certificate.save();

    res.status(200).json({
      success: true,
      message: 'Certificate shared successfully',
      data: {
        verificationUrl: `${process.env.FRONTEND_URL}/certificates/verify/${certificate.verificationCode}`
      }
    });
  } catch (error) {
    console.error('Share certificate error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to share certificate',
        code: 'CERTIFICATE_SHARE_ERROR'
      }
    });
  }
};

module.exports = {
  verifyCertificate,
  downloadCertificate,
  getUserCertificates,
  shareCertificate
};