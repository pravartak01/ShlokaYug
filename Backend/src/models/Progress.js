const mongoose = require('mongoose');

// Schema to track detailed learning progress
const progressSchema = new mongoose.Schema({
  // Core identification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
    index: true
  },
  enrollmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: [true, 'Enrollment ID is required'],
    index: true
  },
  
  // Course structure progress tracking
  structure: {
    units: [{
      unitId: {
        type: String,
        required: true
      },
      status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'skipped'],
        default: 'not_started'
      },
      completedAt: Date,
      timeSpent: {
        type: Number, // in seconds
        default: 0,
        min: 0
      },
      score: {
        type: Number, // percentage
        min: 0,
        max: 100,
        default: null
      },
      attempts: {
        type: Number,
        default: 0,
        min: 0
      },
      
      lessons: [{
        lessonId: {
          type: String,
          required: true
        },
        status: {
          type: String,
          enum: ['not_started', 'in_progress', 'completed', 'skipped'],
          default: 'not_started'
        },
        completedAt: Date,
        timeSpent: {
          type: Number, // in seconds
          default: 0,
          min: 0
        },
        score: {
          type: Number, // percentage
          min: 0,
          max: 100,
          default: null
        },
        
        lectures: [{
          lectureId: {
            type: String,
            required: true
          },
          status: {
            type: String,
            enum: ['not_started', 'in_progress', 'completed', 'skipped'],
            default: 'not_started'
          },
          startedAt: Date,
          completedAt: Date,
          lastWatchedAt: Date,
          
          // Detailed watch progress
          watchProgress: {
            totalDuration: {
              type: Number, // total video/audio duration in seconds
              default: 0,
              min: 0
            },
            watchedDuration: {
              type: Number, // actual time watched in seconds
              default: 0,
              min: 0
            },
            watchPercentage: {
              type: Number, // percentage of content watched
              min: 0,
              max: 100,
              default: 0
            },
            lastPosition: {
              type: Number, // last playback position in seconds
              default: 0,
              min: 0
            },
            watchSessions: [{
              startedAt: Date,
              endedAt: Date,
              duration: Number, // session duration in seconds
              progressStart: Number, // starting position
              progressEnd: Number // ending position
            }],
            playbackSpeed: {
              type: Number, // playback speed (0.5x, 1x, 1.25x, etc.)
              default: 1.0,
              min: 0.25,
              max: 3.0
            }
          },
          
          // Interaction tracking
          interactions: {
            pauses: {
              type: Number,
              default: 0,
              min: 0
            },
            replays: {
              type: Number,
              default: 0,
              min: 0
            },
            skips: {
              type: Number,
              default: 0,
              min: 0
            },
            notes: [{
              timestamp: Number, // position in video where note was taken
              content: {
                type: String,
                maxlength: [1000, 'Note content cannot exceed 1000 characters']
              },
              createdAt: {
                type: Date,
                default: Date.now
              },
              isPrivate: {
                type: Boolean,
                default: true
              }
            }],
            bookmarks: [{
              timestamp: Number,
              title: {
                type: String,
                maxlength: [100, 'Bookmark title cannot exceed 100 characters']
              },
              createdAt: {
                type: Date,
                default: Date.now
              }
            }]
          },
          
          // Assessment and understanding
          comprehension: {
            selfRating: {
              type: Number, // 1-5 scale
              min: 1,
              max: 5,
              default: null
            },
            difficultyRating: {
              type: Number, // 1-5 scale (how difficult was this?)
              min: 1,
              max: 5,
              default: null
            },
            questionsAsked: {
              type: Number,
              default: 0,
              min: 0
            },
            practiceAttempts: {
              type: Number,
              default: 0,
              min: 0
            }
          }
        }]
      }]
    }]
  },
  
  // Overall course progress statistics
  statistics: {
    completion: {
      overall: {
        type: Number, // overall completion percentage
        min: 0,
        max: 100,
        default: 0
      },
      units: {
        type: Number, // completed units percentage
        min: 0,
        max: 100,
        default: 0
      },
      lessons: {
        type: Number, // completed lessons percentage
        min: 0,
        max: 100,
        default: 0
      },
      lectures: {
        type: Number, // completed lectures percentage
        min: 0,
        max: 100,
        default: 0
      }
    },
    
    time: {
      totalSpent: {
        type: Number, // total time spent in seconds
        default: 0,
        min: 0
      },
      averageSessionDuration: {
        type: Number, // average session length in minutes
        default: 0,
        min: 0
      },
      totalSessions: {
        type: Number,
        default: 0,
        min: 0
      },
      longestSession: {
        type: Number, // longest session in minutes
        default: 0,
        min: 0
      },
      lastActiveDate: {
        type: Date,
        default: Date.now
      }
    },
    
    performance: {
      averageScore: {
        type: Number, // average score across all assessments
        min: 0,
        max: 100,
        default: null
      },
      bestScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null
      },
      totalAssessments: {
        type: Number,
        default: 0,
        min: 0
      },
      passedAssessments: {
        type: Number,
        default: 0,
        min: 0
      },
      averageAttempts: {
        type: Number, // average attempts per assessment
        default: 0,
        min: 0
      }
    },
    
    engagement: {
      streak: {
        current: {
          type: Number, // current daily streak
          default: 0,
          min: 0
        },
        longest: {
          type: Number, // longest streak achieved
          default: 0,
          min: 0
        },
        lastActivity: {
          type: Date,
          default: Date.now
        }
      },
      totalDaysActive: {
        type: Number,
        default: 0,
        min: 0
      },
      weeklyGoal: {
        target: {
          type: Number, // target minutes per week
          default: 120, // 2 hours default
          min: 0
        },
        achieved: {
          type: Number, // minutes achieved this week
          default: 0,
          min: 0
        },
        weekStartDate: {
          type: Date,
          default: () => {
            const now = new Date();
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            weekStart.setHours(0, 0, 0, 0);
            return weekStart;
          }
        }
      }
    }
  },
  
  // Learning milestones and achievements
  milestones: [{
    type: {
      type: String,
      enum: ['first_lesson', 'first_unit', 'halfway_point', 'course_complete', 'perfect_score', 'streak_milestone', 'time_milestone'],
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: [100, 'Milestone title cannot exceed 100 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Milestone description cannot exceed 500 characters']
    },
    achievedAt: {
      type: Date,
      default: Date.now
    },
    value: Number, // associated value (score, days, etc.)
    badge: String, // badge identifier
    points: {
      type: Number, // gamification points earned
      default: 0,
      min: 0
    }
  }],
  
  // Learning preferences and adaptive features
  preferences: {
    preferredPace: {
      type: String,
      enum: ['slow', 'normal', 'fast'],
      default: 'normal'
    },
    preferredSessionLength: {
      type: Number, // preferred session length in minutes
      default: 30,
      min: 5,
      max: 180
    },
    difficultyPreference: {
      type: String,
      enum: ['easier', 'standard', 'challenging'],
      default: 'standard'
    },
    reminderFrequency: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'custom'],
      default: 'daily'
    },
    autoAdvance: {
      type: Boolean,
      default: false
    }
  },
  
  // Course completion and certification
  completion: {
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'certified'],
      default: 'not_started'
    },
    completedAt: Date,
    finalScore: {
      type: Number,
      min: 0,
      max: 100
    },
    certificateIssued: {
      type: Boolean,
      default: false
    },
    certificateId: String,
    certificateIssuedAt: Date,
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: {
        type: String,
        maxlength: [1000, 'Review cannot exceed 1000 characters']
      },
      wouldRecommend: {
        type: Boolean
      },
      submittedAt: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
