/**
 * Assessment Controller - Quiz and Assessment Management System
 * Handles quiz creation, submissions, grading, and results management
 */

const Assessment = require('../models/Assessment');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const { validationResult } = require('express-validator');

/**
 * Create Assessment (Quiz/Test)
 * POST /api/v1/assessments
 */
exports.createAssessment = async (req, res) => {
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
    const {
      title,
      description,
      type,
      courseId,
      placement,
      configuration,
      content
    } = req.body;

    // Verify instructor owns the course
    const course = await Course.findOne({
      _id: courseId,
      'instructor.userId': instructorId
    });

    if (!course) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to create assessments for this course'
      });
    }

    // Create assessment
    const assessment = new Assessment({
      title,
      description,
      type,
      courseId,
      createdBy: instructorId,
      placement,
      configuration: {
        timeLimit: configuration.timeLimit || 30,
        maxAttempts: configuration.maxAttempts || 3,
        totalPoints: configuration.totalPoints,
        passingScore: configuration.passingScore,
        showCorrectAnswers: configuration.showCorrectAnswers !== undefined ? configuration.showCorrectAnswers : true,
        allowReview: configuration.allowReview !== undefined ? configuration.allowReview : true,
        shuffleQuestions: configuration.shuffleQuestions || false,
        shuffleOptions: configuration.shuffleOptions || false
      },
      content: {
        instructions: content.instructions || '',
        questions: content.questions || []
      },
      status: 'draft'
    });

    // Calculate passing percentage if not provided
    if (!assessment.passingScorePercentage && assessment.configuration.totalPoints > 0) {
      await assessment.calculatePassingPercentage();
    }

    await assessment.save();

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: {
        assessmentId: assessment._id,
        title: assessment.title,
        type: assessment.type,
        totalQuestions: assessment.content.questions.length,
        totalPoints: assessment.configuration.totalPoints,
        passingScore: assessment.configuration.passingScore,
        status: assessment.status
      }
    });

  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create assessment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get Assessments for Course
 * GET /api/v1/assessments/course/:courseId
 */
