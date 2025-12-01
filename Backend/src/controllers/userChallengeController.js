/**
 * User Challenge Controller - User participation in challenges
 */

const Challenge = require('../models/Challenge');
const ChallengeParticipant = require('../models/ChallengeParticipant');
const ChallengeCertificate = require('../models/ChallengeCertificate');
const User = require('../models/User');

// @desc    Get active challenges for users
// @route   GET /api/v1/challenges
// @access  Private
const getActiveChallenges = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      type,
      difficulty,
      category,
      sortBy = 'startDate',
      sortOrder = 'desc'
    } = req.query;

    const query = {
      status: 'active',
      'settings.isPublic': true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    };

    // Apply filters
    if (type) query.type = type;
    if (difficulty) query['requirements.difficulty'] = difficulty;
    if (category) query['requirements.category'] = category;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: {
        path: 'createdBy',
        select: 'username profile.firstName profile.lastName'
      }
    };

    const challenges = await Challenge.paginate(query, options);

    // Check user participation status for each challenge
    const challengesWithStatus = await Promise.all(
      challenges.docs.map(async (challenge) => {
        const participation = await ChallengeParticipant.findOne({
          challengeId: challenge._id,
          userId: req.user._id
        });

        const canParticipate = await challenge.canUserParticipate(req.user._id);

        return {
          ...challenge.toObject(),
          userStatus: participation ? participation.status : 'not_registered',
          canParticipate: canParticipate.canParticipate,
          participationReason: canParticipate.reason,
          userScore: participation ? participation.score : null,
          userRank: participation && participation.status === 'completed' 
            ? await challenge.getUserRank(req.user._id) : null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        challenges: challengesWithStatus,
        pagination: {
          currentPage: challenges.page,
          totalPages: challenges.totalPages,
          totalChallenges: challenges.totalDocs,
          hasNext: challenges.hasNextPage,
          hasPrev: challenges.hasPrevPage
        }
      }
    });
  } catch (error) {
    console.error('Get active challenges error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch challenges',
        code: 'CHALLENGES_FETCH_ERROR'
      }
    });
  }
};

// @desc    Get challenge details with user status
// @route   GET /api/v1/challenges/:id
// @access  Private
const getChallengeDetails = async (req, res) => {
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

    if (!challenge.settings.isPublic && challenge.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied to private challenge',
          code: 'ACCESS_DENIED'
        }
      });
    }

    // Get user participation
    const participation = await ChallengeParticipant.findOne({
      challengeId: challenge._id,
      userId: req.user._id
    });

    // Check if user can participate
    const canParticipate = await challenge.canUserParticipate(req.user._id);

    // Get leaderboard (top 10)
    const leaderboard = await ChallengeParticipant.find({
      challengeId: challenge._id,
      status: 'completed'
    })
    .populate('userId', 'username profile.firstName profile.lastName profile.avatar')
    .sort({ score: -1, completedAt: 1 })
    .limit(10);

    const rankedLeaderboard = leaderboard.map((participant, index) => ({
      rank: index + 1,
      user: {
        id: participant.userId._id,
        username: participant.userId.username,
        name: `${participant.userId.profile.firstName} ${participant.userId.profile.lastName}`,
        avatar: participant.userId.profile.avatar
      },
      score: participant.score,
      maxScore: participant.maxScore,
      accuracy: participant.accuracy,
      completedAt: participant.completedAt
    }));

    res.status(200).json({
      success: true,
      data: {
        challenge,
        userParticipation: participation,
        canParticipate: canParticipate.canParticipate,
        participationReason: canParticipate.reason,
        userRank: participation && participation.status === 'completed' 
          ? await challenge.getUserRank(req.user._id) : null,
        leaderboard: rankedLeaderboard
      }
    });
  } catch (error) {
    console.error('Get challenge details error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch challenge details',
        code: 'CHALLENGE_DETAILS_ERROR'
      }
    });
  }
};

