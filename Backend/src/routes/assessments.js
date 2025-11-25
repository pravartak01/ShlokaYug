/**
 * Assessment Routes - Quiz and Assessment Management
 * Handles all assessment-related API endpoints with validation
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { auth } = require('../middleware/auth');
const {
  createAssessment,
  getCourseAssessments,
  getAssessmentDetails,
  submitAssessment,
  getAssessmentResults,
  updateAssessment,
  publishAssessment,
  deleteAssessment
} = require('../controllers/assessmentController');

/**
 * POST /api/v1/assessments
 * Create new assessment (Instructor/Admin only)
 */
router.post('/',
  auth,
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Assessment title is required')
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    
    body('type')
      .notEmpty()
      .withMessage('Assessment type is required')
      .isIn(['quiz', 'test', 'exam', 'assignment'])
      .withMessage('Assessment type must be quiz, test, exam, or assignment'),
    
    body('courseId')
      .notEmpty()
      .withMessage('Course ID is required')
      .isMongoId()
      .withMessage('Invalid course ID format'),
    
    body('placement.type')
      .optional()
      .isIn(['lecture', 'module', 'course'])
      .withMessage('Placement type must be lecture, module, or course'),
    
    body('placement.position')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Placement position must be a positive integer'),
    
    body('configuration.timeLimit')
      .optional()
      .isInt({ min: 5, max: 300 })
      .withMessage('Time limit must be between 5 and 300 minutes'),
    
    body('configuration.maxAttempts')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Max attempts must be between 1 and 10'),
    
    body('configuration.totalPoints')
      .optional()
      .isFloat({ min: 1 })
      .withMessage('Total points must be at least 1'),
    
    body('configuration.passingScore')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Passing score must be a positive number'),
    
    body('configuration.showCorrectAnswers')
      .optional()
      .isBoolean()
      .withMessage('Show correct answers must be true or false'),
    
    body('configuration.allowReview')
      .optional()
      .isBoolean()
      .withMessage('Allow review must be true or false'),
    
    body('configuration.shuffleQuestions')
      .optional()
      .isBoolean()
      .withMessage('Shuffle questions must be true or false'),
    
    body('configuration.shuffleOptions')
      .optional()
      .isBoolean()
      .withMessage('Shuffle options must be true or false'),
    
    body('content.instructions')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Instructions cannot exceed 2000 characters'),
    
    body('content.questions')
      .optional()
      .isArray()
      .withMessage('Questions must be an array'),
    
    body('content.questions.*.questionText')
      .if(body('content.questions').exists())
      .notEmpty()
      .withMessage('Question text is required'),
    
    body('content.questions.*.questionType')
      .if(body('content.questions').exists())
      .isIn(['single_choice', 'multiple_choice', 'true_false', 'fill_blank', 'essay'])
      .withMessage('Invalid question type'),
    
    body('content.questions.*.points')
      .if(body('content.questions').exists())
      .isFloat({ min: 0 })
      .withMessage('Question points must be a positive number')
  ],
  (req, res, next) => {
    // Check user role
    if (req.user.role !== 'guru' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only instructors and admins can create assessments'
      });
    }
    next();
  },
  createAssessment
);

/**
 * GET /api/v1/assessments/course/:courseId
 * Get all assessments for a course
 */
router.get('/course/:courseId',
  auth,
  [
    param('courseId')
      .isMongoId()
      .withMessage('Invalid course ID format')
  ],
  getCourseAssessments
);

/**
 * GET /api/v1/assessments/:assessmentId
 * Get assessment details
 */
router.get('/:assessmentId',
  auth,
  [
    param('assessmentId')
      .isMongoId()
      .withMessage('Invalid assessment ID format')
  ],
  getAssessmentDetails
);

/**
 * POST /api/v1/assessments/:assessmentId/submit
 * Submit assessment attempt (Students only)
 */
router.post('/:assessmentId/submit',
  auth,
  [
    param('assessmentId')
      .isMongoId()
      .withMessage('Invalid assessment ID format'),
    
    body('answers')
      .notEmpty()
      .withMessage('Answers are required')
      .isObject()
      .withMessage('Answers must be an object'),
    
    body('timeSpent')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Time spent must be a positive integer (in seconds)')
  ],
  (req, res, next) => {
    // Check user role - only students can submit
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can submit assessments'
      });
    }
    next();
  },
  submitAssessment
);

/**
 * GET /api/v1/assessments/:assessmentId/results
 * Get assessment results for current user
 */
router.get('/:assessmentId/results',
  auth,
  [
    param('assessmentId')
      .isMongoId()
      .withMessage('Invalid assessment ID format')
  ],
  getAssessmentResults
);