progressSchema.index({ enrollmentId: 1 });
progressSchema.index({ 'completion.status': 1 });
progressSchema.index({ 'statistics.time.lastActiveDate': -1 });
progressSchema.index({ createdAt: -1 });

// Virtual for formatted completion percentage
progressSchema.virtual('completionPercentage').get(function() {
  return Math.round(this.statistics.completion.overall * 10) / 10;
});

// Virtual for time spent in hours
progressSchema.virtual('timeSpentHours').get(function() {
  return Math.round(this.statistics.time.totalSpent / 3600 * 10) / 10;
});

// Virtual for current streak status
progressSchema.virtual('isStreakActive').get(function() {
  if (!this.statistics.engagement.streak.lastActivity) return false;
  
  const lastActivity = new Date(this.statistics.engagement.streak.lastActivity);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(23, 59, 59, 999);
  
  return lastActivity >= yesterday;
});

// Method to start a lecture
progressSchema.methods.startLecture = function(unitId, lessonId, lectureId) {
  const unit = this.structure.units.find(u => u.unitId === unitId);
  if (!unit) throw new Error('Unit not found');
  
  const lesson = unit.lessons.find(l => l.lessonId === lessonId);
  if (!lesson) throw new Error('Lesson not found');
  
  const lecture = lesson.lectures.find(l => l.lectureId === lectureId);
  if (!lecture) {
    // Create new lecture progress
    lesson.lectures.push({
      lectureId,
      status: 'in_progress',
      startedAt: new Date(),
      lastWatchedAt: new Date()
    });
  } else {
    lecture.status = 'in_progress';
    lecture.lastWatchedAt = new Date();
  }
  
  // Update lesson and unit status
  if (lesson.status === 'not_started') lesson.status = 'in_progress';
  if (unit.status === 'not_started') unit.status = 'in_progress';
  
  return this.save();
};

