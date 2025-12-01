/**
 * Challenge Controller - Admin challenge management
 */

const Challenge = require('../models/Challenge');
const ChallengeParticipant = require('../models/ChallengeParticipant');
const ChallengeCertificate = require('../models/ChallengeCertificate');
const User = require('../models/User');

// @desc    Create new challenge (Admin only)
// @route   POST /api/v1/admin/challenges
// @access  Private/Admin
const createChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      instructions,
      type,
      requirements,
      startDate,
      endDate,
      rewards,
      settings
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Start date cannot be in the past',
          code: 'INVALID_START_DATE'
        }
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'End date must be after start date',
          code: 'INVALID_END_DATE'
        }
      });
    }

    // Create challenge
    const challenge = new Challenge({
      title,
      description,
      instructions,
      type,
      requirements,
      startDate: start,
      endDate: end,
      rewards,
      settings,
      createdBy: req.user._id,
      status: 'draft'
    });

    await challenge.save();

    res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      data: {
        challenge
      }
    });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create challenge',
        code: 'CHALLENGE_CREATION_ERROR'
      }
    });
  }
};

// @desc    Get all challenges with filtering and pagination
// @route   GET /api/v1/admin/challenges
// @access  Private/Admin
const getAllChallenges = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      difficulty,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Apply filters
    if (status) query.status = status;
    if (type) query.type = type;
    if (difficulty) query['requirements.difficulty'] = difficulty;
    if (category) query['requirements.category'] = category;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const [challenges, totalChallenges] = await Promise.all([
      Challenge.find(query)
        .populate('createdBy', 'username profile.firstName profile.lastName')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limitNumber),
      Challenge.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalChallenges / limitNumber);

    res.status(200).json({
      success: true,
      data: {
        challenges,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalChallenges,
          hasNext: pageNumber < totalPages,
          hasPrev: pageNumber > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all challenges error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch challenges',
        code: 'CHALLENGES_FETCH_ERROR'
      }
    });
  }
};

// @desc    Get single challenge by ID
// @route   GET /api/v1/admin/challenges/:id
// @access  Private/Admin
const getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('createdBy', 'username profile.firstName profile.lastName');

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Challenge not found',
          code: 'CHALLENGE_NOT_FOUND'
        }
      });
    }

    // Get participant statistics
    const participantStats = await ChallengeParticipant.aggregate([
      { $match: { challengeId: challenge._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      total: 0,
      registered: 0,
      in_progress: 0,
      completed: 0,
      abandoned: 0,
      failed: 0
    };

    participantStats.forEach(stat => {
      stats[stat._id] = stat.count;
      stats.total += stat.count;
    });

    res.status(200).json({
      success: true,
      data: {
        challenge,
        participantStats: stats
      }
    });
  } catch (error) {
    console.error('Get challenge error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch challenge',
        code: 'CHALLENGE_FETCH_ERROR'
      }
    });
  }
};

// @desc    Update challenge
// @route   PUT /api/v1/admin/challenges/:id
// @access  Private/Admin
const updateChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Challenge not found',
          code: 'CHALLENGE_NOT_FOUND'
        }
      });
    }

    // Don't allow updates if challenge is completed or has participants
    if (challenge.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot update completed challenge',
          code: 'CHALLENGE_COMPLETED'
        }
      });
    }

    // Check if challenge has participants
    const participantCount = await ChallengeParticipant.countDocuments({
      challengeId: challenge._id
    });

    if (participantCount > 0 && req.body.requirements) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot change requirements after users have participated',
          code: 'PARTICIPANTS_EXISTS'
        }
      });
    }

    // Update challenge
    Object.assign(challenge, req.body);
    await challenge.save();

    res.status(200).json({
      success: true,
      message: 'Challenge updated successfully',
      data: {
        challenge
      }
    });
  } catch (error) {
    console.error('Update challenge error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update challenge',
        code: 'CHALLENGE_UPDATE_ERROR'
      }
    });
  }
};