/**
 * PUT /api/v1/assessments/:assessmentId
 * Update assessment (Instructor/Admin only)
 */
router.put('/:assessmentId',
  auth,
  [
    param('assessmentId')
      .isMongoId()
      .withMessage('Invalid assessment ID format'),
    
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Assessment title cannot be empty')
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    
    body('configuration.timeLimit')
      .optional()
      .isInt({ min: 5, max: 300 })
      .withMessage('Time limit must be between 5 and 300 minutes'),
    
    body('configuration.maxAttempts')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Max attempts must be between 1 and 10'),
    
    body('configuration.totalPoints')
      .optional()
      .isFloat({ min: 1 })
      .withMessage('Total points must be at least 1'),
    
    body('configuration.passingScore')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Passing score must be a positive number')
  ],
  (req, res, next) => {
    // Check user role
    if (req.user.role !== 'guru' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only instructors and admins can update assessments'
      });
    }
    next();
  },
  updateAssessment
);

/**
 * PATCH /api/v1/assessments/:assessmentId/publish
 * Publish assessment (Instructor/Admin only)
 */
router.patch('/:assessmentId/publish',
  auth,
  [
    param('assessmentId')
      .isMongoId()
      .withMessage('Invalid assessment ID format')
  ],
  (req, res, next) => {
    // Check user role
    if (req.user.role !== 'guru' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only instructors and admins can publish assessments'
      });
    }
    next();
  },
  publishAssessment
);

/**
 * DELETE /api/v1/assessments/:assessmentId
 * Delete assessment (Instructor/Admin only)
 */
router.delete('/:assessmentId',
  auth,
  [
    param('assessmentId')
      .isMongoId()
      .withMessage('Invalid assessment ID format')
  ],
  (req, res, next) => {
    // Check user role
    if (req.user.role !== 'guru' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only instructors and admins can delete assessments'
      });
    }
    next();
  },
  deleteAssessment
);

/**
 * GET /api/v1/assessments/course/:courseId/analytics
 * Get course assessment analytics (Instructor/Admin only)
 */