// @desc    Join/Register for a challenge
// @route   POST /api/v1/challenges/:id/join
// @access  Private
const joinChallenge = async (req, res) => {
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

    // Check if user can participate
    const canParticipate = await challenge.canUserParticipate(req.user._id);
    if (!canParticipate.canParticipate) {
      return res.status(400).json({
        success: false,
        error: {
          message: canParticipate.reason,
          code: 'PARTICIPATION_DENIED'
        }
      });
    }

    // Check if already registered
    let participation = await ChallengeParticipant.findOne({
      challengeId: challenge._id,
      userId: req.user._id
    });

    if (participation) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Already registered for this challenge',
          code: 'ALREADY_REGISTERED'
        }
      });
    }

    // Create participation record
    participation = new ChallengeParticipant({
      challengeId: challenge._id,
      userId: req.user._id,
      status: 'registered',
      maxScore: challenge.rewards.points || 100
    });

    await participation.save();

    // Update challenge statistics
    challenge.stats.totalParticipants += 1;
    await challenge.save();

    res.status(201).json({
      success: true,
      message: 'Successfully registered for challenge',
      data: {
        participation,
        challenge: {
          id: challenge._id,
          title: challenge.title,
          type: challenge.type,
          startDate: challenge.startDate,
          endDate: challenge.endDate
        }
      }
    });
  } catch (error) {
    console.error('Join challenge error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to join challenge',
        code: 'JOIN_CHALLENGE_ERROR'
      }
    });
  }
};

// @desc    Start challenge attempt
// @route   POST /api/v1/challenges/:id/start
// @access  Private
const startChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge || !challenge.isActive) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Challenge is not active',
          code: 'CHALLENGE_NOT_ACTIVE'
        }
      });
    }

    const participation = await ChallengeParticipant.findOne({
      challengeId: challenge._id,
      userId: req.user._id
    });

    if (!participation) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Must register for challenge first',
          code: 'NOT_REGISTERED'
        }
      });
    }

    if (participation.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Challenge already completed',
          code: 'ALREADY_COMPLETED'
        }
      });
    }

    if (participation.attempts >= challenge.settings.maxRetries) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Maximum attempts exceeded',
          code: 'MAX_ATTEMPTS_EXCEEDED'
        }
      });
    }

    // Start new attempt
    await participation.startNewAttempt();

    res.status(200).json({
      success: true,
      message: 'Challenge attempt started',
      data: {
        participation,
        attemptNumber: participation.attempts,
        maxAttempts: challenge.settings.maxRetries,
        timeLimit: challenge.requirements.timeLimit
      }
    });
  } catch (error) {
    console.error('Start challenge error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to start challenge',
        code: 'START_CHALLENGE_ERROR'
      }
    });
  }
};

// @desc    Submit challenge response
// @route   POST /api/v1/challenges/:id/submit
// @access  Private
const submitChallengeResponse = async (req, res) => {
  try {
    const { questionId, answer, timeSpent } = req.body;

    const participation = await ChallengeParticipant.findOne({
      challengeId: req.params.id,
      userId: req.user._id,
      status: 'in_progress'
    });

    if (!participation) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No active challenge attempt found',
          code: 'NO_ACTIVE_ATTEMPT'
        }
      });
    }

    // Auto-grade response (this would be more sophisticated in real implementation)
    const isCorrect = await gradeResponse(questionId, answer);

    // Submit response
    await participation.submitResponse(questionId, answer, isCorrect, timeSpent);

    res.status(200).json({
      success: true,
      message: 'Response submitted successfully',
      data: {
        isCorrect,
        currentProgress: participation.currentAttempt.progress,
        responseCount: participation.currentAttempt.responses.length
      }
    });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to submit response',
        code: 'SUBMIT_RESPONSE_ERROR'
      }
    });
  }
};