exports.getCourseAssessments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // For students, verify enrollment
    if (userRole === 'student') {
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
    }

    // Get assessments
    let query = { courseId };
    
    // Students only see published assessments
    if (userRole === 'student') {
      query.status = 'published';
    }

    const assessments = await Assessment.find(query)
      .select('title description type placement configuration status createdAt')
      .sort({ 'placement.position': 1, createdAt: 1 });

    // For students, add attempt information
    const assessmentsWithAttempts = await Promise.all(
      assessments.map(async (assessment) => {
        const assessmentData = {
          id: assessment._id,
          title: assessment.title,
          description: assessment.description,
          type: assessment.type,
          placement: assessment.placement,
          configuration: {
            timeLimit: assessment.configuration.timeLimit,
            maxAttempts: assessment.configuration.maxAttempts,
            totalPoints: assessment.configuration.totalPoints,
            passingScore: assessment.configuration.passingScore
          },
          status: assessment.status,
          createdAt: assessment.createdAt
        };

        if (userRole === 'student') {
          // Get user's attempts for this assessment
          const userAttempts = assessment.attempts?.filter(
            attempt => attempt.userId.toString() === userId
          ) || [];

          assessmentData.userProgress = {
            attemptsTaken: userAttempts.length,
            maxAttempts: assessment.configuration.maxAttempts,
            canRetake: userAttempts.length < assessment.configuration.maxAttempts,
            bestScore: userAttempts.length > 0 
              ? Math.max(...userAttempts.map(a => a.score || 0)) 
              : null,
            lastAttempt: userAttempts.length > 0 
              ? userAttempts[userAttempts.length - 1].submittedAt 
              : null,
            passed: userAttempts.some(a => (a.score || 0) >= assessment.configuration.passingScore)
          };
        }

        return assessmentData;
      })
    );

    res.status(200).json({
      success: true,
      data: {
        assessments: assessmentsWithAttempts
      }
    });

  } catch (error) {
    console.error('Get course assessments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course assessments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get Assessment Details
 * GET /api/v1/assessments/:assessmentId
 */
exports.getAssessmentDetails = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const assessment = await Assessment.findById(assessmentId)
      .populate('courseId', 'title instructor')
      .populate('createdBy', 'profile.firstName profile.lastName');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // For students, verify enrollment and check if assessment is published
    if (userRole === 'student') {
      if (assessment.status !== 'published') {
        return res.status(403).json({
          success: false,
          message: 'This assessment is not available'
        });
      }

      const enrollment = await Enrollment.findOne({
        userId,
        courseId: assessment.courseId._id,
        status: 'active'
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course'
        });
      }
    }

    // Prepare response data
    const responseData = {
      id: assessment._id,
      title: assessment.title,
      description: assessment.description,
      type: assessment.type,
      courseTitle: assessment.courseId.title,
      instructor: assessment.createdBy ? {
        firstName: assessment.createdBy.profile?.firstName,
        lastName: assessment.createdBy.profile?.lastName
      } : null,
      placement: assessment.placement,
      configuration: assessment.configuration,
      status: assessment.status,
      createdAt: assessment.createdAt
    };

    // For students taking the assessment, include questions
    if (userRole === 'student') {
      // Check if user can take this assessment
      const userAttempts = assessment.attempts?.filter(
        attempt => attempt.userId.toString() === userId
      ) || [];

      const canTake = userAttempts.length < assessment.configuration.maxAttempts;

      if (canTake) {
        // Return questions for new attempt (without correct answers)
        responseData.questions = assessment.content.questions.map(q => ({
          questionId: q.questionId,
          questionText: q.questionText,
          questionType: q.questionType,
          points: q.points,
          options: q.content?.options?.map(option => ({
            optionId: option.optionId,
            text: option.text
            // Don't include isCorrect for students
          })) || [],
          // Include other content as needed but exclude answers
        }));
        
        responseData.instructions = assessment.content.instructions;
      }

      responseData.userProgress = {
        attemptsTaken: userAttempts.length,
        maxAttempts: assessment.configuration.maxAttempts,
        canTake,
        bestScore: userAttempts.length > 0 
          ? Math.max(...userAttempts.map(a => a.score || 0)) 
          : null
      };
    }

    // For instructors, include all data including correct answers
    if (userRole === 'guru' || userRole === 'admin') {
      responseData.questions = assessment.content.questions;
      responseData.instructions = assessment.content.instructions;
      responseData.analytics = {
        totalAttempts: assessment.attempts?.length || 0,
        averageScore: assessment.analytics?.averageScore || 0,
        passRate: assessment.analytics?.passRate || 0
      };
    }

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Get assessment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve assessment details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Submit Assessment Attempt
 * POST /api/v1/assessments/:assessmentId/submit
 */
exports.submitAssessment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { assessmentId } = req.params;
    const userId = req.user.id;
    const { answers, timeSpent } = req.body;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      userId,
      courseId: assessment.courseId,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Check attempt limit
    const userAttempts = assessment.attempts?.filter(
      attempt => attempt.userId.toString() === userId
    ) || [];

    if (userAttempts.length >= assessment.configuration.maxAttempts) {
      return res.status(403).json({
        success: false,
        message: 'Maximum attempts reached for this assessment'
      });
    }

    // Grade the assessment
    const gradingResult = await gradeAssessment(assessment, answers);

    // Create attempt record
    const attemptRecord = {
      userId,
      attemptNumber: userAttempts.length + 1,
      answers,
      score: gradingResult.score,
      percentage: gradingResult.percentage,
      passed: gradingResult.passed,
      timeSpent: timeSpent || 0,
      submittedAt: new Date(),
      feedback: gradingResult.feedback
    };

    // Add attempt to assessment
    if (!assessment.attempts) {
      assessment.attempts = [];
    }
    assessment.attempts.push(attemptRecord);

    // Update assessment analytics
    await updateAssessmentAnalytics(assessment);

    await assessment.save();

    // Update course progress if assessment is passed
    if (gradingResult.passed) {
      await updateCourseProgress(userId, assessment.courseId, assessment);
    }

    // Prepare response (include correct answers if configured)
    const responseData = {
      attemptNumber: attemptRecord.attemptNumber,
      score: gradingResult.score,
      percentage: gradingResult.percentage,
      passed: gradingResult.passed,
      passingScore: assessment.configuration.passingScore,
      timeSpent: attemptRecord.timeSpent,
      feedback: gradingResult.feedback,
      canRetake: (userAttempts.length + 1) < assessment.configuration.maxAttempts
    };

    // Include correct answers if configured
    if (assessment.configuration.showCorrectAnswers) {
      responseData.correctAnswers = gradingResult.correctAnswers;
      responseData.detailedResults = gradingResult.detailedResults;
    }

    res.status(200).json({
      success: true,
      message: `Assessment ${gradingResult.passed ? 'passed' : 'completed'}`,
      data: responseData
    });

  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit assessment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get Assessment Results
 * GET /api/v1/assessments/:assessmentId/results
 */
exports.getAssessmentResults = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user.id;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Get user's attempts
    const userAttempts = assessment.attempts?.filter(
      attempt => attempt.userId.toString() === userId
    ) || [];

    if (userAttempts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No attempts found for this assessment'
      });
    }

    // Format attempts for response
    const formattedAttempts = userAttempts.map(attempt => ({
      attemptNumber: attempt.attemptNumber,
      score: attempt.score,
      percentage: attempt.percentage,
      passed: attempt.passed,
      timeSpent: attempt.timeSpent,
      submittedAt: attempt.submittedAt,
      feedback: attempt.feedback
    }));

    // Calculate summary
    const bestScore = Math.max(...userAttempts.map(a => a.score || 0));
    const bestPercentage = Math.max(...userAttempts.map(a => a.percentage || 0));
    const hasPassed = userAttempts.some(a => a.passed);

    res.status(200).json({
      success: true,
      data: {
        assessmentTitle: assessment.title,
        assessmentType: assessment.type,
        totalAttempts: userAttempts.length,
        maxAttempts: assessment.configuration.maxAttempts,
        bestScore,
        bestPercentage,
        hasPassed,
        passingScore: assessment.configuration.passingScore,
        attempts: formattedAttempts
      }
    });

  } catch (error) {
    console.error('Get assessment results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve assessment results',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update Assessment
 * PUT /api/v1/assessments/:assessmentId
 */
exports.updateAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const instructorId = req.user.id;

    const assessment = await Assessment.findOne({
      _id: assessmentId,
      createdBy: instructorId
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or you are not authorized to update it'
      });
    }

    // Don't allow updates if there are submitted attempts
    if (assessment.attempts && assessment.attempts.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'Cannot update assessment with submitted attempts'
      });
    }

    // Update assessment
    const allowedUpdates = [
      'title', 'description', 'configuration', 'content', 'placement'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        assessment[field] = req.body[field];
      }
    });

    // Recalculate passing percentage if needed
    if (req.body.configuration?.totalPoints || req.body.configuration?.passingScore) {
      await assessment.calculatePassingPercentage();
    }

    await assessment.save();

    res.status(200).json({
      success: true,
      message: 'Assessment updated successfully',
      data: {
        id: assessment._id,
        title: assessment.title,
        totalQuestions: assessment.content.questions.length,
        totalPoints: assessment.configuration.totalPoints,
        passingScore: assessment.configuration.passingScore
      }
    });

  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assessment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Publish Assessment
 * PATCH /api/v1/assessments/:assessmentId/publish
 */
