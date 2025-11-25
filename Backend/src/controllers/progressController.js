/**
 * Progress Controller - Learning Progress Tracking System
 * Handles watch time tracking, completion calculations, and learning analytics
 */

const Progress = require('../models/Progress');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const { validationResult } = require('express-validator');

/**
 * Update Learning Progress
 * POST /api/v1/progress/update
 */
exports.updateLearningProgress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const {
      courseId,
      unitId,
      lessonId,
      lectureId,
      action,
      watchTime,
      totalDuration,
      currentPosition,
      notes,
      sessionData
    } = req.body;

    // Verify user has access to this course
    const enrollment = await Enrollment.findOne({
      userId,
      courseId,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this course'
      });
    }

    // Find or create progress record
    let progress = await Progress.findOne({ userId, courseId });
    if (!progress) {
      progress = new Progress({
        userId,
        courseId,
        enrollmentId: enrollment._id,
        progress: {
          units: [],
          overall: 0
        },
        analytics: {
          totalTimeSpent: 0,
          sessionsCount: 0,
          averageSessionDuration: 0,
          lastActivity: new Date()
        }
      });
    }

    // Update watch progress for specific lecture
    const progressUpdateResult = await progress.updateWatchProgress(
      unitId,
      lessonId,
      lectureId,
      {
        totalDuration: totalDuration || 0,
        watchedDuration: watchTime || 0,
        lastPosition: currentPosition || 0,
        sessionStart: sessionData?.sessionStart || new Date(),
        sessionEnd: sessionData?.sessionEnd || new Date(),
        completed: action === 'complete'
      }
    );

    // Add notes if provided
    if (notes) {
      progress.interactions.push({
        type: 'note',
        lectureId,
        content: notes,
        timestamp: new Date()
      });
    }

    // Update overall statistics
    await progress.updateStatistics();

    // Get course details for response
    const course = await Course.findById(courseId).select('title structure');
    
    // Calculate next recommended lecture
    const nextLecture = await findNextLecture(progress, course);

    await progress.save();

    // Determine if any achievements were unlocked
    const newAchievements = await checkForAchievements(progress);

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        lectureProgress: progressUpdateResult.lectureProgress,
        lessonProgress: progressUpdateResult.lessonProgress,
        unitProgress: progressUpdateResult.unitProgress,
        overallProgress: progress.statistics.completion.overall,
        nextToWatch: nextLecture,
        timeSpent: progress.analytics.totalTimeSpent,
        newAchievements: newAchievements || []
      }
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update learning progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get Learning Progress for Course
 * GET /api/v1/progress/course/:courseId
 */
exports.getCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    // Verify access
    const enrollment = await Enrollment.findOne({
      userId,
      courseId,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this course'
      });
    }

    // Get progress data
    const progress = await Progress.findOne({ userId, courseId })
      .populate('courseId', 'title structure');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'No progress found for this course'
      });
    }

    // Get detailed progress breakdown
    const progressBreakdown = await getDetailedProgressBreakdown(progress);

    // Get recent activity
    const recentActivity = await getRecentActivity(progress, 10);

    // Get achievements
    const achievements = progress.achievements || [];

    res.status(200).json({
      success: true,
      data: {
        overall: progress.statistics.completion.overall,
        byUnit: progressBreakdown.units,
        byLesson: progressBreakdown.lessons,
        recentActivity,
        achievements,
        analytics: {
          totalTimeSpent: progress.analytics.totalTimeSpent,
          averageSessionDuration: progress.analytics.averageSessionDuration,
          sessionsCount: progress.analytics.sessionsCount,
          currentStreak: progress.analytics.streaks?.current || 0,
          longestStreak: progress.analytics.streaks?.longest || 0,
          lastActivity: progress.analytics.lastActivity
        }
      }
    });

  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get Progress Analytics Dashboard
 * GET /api/v1/progress/analytics
 */