// @desc    Complete challenge
// @route   POST /api/v1/challenges/:id/complete
// @access  Private
const completeChallenge = async (req, res) => {
  try {
    const { finalAnswers } = req.body;

    const challenge = await Challenge.findById(req.params.id);
    const participation = await ChallengeParticipant.findOne({
      challengeId: req.params.id,
      userId: req.user._id,
      status: 'in_progress'
    });

    if (!participation) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No active challenge attempt found',
          code: 'NO_ACTIVE_ATTEMPT'
        }
      });
    }

    // Calculate final score
    const { finalScore, maxScore } = await calculateFinalScore(participation, finalAnswers, challenge);

    // Complete challenge
    await participation.completeChallenge(finalScore, maxScore);

    // Calculate rewards
    const rewards = await calculateRewards(participation, challenge);
    participation.achievements.pointsEarned = rewards.points;
    participation.achievements.badgesEarned = rewards.badges;

    // Update leaderboard position
    const rank = await challenge.getUserRank(req.user._id);
    participation.achievements.leaderboardPosition = {
      rank,
      total: challenge.stats.completedParticipants,
      updatedAt: new Date()
    };

    await participation.save();

    // Update user's total points (if you have a points system)
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'gamification.totalPoints': rewards.points }
    });

    // Auto-issue certificate if enabled
    let certificate = null;
    if (challenge.rewards.certificate.enabled) {
      certificate = await autoIssueCertificate(challenge, participation, req.user);
    }

    res.status(200).json({
      success: true,
      message: 'Challenge completed successfully',
      data: {
        participation,
        rewards,
        rank,
        certificate: certificate ? {
          certificateId: certificate.certificateId,
          verificationCode: certificate.verificationCode,
          downloadUrl: `${process.env.FRONTEND_URL}/certificates/download/${certificate.certificateId}`
        } : null
      }
    });
  } catch (error) {
    console.error('Complete challenge error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to complete challenge',
        code: 'COMPLETE_CHALLENGE_ERROR'
      }
    });
  }
};

// @desc    Get user's challenge history
// @route   GET /api/v1/challenges/my-challenges
// @access  Private
const getUserChallenges = async (req, res) => {
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
        select: 'title type requirements.difficulty requirements.category rewards'
      }
    };

    const participations = await ChallengeParticipant.paginate(query, options);

    // Add rank information for completed challenges
    const participationsWithRank = await Promise.all(
      participations.docs.map(async (participation) => {
        let rank = null;
        if (participation.status === 'completed') {
          rank = await participation.challengeId.getUserRank(req.user._id);
        }

        return {
          ...participation.toObject(),
          rank
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        participations: participationsWithRank,
        pagination: {
          currentPage: participations.page,
          totalPages: participations.totalPages,
          totalParticipations: participations.totalDocs,
          hasNext: participations.hasNextPage,
          hasPrev: participations.hasPrevPage
        }
      }
    });
  } catch (error) {
    console.error('Get user challenges error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch user challenges',
        code: 'USER_CHALLENGES_ERROR'
      }
    });
  }
};