// Method to update watch progress
progressSchema.methods.updateWatchProgress = function(unitId, lessonId, lectureId, watchData) {
  const unit = this.structure.units.find(u => u.unitId === unitId);
  if (!unit) throw new Error('Unit not found');
  
  const lesson = unit.lessons.find(l => l.lessonId === lessonId);
  if (!lesson) throw new Error('Lesson not found');
  
  const lecture = lesson.lectures.find(l => l.lectureId === lectureId);
  if (!lecture) throw new Error('Lecture not found');
  
  // Update watch progress
  if (watchData.totalDuration) lecture.watchProgress.totalDuration = watchData.totalDuration;
  if (watchData.watchedDuration) lecture.watchProgress.watchedDuration = watchData.watchedDuration;
  if (watchData.lastPosition) lecture.watchProgress.lastPosition = watchData.lastPosition;
  
  // Calculate watch percentage
  if (lecture.watchProgress.totalDuration > 0) {
    lecture.watchProgress.watchPercentage = Math.min(100, 
      (lecture.watchProgress.watchedDuration / lecture.watchProgress.totalDuration) * 100
    );
  }
  
  // Update last watched time
  lecture.lastWatchedAt = new Date();
  
  // Add watch session if provided
  if (watchData.sessionStart && watchData.sessionEnd) {
    lecture.watchProgress.watchSessions.push({
      startedAt: watchData.sessionStart,
      endedAt: watchData.sessionEnd,
      duration: (watchData.sessionEnd - watchData.sessionStart) / 1000,
      progressStart: watchData.progressStart || 0,
      progressEnd: watchData.progressEnd || 0
    });
  }
  
  this.statistics.time.lastActiveDate = new Date();
  return this.save();
};