exports.publishAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const instructorId = req.user.id;

    const assessment = await Assessment.findOne({
      _id: assessmentId,
      createdBy: instructorId
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or you are not authorized to publish it'
      });
    }

    // Validate assessment before publishing
    if (!assessment.content.questions || assessment.content.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Assessment must have at least one question before publishing'
      });
    }

    if (!assessment.configuration.totalPoints || assessment.configuration.totalPoints === 0) {
      return res.status(400).json({
        success: false,
        message: 'Assessment must have a valid total points configuration'
      });
    }

    assessment.status = 'published';
    assessment.publishedAt = new Date();
    
    await assessment.save();

    res.status(200).json({
      success: true,
      message: 'Assessment published successfully',
      data: {
        id: assessment._id,
        title: assessment.title,
        status: assessment.status,
        publishedAt: assessment.publishedAt
      }
    });

  } catch (error) {
    console.error('Publish assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish assessment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete Assessment
 * DELETE /api/v1/assessments/:assessmentId
 */
exports.deleteAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const instructorId = req.user.id;

    const assessment = await Assessment.findOne({
      _id: assessmentId,
      createdBy: instructorId
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or you are not authorized to delete it'
      });
    }

    // Don't allow deletion if there are submitted attempts
    if (assessment.attempts && assessment.attempts.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete assessment with submitted attempts'
      });
    }

    await Assessment.findByIdAndDelete(assessmentId);

    res.status(200).json({
      success: true,
      message: 'Assessment deleted successfully'
    });

  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete assessment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper Functions