// @desc    Delete challenge
// @route   DELETE /api/v1/admin/challenges/:id
// @access  Private/Admin
const deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Challenge not found',
          code: 'CHALLENGE_NOT_FOUND'
        }
      });
    }

    // Don't allow deletion if challenge has participants
    const participantCount = await ChallengeParticipant.countDocuments({
      challengeId: challenge._id
    });

    if (participantCount > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete challenge with participants. Archive instead.',
          code: 'PARTICIPANTS_EXISTS'
        }
      });
    }

    await Challenge.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Challenge deleted successfully'
    });
  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete challenge',
        code: 'CHALLENGE_DELETE_ERROR'
      }
    });
  }
};

// @desc    Activate challenge
// @route   POST /api/v1/admin/challenges/:id/activate
// @access  Private/Admin
const activateChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Challenge not found',
          code: 'CHALLENGE_NOT_FOUND'
        }
      });
    }

    if (challenge.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Only draft challenges can be activated',
          code: 'INVALID_STATUS'
        }
      });
    }

    const now = new Date();
    if (challenge.startDate > now) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot activate challenge before start date',
          code: 'EARLY_ACTIVATION'
        }
      });
    }

    challenge.status = 'active';
    await challenge.save();

    res.status(200).json({
      success: true,
      message: 'Challenge activated successfully',
      data: {
        challenge
      }
    });
  } catch (error) {
    console.error('Activate challenge error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to activate challenge',
        code: 'CHALLENGE_ACTIVATION_ERROR'
      }
    });
  }
};

// @desc    Get challenge leaderboard
// @route   GET /api/v1/admin/challenges/:id/leaderboard
// @access  Private/Admin
const getChallengeLeaderboard = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Challenge not found',
          code: 'CHALLENGE_NOT_FOUND'
        }
      });
    }

    const leaderboard = await ChallengeParticipant.find({
      challengeId: req.params.id,
      status: 'completed'
    })
    .populate('userId', 'username profile.firstName profile.lastName profile.avatar')
    .sort({ score: -1, completedAt: 1 })
    .limit(parseInt(limit));

    // Add rank to each participant
    const rankedLeaderboard = leaderboard.map((participant, index) => ({
      rank: index + 1,
      user: participant.userId,
      score: participant.score,
      maxScore: participant.maxScore,
      accuracy: participant.accuracy,
      timeSpent: participant.timeSpent,
      completedAt: participant.completedAt,
      pointsEarned: participant.achievements.pointsEarned
    }));

    res.status(200).json({
      success: true,
      data: {
        challenge: {
          id: challenge._id,
          title: challenge.title,
          type: challenge.type
        },
        leaderboard: rankedLeaderboard,
        totalParticipants: challenge.stats.totalParticipants,
        completedParticipants: challenge.stats.completedParticipants
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch leaderboard',
        code: 'LEADERBOARD_FETCH_ERROR'
      }
    });
  }
};

// @desc    Get challenge participants
// @route   GET /api/v1/admin/challenges/:id/participants
// @access  Private/Admin
const getChallengeParticipants = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { challengeId: req.params.id };
    if (status) query.status = status;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: {
        path: 'userId',
        select: 'username profile.firstName profile.lastName profile.avatar email'
      }
    };

    const participants = await ChallengeParticipant.paginate(query, options);

    res.status(200).json({
      success: true,
      data: {
        participants: participants.docs,
        pagination: {
          currentPage: participants.page,
          totalPages: participants.totalPages,
          totalParticipants: participants.totalDocs,
          hasNext: participants.hasNextPage,
          hasPrev: participants.hasPrevPage
        }
      }
    });
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch participants',
        code: 'PARTICIPANTS_FETCH_ERROR'
      }
    });
  }
};