// @desc    Get challenge leaderboard
// @route   GET /api/v1/challenges/:id/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
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

    const leaderboard = await ChallengeParticipant.getLeaderboard(req.params.id, parseInt(limit));

    // Add rank and highlight current user
    const rankedLeaderboard = leaderboard.map((participant, index) => ({
      rank: index + 1,
      user: {
        id: participant.userId._id,
        username: participant.userId.username,
        name: `${participant.userId.profile.firstName} ${participant.userId.profile.lastName}`,
        avatar: participant.userId.profile.avatar
      },
      score: participant.score,
      maxScore: participant.maxScore,
      accuracy: participant.accuracy,
      timeSpent: participant.timeSpent,
      completedAt: participant.completedAt,
      isCurrentUser: participant.userId._id.toString() === req.user._id.toString()
    }));

    // Get current user's rank if not in top list
    let userRank = null;
    if (!rankedLeaderboard.some(entry => entry.isCurrentUser)) {
      userRank = await challenge.getUserRank(req.user._id);
    }

    res.status(200).json({
      success: true,
      data: {
        challenge: {
          id: challenge._id,
          title: challenge.title,
          type: challenge.type
        },
        leaderboard: rankedLeaderboard,
        userRank,
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

// Helper functions
async function gradeResponse(questionId, answer) {
  // This would contain actual grading logic based on question type
  // For now, returning a mock result
  return Math.random() > 0.3; // 70% correct rate for testing
}

async function calculateFinalScore(participation, finalAnswers, challenge) {
  // Calculate score based on correct answers, time taken, etc.
  const correctAnswers = participation.currentAttempt.responses.filter(r => r.isCorrect).length;
  const totalQuestions = participation.currentAttempt.responses.length;
  const baseScore = (correctAnswers / totalQuestions) * 100;
  
  // Apply time bonus/penalty if applicable
  let finalScore = baseScore;
  if (challenge.requirements.timeLimit) {
    const timeBonus = Math.max(0, (challenge.requirements.timeLimit - participation.timeSpent) / challenge.requirements.timeLimit * 10);
    finalScore = Math.min(100, baseScore + timeBonus);
  }

  return { finalScore: Math.round(finalScore), maxScore: 100 };
}

async function calculateRewards(participation, challenge) {
  let points = challenge.rewards.points || 0;
  const badges = [];

  // Base completion points
  if (participation.status === 'completed') {
    points += challenge.rewards.leaderboardPosition.participation.points;
  }

  // Performance bonuses
  if (participation.accuracy >= 90) {
    points += 50;
    badges.push({
      name: 'High Achiever',
      description: 'Scored 90% or higher accuracy',
      icon: 'trophy',
      earnedAt: new Date()
    });
  }

  // Leaderboard position bonuses
  const rank = await challenge.getUserRank(participation.userId);
  if (rank === 1) {
    points += challenge.rewards.leaderboardPosition.first.points;
    badges.push({
      name: 'Champion',
      description: 'First place in challenge',
      icon: 'crown',
      earnedAt: new Date()
    });
  } else if (rank === 2) {
    points += challenge.rewards.leaderboardPosition.second.points;
  } else if (rank === 3) {
    points += challenge.rewards.leaderboardPosition.third.points;
  }

  return { points, badges };
}

async function autoIssueCertificate(challenge, participation, user) {
  try {
    const rank = await challenge.getUserRank(user._id);

    const certificate = new ChallengeCertificate({
      userId: user._id,
      challengeId: challenge._id,
      participantId: participation._id,
      title: challenge.rewards.certificate.title || `Certificate of Achievement - ${challenge.title}`,
      description: challenge.rewards.certificate.description || `Congratulations on completing the ${challenge.title} challenge!`,
      recipientName: `${user.profile.firstName} ${user.profile.lastName}`,
      achievement: {
        challengeTitle: challenge.title,
        score: participation.score,
        maxScore: participation.maxScore,
        accuracy: participation.accuracy,
        completionDate: participation.completedAt,
        timeSpent: participation.timeSpent,
        rank: {
          position: rank,
          totalParticipants: challenge.stats.completedParticipants
        }
      },
      signature: {
        issuedBy: challenge.createdBy
      },
      status: 'generated'
    });

    await certificate.save();

    // Update participation with certificate info
    participation.achievements.certificateEarned = {
      certificateId: certificate.certificateId,
      issuedAt: new Date(),
      verificationCode: certificate.verificationCode
    };
    await participation.save();

    return certificate;
  } catch (error) {
    console.error('Auto issue certificate error:', error);
    return null;
  }
}

module.exports = {
  getActiveChallenges,
  getChallengeDetails,
  joinChallenge,
  startChallenge,
  submitChallengeResponse,
  completeChallenge,
  getUserChallenges,
  getLeaderboard
};