router.get('/course/:courseId/analytics',
  auth,
  [
    param('courseId')
      .isMongoId()
      .withMessage('Invalid course ID format'),
    
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date')
  ],
  (req, res, next) => {
    // Check user role
    if (req.user.role !== 'guru' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only instructors and admins can view assessment analytics'
      });
    }
    next();
  },
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const { startDate, endDate } = req.query;
      
      // Build query filters
      let dateFilter = {};
      if (startDate || endDate) {
        dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);
      }

      const Assessment = require('../models/Assessment');
      
      // Get assessments with analytics
      let query = { courseId };
      const assessments = await Assessment.find(query)
        .select('title type analytics attempts createdAt publishedAt');

      // Calculate overall course assessment analytics
      let totalAttempts = 0;
      let totalPassed = 0;
      let totalTimeSpent = 0;
      let assessmentBreakdown = [];

      assessments.forEach(assessment => {
        let attempts = assessment.attempts || [];
        
        // Filter by date if specified
        if (Object.keys(dateFilter).length > 0) {
          attempts = attempts.filter(attempt => {
            const attemptDate = new Date(attempt.submittedAt);
            return (!dateFilter.$gte || attemptDate >= dateFilter.$gte) &&
                   (!dateFilter.$lte || attemptDate <= dateFilter.$lte);
          });
        }

        const passed = attempts.filter(a => a.passed).length;
        const timeSpent = attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);

        totalAttempts += attempts.length;
        totalPassed += passed;
        totalTimeSpent += timeSpent;

        assessmentBreakdown.push({
          id: assessment._id,
          title: assessment.title,
          type: assessment.type,
          totalAttempts: attempts.length,
          passedAttempts: passed,
          passRate: attempts.length > 0 ? (passed / attempts.length) * 100 : 0,
          averageScore: attempts.length > 0 
            ? attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length 
            : 0,
          averageTimeSpent: attempts.length > 0 ? timeSpent / attempts.length : 0,
          publishedAt: assessment.publishedAt,
          createdAt: assessment.createdAt
        });
      });

      const overallAnalytics = {
        totalAssessments: assessments.length,
        totalAttempts,
        totalPassed,
        overallPassRate: totalAttempts > 0 ? (totalPassed / totalAttempts) * 100 : 0,
        averageTimeSpent: totalAttempts > 0 ? totalTimeSpent / totalAttempts : 0,
        assessmentBreakdown
      };

      res.status(200).json({
        success: true,
        data: {
          analytics: overallAnalytics,
          dateRange: {
            startDate: startDate || null,
            endDate: endDate || null
          }
        }
      });

    } catch (error) {
      console.error('Get course assessment analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve assessment analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * GET /api/v1/assessments/:assessmentId/analytics
 * Get detailed assessment analytics (Instructor/Admin only)
 */
router.get('/:assessmentId/analytics',
  auth,
  [
    param('assessmentId')
      .isMongoId()
      .withMessage('Invalid assessment ID format')
  ],
  (req, res, next) => {
    // Check user role
    if (req.user.role !== 'guru' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only instructors and admins can view detailed assessment analytics'
      });
    }
    next();
  },
  async (req, res) => {
    try {
      const { assessmentId } = req.params;
      
      const Assessment = require('../models/Assessment');
      const User = require('../models/User');
      
      const assessment = await Assessment.findById(assessmentId)
        .select('title type configuration attempts analytics content');

      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: 'Assessment not found'
        });
      }

      const attempts = assessment.attempts || [];
      
      // Get user details for attempts
      const userIds = [...new Set(attempts.map(a => a.userId.toString()))];
      const users = await User.find({ _id: { $in: userIds } })
        .select('profile.firstName profile.lastName profile.email');
      
      const userMap = {};
      users.forEach(user => {
        userMap[user._id.toString()] = {
          name: `${user.profile.firstName} ${user.profile.lastName}`,
          email: user.profile.email
        };
      });

      // Calculate question-level analytics
      const questionAnalytics = [];
      if (assessment.content.questions) {
        assessment.content.questions.forEach(question => {
          const questionAttempts = attempts.filter(attempt => 
            attempt.answers && attempt.answers[question.questionId] !== undefined
          );

          let correctCount = 0;
          const answerDistribution = {};

          questionAttempts.forEach(attempt => {
            const userAnswer = attempt.answers[question.questionId];
            
            // Check if answer is correct (simplified logic)
            let isCorrect = false;
            if (question.questionType === 'single_choice') {
              const correctOption = question.content.options?.find(opt => opt.isCorrect);
              isCorrect = userAnswer === correctOption?.optionId;
            } else if (question.questionType === 'true_false') {
              isCorrect = userAnswer === question.content.correctAnswer;
            }
            
            if (isCorrect) correctCount++;

            // Track answer distribution
            const answerKey = Array.isArray(userAnswer) ? userAnswer.join(',') : userAnswer;
            answerDistribution[answerKey] = (answerDistribution[answerKey] || 0) + 1;
          });

          questionAnalytics.push({
            questionId: question.questionId,
            questionText: question.questionText,
            questionType: question.questionType,
            totalAttempts: questionAttempts.length,
            correctAnswers: correctCount,
            successRate: questionAttempts.length > 0 ? (correctCount / questionAttempts.length) * 100 : 0,
            answerDistribution
          });
        });
      }

      // Student performance breakdown
      const studentPerformance = [];
      const studentAttempts = {};
      
      attempts.forEach(attempt => {
        const userId = attempt.userId.toString();
        if (!studentAttempts[userId]) {
          studentAttempts[userId] = [];
        }
        studentAttempts[userId].push(attempt);
      });

      Object.keys(studentAttempts).forEach(userId => {
        const userAttempts = studentAttempts[userId];
        const bestScore = Math.max(...userAttempts.map(a => a.score || 0));
        const bestPercentage = Math.max(...userAttempts.map(a => a.percentage || 0));
        const totalTimeSpent = userAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
        const hasPassed = userAttempts.some(a => a.passed);

        studentPerformance.push({
          userId,
          userName: userMap[userId]?.name || 'Unknown User',
          userEmail: userMap[userId]?.email || 'Unknown Email',
          attemptCount: userAttempts.length,
          bestScore,
          bestPercentage,
          hasPassed,
          totalTimeSpent,
          averageTimePerAttempt: userAttempts.length > 0 ? totalTimeSpent / userAttempts.length : 0,
          firstAttemptDate: Math.min(...userAttempts.map(a => new Date(a.submittedAt))),
          lastAttemptDate: Math.max(...userAttempts.map(a => new Date(a.submittedAt)))
        });
      });

      const detailedAnalytics = {
        assessmentInfo: {
          title: assessment.title,
          type: assessment.type,
          totalQuestions: assessment.content.questions?.length || 0,
          totalPoints: assessment.configuration.totalPoints,
          passingScore: assessment.configuration.passingScore,
          timeLimit: assessment.configuration.timeLimit
        },
        overallStats: assessment.analytics || {
          totalAttempts: 0,
          averageScore: 0,
          passRate: 0
        },
        questionAnalytics,
        studentPerformance: studentPerformance.sort((a, b) => b.bestScore - a.bestScore)
      };

      res.status(200).json({
        success: true,
        data: detailedAnalytics
      });

    } catch (error) {
      console.error('Get detailed assessment analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve detailed assessment analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

module.exports = router;