// Method to complete a lecture
progressSchema.methods.completeLecture = function(unitId, lessonId, lectureId) {
  const unit = this.structure.units.find(u => u.unitId === unitId);
  if (!unit) throw new Error('Unit not found');
  
  const lesson = unit.lessons.find(l => l.lessonId === lessonId);
  if (!lesson) throw new Error('Lesson not found');
  
  const lecture = lesson.lectures.find(l => l.lectureId === lectureId);
  if (!lecture) throw new Error('Lecture not found');
  
  lecture.status = 'completed';
  lecture.completedAt = new Date();
  
  // Check if lesson is complete
  const allLecturesComplete = lesson.lectures.every(l => l.status === 'completed');
  if (allLecturesComplete) {
    lesson.status = 'completed';
    lesson.completedAt = new Date();
    
    // Check if unit is complete
    const allLessonsComplete = unit.lessons.every(l => l.status === 'completed');
    if (allLessonsComplete) {
      unit.status = 'completed';
      unit.completedAt = new Date();
    }
  }
  
  return this.updateStatistics();
};

// Method to update overall statistics
progressSchema.methods.updateStatistics = function() {
  // Calculate completion percentages
  const totalUnits = this.structure.units.length;
  const completedUnits = this.structure.units.filter(u => u.status === 'completed').length;
  
  let totalLessons = 0;
  let completedLessons = 0;
  let totalLectures = 0;
  let completedLectures = 0;
  
  this.structure.units.forEach(unit => {
    totalLessons += unit.lessons.length;
    completedLessons += unit.lessons.filter(l => l.status === 'completed').length;
    
    unit.lessons.forEach(lesson => {
      totalLectures += lesson.lectures.length;
      completedLectures += lesson.lectures.filter(l => l.status === 'completed').length;
    });
  });
  
  this.statistics.completion.units = totalUnits > 0 ? (completedUnits / totalUnits) * 100 : 0;
  this.statistics.completion.lessons = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  this.statistics.completion.lectures = totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;
  this.statistics.completion.overall = this.statistics.completion.lectures; // Use lecture completion for overall
  
  // Update completion status
  if (this.statistics.completion.overall === 100) {
    this.completion.status = 'completed';
    this.completion.completedAt = new Date();
  }
  
  return this.save();
};

// Method to add milestone
progressSchema.methods.addMilestone = function(type, title, description, value, points = 0) {
  this.milestones.push({
    type,
    title,
    description,
    value,
    points,
    achievedAt: new Date()
  });
  
  return this.save();
};

// Method to update learning streak
progressSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const lastActivity = this.statistics.engagement.streak.lastActivity;
  
  if (!lastActivity) {
    // First activity
    this.statistics.engagement.streak.current = 1;
    this.statistics.engagement.streak.lastActivity = today;
  } else {
    const lastActivityDate = new Date(lastActivity);
    const daysDiff = Math.floor((today - lastActivityDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      this.statistics.engagement.streak.current += 1;
      this.statistics.engagement.streak.lastActivity = today;
      
      if (this.statistics.engagement.streak.current > this.statistics.engagement.streak.longest) {
        this.statistics.engagement.streak.longest = this.statistics.engagement.streak.current;
      }
    } else if (daysDiff > 1) {
      // Streak broken
      this.statistics.engagement.streak.current = 1;
      this.statistics.engagement.streak.lastActivity = today;
    }
    // daysDiff === 0 means same day, no change needed
  }
  
  return this.save();
};

// Static method to get user progress summary
progressSchema.statics.getUserProgressSummary = function(userId) {
  return this.find({ userId })
    .select('courseId statistics.completion.overall statistics.time.totalSpent completion.status')
    .populate('courseId', 'title instructor.name')
    .sort({ 'statistics.time.lastActiveDate': -1 });
};

// Static method to get course analytics
progressSchema.statics.getCourseAnalytics = function(courseId) {
  return this.aggregate([
    { $match: { courseId: mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        averageCompletion: { $avg: '$statistics.completion.overall' },
        averageTimeSpent: { $avg: '$statistics.time.totalSpent' },
        completedStudents: {
          $sum: {
            $cond: [{ $eq: ['$completion.status', 'completed'] }, 1, 0]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Progress', progressSchema);