/**
 * Grade assessment attempt
 */
async function gradeAssessment(assessment, userAnswers) {
  let totalScore = 0;
  let totalPoints = 0;
  const feedback = [];
  const correctAnswers = {};
  const detailedResults = [];

  for (const question of assessment.content.questions) {
    totalPoints += question.points || 0;
    const userAnswer = userAnswers[question.questionId];
    correctAnswers[question.questionId] = getCorrectAnswer(question);

    let questionScore = 0;
    let isCorrect = false;

    // Grade based on question type
    switch (question.questionType) {
      case 'single_choice':
        const correctOption = question.content.options.find(opt => opt.isCorrect);
        isCorrect = userAnswer === correctOption?.optionId;
        questionScore = isCorrect ? (question.points || 0) : 0;
        break;

      case 'multiple_choice':
        const correctOptions = question.content.options
          .filter(opt => opt.isCorrect)
          .map(opt => opt.optionId);
        const userSelections = Array.isArray(userAnswer) ? userAnswer : [];
        isCorrect = arraysEqual(userSelections.sort(), correctOptions.sort());
        questionScore = isCorrect ? (question.points || 0) : 0;
        break;

      case 'true_false':
        isCorrect = userAnswer === question.content.correctAnswer;
        questionScore = isCorrect ? (question.points || 0) : 0;
        break;

      case 'fill_blank':
        const correctText = question.content.correctAnswer?.toLowerCase().trim();
        const userText = userAnswer?.toLowerCase().trim();
        isCorrect = correctText === userText;
        questionScore = isCorrect ? (question.points || 0) : 0;
        break;

      default:
        questionScore = 0;
    }

    totalScore += questionScore;

    detailedResults.push({
      questionId: question.questionId,
      questionText: question.questionText,
      userAnswer,
      correctAnswer: correctAnswers[question.questionId],
      isCorrect,
      pointsEarned: questionScore,
      pointsPossible: question.points || 0
    });

    if (!isCorrect && question.explanation) {
      feedback.push({
        questionId: question.questionId,
        explanation: question.explanation
      });
    }
  }

  const percentage = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;
  const passed = totalScore >= assessment.configuration.passingScore;

  return {
    score: totalScore,
    totalPoints,
    percentage: Math.round(percentage * 10) / 10,
    passed,
    feedback,
    correctAnswers,
    detailedResults
  };
}

/**
 * Get correct answer for a question
 */
function getCorrectAnswer(question) {
  switch (question.questionType) {
    case 'single_choice':
      return question.content.options.find(opt => opt.isCorrect)?.optionId;
    case 'multiple_choice':
      return question.content.options
        .filter(opt => opt.isCorrect)
        .map(opt => opt.optionId);
    case 'true_false':
    case 'fill_blank':
      return question.content.correctAnswer;
    default:
      return null;
  }
}

/**
 * Check if arrays are equal
 */
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
}

/**
 * Update assessment analytics
 */
async function updateAssessmentAnalytics(assessment) {
  try {
    if (!assessment.attempts || assessment.attempts.length === 0) return;

    const scores = assessment.attempts.map(attempt => attempt.score || 0);
    const passedAttempts = assessment.attempts.filter(attempt => attempt.passed).length;

    assessment.analytics = {
      totalAttempts: assessment.attempts.length,
      averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      passRate: (passedAttempts / assessment.attempts.length) * 100,
      averageTimeSpent: assessment.attempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0) / assessment.attempts.length
    };
  } catch (error) {
    console.error('Update assessment analytics error:', error);
  }
}

/**
 * Update course progress when assessment is passed
 */
async function updateCourseProgress(userId, courseId, assessment) {
  try {
    const progress = await Progress.findOne({ userId, courseId });
    if (!progress) return;

    // Mark assessment as completed in progress tracking
    progress.interactions.push({
      type: 'assessment_completed',
      assessmentId: assessment._id,
      content: `Passed assessment: ${assessment.title}`,
      timestamp: new Date()
    });

    await progress.save();
  } catch (error) {
    console.error('Update course progress error:', error);
  }
}