// @desc    Issue certificate to participant
// @route   POST /api/v1/admin/challenges/:challengeId/participants/:participantId/certificate
// @access  Private/Admin
const issueCertificate = async (req, res) => {
  try {
    const { challengeId, participantId } = req.params;
    const { certificateTemplate, customMessage } = req.body;

    // Find participant
    const participant = await ChallengeParticipant.findOne({
      _id: participantId,
      challengeId: challengeId,
      status: 'completed'
    }).populate('challengeId').populate('userId');

    if (!participant) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Completed participant not found',
          code: 'PARTICIPANT_NOT_FOUND'
        }
      });
    }

    // Check if certificate already exists
    const existingCertificate = await ChallengeCertificate.findOne({
      userId: participant.userId._id,
      challengeId: challengeId
    });

    if (existingCertificate) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Certificate already issued for this participant',
          code: 'CERTIFICATE_EXISTS'
        }
      });
    }

    // Get participant's rank
    const rank = await participant.challengeId.getUserRank(participant.userId._id);

    // Create certificate
    const certificate = new ChallengeCertificate({
      userId: participant.userId._id,
      challengeId: challengeId,
      participantId: participantId,
      title: `Certificate of Achievement - ${participant.challengeId.title}`,
      description: customMessage || `Congratulations on completing the ${participant.challengeId.title} challenge!`,
      recipientName: `${participant.userId.profile.firstName} ${participant.userId.profile.lastName}`,
      achievement: {
        challengeTitle: participant.challengeId.title,
        score: participant.score,
        maxScore: participant.maxScore,
        accuracy: participant.accuracy,
        completionDate: participant.completedAt,
        timeSpent: participant.timeSpent,
        rank: {
          position: rank,
          totalParticipants: participant.challengeId.stats.completedParticipants
        }
      },
      signature: {
        issuedBy: req.user._id
      },
      status: 'generated'
    });

    // Apply custom template if provided
    if (certificateTemplate) {
      Object.assign(certificate.template, certificateTemplate);
    }

    await certificate.save();

    // Update participant's certificate information
    participant.achievements.certificateEarned = {
      certificateId: certificate.certificateId,
      issuedAt: new Date(),
      verificationCode: certificate.verificationCode
    };
    await participant.save();

    res.status(201).json({
      success: true,
      message: 'Certificate issued successfully',
      data: {
        certificate,
        downloadUrl: `${process.env.FRONTEND_URL}/certificates/download/${certificate.certificateId}`,
        verificationUrl: `${process.env.FRONTEND_URL}/certificates/verify/${certificate.verificationCode}`
      }
    });
  } catch (error) {
    console.error('Issue certificate error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to issue certificate',
        code: 'CERTIFICATE_ISSUE_ERROR'
      }
    });
  }
};

// @desc    Get challenge analytics
// @route   GET /api/v1/admin/challenges/:id/analytics
// @access  Private/Admin
const getChallengeAnalytics = async (req, res) => {
  try {
    const challengeId = req.params.id;

    // Get challenge
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Challenge not found',
          code: 'CHALLENGE_NOT_FOUND'
        }
      });
    }

    // Get participant analytics
    const analytics = await ChallengeParticipant.aggregate([
      { $match: { challengeId: challenge._id } },
      {
        $group: {
          _id: null,
          totalParticipants: { $sum: 1 },
          completedParticipants: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          averageScore: { $avg: '$score' },
          averageAccuracy: { $avg: '$accuracy' },
          averageTimeSpent: { $avg: '$timeSpent' },
          totalAttempts: { $sum: '$attempts' }
        }
      }
    ]);

    // Get score distribution
    const scoreDistribution = await ChallengeParticipant.aggregate([
      { $match: { challengeId: challenge._id, status: 'completed' } },
      {
        $bucket: {
          groupBy: '$score',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'other',
          output: {
            count: { $sum: 1 },
            averageAccuracy: { $avg: '$accuracy' }
          }
        }
      }
    ]);

    // Get completion trends (daily)
    const completionTrends = await ChallengeParticipant.aggregate([
      { $match: { challengeId: challenge._id, status: 'completed' } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
          },
          completions: { $sum: 1 },
          averageScore: { $avg: '$score' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const result = {
      challenge: {
        id: challenge._id,
        title: challenge.title,
        status: challenge.status,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        duration: challenge.duration
      },
      overview: analytics[0] || {
        totalParticipants: 0,
        completedParticipants: 0,
        averageScore: 0,
        averageAccuracy: 0,
        averageTimeSpent: 0,
        totalAttempts: 0
      },
      scoreDistribution,
      completionTrends,
      completionRate: analytics[0] ? 
        ((analytics[0].completedParticipants / analytics[0].totalParticipants) * 100).toFixed(2) : 0
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch analytics',
        code: 'ANALYTICS_FETCH_ERROR'
      }
    });
  }
};

module.exports = {
  createChallenge,
  getAllChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
  activateChallenge,
  getChallengeLeaderboard,
  getChallengeParticipants,
  issueCertificate,
  getChallengeAnalytics
};