exports.getProgressAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeframe = '30d' } = req.query;

    // Get all user's progress records
    const progressRecords = await Progress.find({ userId })
      .populate('courseId', 'title instructor category');

    if (!progressRecords.length) {
      return res.status(200).json({
        success: true,
        data: {
          summary: {
            totalCourses: 0,
            completedCourses: 0,
            totalTimeSpent: 0,
            averageProgress: 0
          },
          courses: [],
          trends: []
        }
      });
    }

    // Calculate summary statistics
    const summary = calculateProgressSummary(progressRecords);

    // Get learning trends based on timeframe
    const trends = await getLearningTrends(userId, timeframe);

    // Format course progress data
    const coursesData = progressRecords.map(progress => ({
      courseId: progress.courseId._id,
      courseTitle: progress.courseId.title,
      instructor: progress.courseId.instructor?.name,
      category: progress.courseId.category,
      progress: progress.statistics.completion.overall,
      timeSpent: progress.analytics.totalTimeSpent,
      lastActivity: progress.analytics.lastActivity,
      status: progress.statistics.completion.overall >= 100 ? 'completed' : 'in-progress'
    }));

    res.status(200).json({
      success: true,
      data: {
        summary,
        courses: coursesData,
        trends,
        achievements: await getUserAchievements(userId)
      }
    });

  } catch (error) {
    console.error('Get progress analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve progress analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Mark Lecture as Complete
 * PATCH /api/v1/progress/lecture/:lectureId/complete
 */
exports.markLectureComplete = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lectureId } = req.params;
    const { courseId, unitId, lessonId, notes } = req.body;

    // Find progress record
    const progress = await Progress.findOne({ userId, courseId });
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress record not found'
      });
    }

    // Mark lecture as completed
    const result = await progress.markLectureComplete(unitId, lessonId, lectureId);

    // Add completion note if provided
    if (notes) {
      progress.interactions.push({
        type: 'completion_note',
        lectureId,
        content: notes,
        timestamp: new Date()
      });
    }

    // Update statistics
    await progress.updateStatistics();
    await progress.save();

    // Check for new achievements
    const newAchievements = await checkForAchievements(progress);

    res.status(200).json({
      success: true,
      message: 'Lecture marked as complete',
      data: {
        lectureProgress: 100,
        lessonProgress: result.lessonProgress,
        unitProgress: result.unitProgress,
        overallProgress: progress.statistics.completion.overall,
        newAchievements: newAchievements || []
      }
    });

  } catch (error) {
    console.error('Mark lecture complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark lecture as complete',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create Bookmark
 * POST /api/v1/progress/bookmark
 */
exports.createBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, lectureId, timestamp, note } = req.body;

    const progress = await Progress.findOne({ userId, courseId });
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress record not found'
      });
    }

    // Add bookmark
    progress.bookmarks.push({
      lectureId,
      timestamp,
      note: note || '',
      createdAt: new Date()
    });

    await progress.save();

    res.status(201).json({
      success: true,
      message: 'Bookmark created successfully',
      data: {
        bookmarkId: progress.bookmarks[progress.bookmarks.length - 1]._id,
        timestamp,
        note: note || '',
        createdAt: new Date()
      }
    });

  } catch (error) {
    console.error('Create bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bookmark',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get User Bookmarks
 * GET /api/v1/progress/bookmarks/:courseId
 */
exports.getBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const progress = await Progress.findOne({ userId, courseId })
      .populate('courseId', 'title structure');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress record not found'
      });
    }

    // Format bookmarks with lecture details
    const formattedBookmarks = await Promise.all(
      progress.bookmarks.map(async bookmark => {
        const lectureDetails = await getLectureDetails(courseId, bookmark.lectureId);
        return {
          id: bookmark._id,
          lectureId: bookmark.lectureId,
          lectureTitle: lectureDetails?.title || 'Unknown Lecture',
          timestamp: bookmark.timestamp,
          note: bookmark.note,
          createdAt: bookmark.createdAt
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        bookmarks: formattedBookmarks
      }
    });

  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookmarks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper Functions

/**
 * Find next lecture to watch
 */
async function findNextLecture(progress, course) {
  try {
    // Logic to find the next incomplete lecture
    for (const unit of course.structure?.units || []) {
      for (const lesson of unit.lessons || []) {
        for (const lecture of lesson.lectures || []) {
          const lectureProgress = progress.progress.units
            ?.find(u => u.unitId === unit._id)
            ?.lessons?.find(l => l.lessonId === lesson._id)
            ?.lectures?.find(l => l.lectureId === lecture._id);
          
          if (!lectureProgress || !lectureProgress.completed) {
            return {
              lectureId: lecture._id,
              lectureTitle: lecture.title,
              unitTitle: unit.title,
              lessonTitle: lesson.title
            };
          }
        }
      }
    }
    
    return null; // Course completed
  } catch (error) {
    console.error('Find next lecture error:', error);
    return null;
  }
}

/**
 * Check for new achievements
 */
async function checkForAchievements(progress) {
  const newAchievements = [];
  
  try {
    // First course completion
    if (progress.statistics.completion.overall >= 100) {
      const hasFirstCompletion = progress.achievements?.some(a => a.type === 'first_completion');
      if (!hasFirstCompletion) {
        const achievement = {
          type: 'first_completion',
          title: 'Course Champion',
          description: 'Completed your first course!',
          earnedAt: new Date(),
          icon: '🏆'
        };
        progress.achievements = progress.achievements || [];
        progress.achievements.push(achievement);
        newAchievements.push(achievement);
      }
    }

    // Study streak achievements
    const currentStreak = progress.analytics.streaks?.current || 0;
    if (currentStreak >= 7) {
      const hasWeekStreak = progress.achievements?.some(a => a.type === 'week_streak');
      if (!hasWeekStreak) {
        const achievement = {
          type: 'week_streak',
          title: 'Weekly Warrior',
          description: 'Maintained a 7-day learning streak!',
          earnedAt: new Date(),
          icon: '🔥'
        };
        progress.achievements = progress.achievements || [];
        progress.achievements.push(achievement);
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  } catch (error) {
    console.error('Check achievements error:', error);
    return [];
  }
}

/**
 * Calculate progress summary
 */
function calculateProgressSummary(progressRecords) {
  const totalCourses = progressRecords.length;
  const completedCourses = progressRecords.filter(p => p.statistics.completion.overall >= 100).length;
  const totalTimeSpent = progressRecords.reduce((sum, p) => sum + (p.analytics.totalTimeSpent || 0), 0);
  const averageProgress = progressRecords.reduce((sum, p) => sum + p.statistics.completion.overall, 0) / totalCourses;

  return {
    totalCourses,
    completedCourses,
    totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
    averageProgress: Math.round(averageProgress * 10) / 10
  };
}

/**
 * Get detailed progress breakdown
 */
async function getDetailedProgressBreakdown(progress) {
  try {
    const course = await Course.findById(progress.courseId);
    const units = [];
    const lessons = [];

    for (const unit of course.structure?.units || []) {
      const unitProgress = progress.progress.units?.find(u => u.unitId.toString() === unit._id.toString());
      let unitCompletion = 0;
      let unitLessons = 0;
      let completedLessons = 0;

      for (const lesson of unit.lessons || []) {
        unitLessons++;
        const lessonProgress = unitProgress?.lessons?.find(l => l.lessonId.toString() === lesson._id.toString());
        const lessonCompletion = calculateLessonCompletion(lessonProgress, lesson);
        
        if (lessonCompletion >= 100) {
          completedLessons++;
        }

        lessons.push({
          lessonId: lesson._id,
          lessonTitle: lesson.title,
          unitId: unit._id,
          unitTitle: unit.title,
          progress: Math.round(lessonCompletion),
          completedLectures: lessonProgress?.lectures?.filter(l => l.completed).length || 0,
          totalLectures: lesson.lectures?.length || 0
        });
      }

      unitCompletion = unitLessons > 0 ? (completedLessons / unitLessons) * 100 : 0;

      units.push({
        unitId: unit._id,
        unitTitle: unit.title,
        progress: Math.round(unitCompletion),
        completedLessons,
        totalLessons: unitLessons
      });
    }

    return { units, lessons };
  } catch (error) {
    console.error('Get detailed progress breakdown error:', error);
    return { units: [], lessons: [] };
  }
}

/**
 * Calculate lesson completion percentage
 */
function calculateLessonCompletion(lessonProgress, lesson) {
  if (!lessonProgress || !lesson.lectures) return 0;
  
  const totalLectures = lesson.lectures.length;
  const completedLectures = lessonProgress.lectures?.filter(l => l.completed).length || 0;
  
  return totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;
}

/**
 * Get recent activity
 */
async function getRecentActivity(progress, limit = 10) {
  try {
    // Get recent interactions and progress updates
    const recentInteractions = progress.interactions
      ?.slice(-limit)
      ?.reverse()
      ?.map(interaction => ({
        type: interaction.type,
        lectureId: interaction.lectureId,
        content: interaction.content,
        timestamp: interaction.timestamp
      })) || [];

    return recentInteractions;
  } catch (error) {
    console.error('Get recent activity error:', error);
    return [];
  }
}

/**
 * Get learning trends
 */
async function getLearningTrends(userId, timeframe) {
  try {
    // This would typically involve more complex aggregation
    // For now, return basic trend data structure
    return {
      timeframe,
      dailyProgress: [], // Array of daily progress data
      weeklyTimeSpent: [], // Array of weekly time spent
      completionRate: 0 // Overall completion trend
    };
  } catch (error) {
    console.error('Get learning trends error:', error);
    return {};
  }
}

/**
 * Get user achievements
 */
async function getUserAchievements(userId) {
  try {
    const progressRecords = await Progress.find({ userId });
    const allAchievements = [];
    
    progressRecords.forEach(progress => {
      if (progress.achievements) {
        allAchievements.push(...progress.achievements);
      }
    });

    return allAchievements;
  } catch (error) {
    console.error('Get user achievements error:', error);
    return [];
  }
}

/**
 * Get lecture details
 */
async function getLectureDetails(courseId, lectureId) {
  try {
    const course = await Course.findById(courseId);
    
    for (const unit of course.structure?.units || []) {
      for (const lesson of unit.lessons || []) {
        const lecture = lesson.lectures?.find(l => l._id.toString() === lectureId.toString());
        if (lecture) {
          return {
            title: lecture.title,
            unitTitle: unit.title,
            lessonTitle: lesson.title
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Get lecture details error:', error);
    return null;
  }
}