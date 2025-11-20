const mongoose = require('mongoose');

// Schema for assessments, quizzes, and assignments
const assessmentSchema = new mongoose.Schema({
  // Basic assessment information
  title: {
    type: String,
    required: [true, 'Assessment title is required'],
    trim: true,
    maxlength: [200, 'Assessment title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Assessment description cannot exceed 1000 characters']
  },
  
  // Assessment type and context
  type: {
    type: String,
    required: [true, 'Assessment type is required'],
    enum: ['quiz', 'assignment', 'pronunciation_test', 'recitation_test', 'comprehension_test', 'practice_exercise'],
    index: true
  },
  
  // Course and content association
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required'],
    index: true
  },
  
  // Placement in course structure
  placement: {
    unitId: String, // Optional: specific unit
    lessonId: String, // Optional: specific lesson
    lectureId: String, // Optional: specific lecture
    position: {
      type: String,
      enum: ['before_content', 'after_content', 'standalone', 'mixed_throughout'],
      default: 'after_content'
    },
    isOptional: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  
  // Assessment configuration
  configuration: {
    // Timing and attempts
    timeLimit: {
      type: Number, // in minutes, null for unlimited
      min: [1, 'Time limit must be at least 1 minute'],
      default: null
    },
    maxAttempts: {
      type: Number,
      min: [1, 'Must allow at least 1 attempt'],
      default: 3
    },
    attemptCooldown: {
      type: Number, // minutes between attempts
      min: [0, 'Cooldown cannot be negative'],
      default: 0
    },
    
    // Scoring and grading
    totalPoints: {
      type: Number,
      required: [true, 'Total points is required'],
      min: [1, 'Total points must be at least 1']
    },
    passingScore: {
      type: Number, // minimum points to pass
      required: [true, 'Passing score is required'],
      min: [0, 'Passing score cannot be negative']
    },
    passingPercentage: {
      type: Number, // calculated from passingScore/totalPoints
      min: [0, 'Passing percentage cannot be negative'],
      max: [100, 'Passing percentage cannot exceed 100']
    },
    
    // Feedback and review settings
    showCorrectAnswers: {
      type: Boolean,
      default: true
    },
    showScoreImmediately: {
      type: Boolean,
      default: true
    },
    allowReviewAfterCompletion: {
      type: Boolean,
      default: true
    },
    
    // Randomization
    randomizeQuestions: {
      type: Boolean,
      default: false
    },
    randomizeAnswers: {
      type: Boolean,
      default: false
    },
    questionsPerAttempt: {
      type: Number, // if fewer than total questions
      min: [1, 'Must show at least 1 question'],
      default: null // null means show all questions
    }
  },
  
  // Assessment content and questions
  content: {
    instructions: {
      type: String,
      trim: true,
      maxlength: [2000, 'Instructions cannot exceed 2000 characters']
    },
    
    // Sanskrit-specific context
    shlokaContext: [{
      shlokaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shloka'
      },
      audioUrl: String, // Reference audio for pronunciation tests
      purpose: {
        type: String,
        enum: ['reference', 'test_subject', 'comparison'],
        default: 'reference'
      }
    }],
    
    // Question bank
    questions: [{
      questionId: {
        type: String,
        required: [true, 'Question ID is required']
      },
      
      // Question content
      questionText: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true,
        maxlength: [1000, 'Question text cannot exceed 1000 characters']
      },
      questionType: {
        type: String,
        required: [true, 'Question type is required'],
        enum: [
          'multiple_choice', 'single_choice', 'true_false', 
          'fill_blank', 'short_answer', 'essay', 
          'audio_recording', 'pronunciation_check',
          'matching', 'ordering', 'drag_drop'
        ]
      },
      
      // Points and difficulty
      points: {
        type: Number,
        required: [true, 'Question points is required'],
        min: [0, 'Question points cannot be negative'],
        default: 1
      },
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
      },
      
      // Question-specific content
      content: {
        // For multiple choice, single choice
        options: [{
          optionId: String,
          text: {
            type: String,
            maxlength: [500, 'Option text cannot exceed 500 characters']
          },
          isCorrect: {
            type: Boolean,
            default: false
          },
          explanation: {
            type: String,
            maxlength: [500, 'Option explanation cannot exceed 500 characters']
          }
        }],
        
        // For fill in the blanks
        blanks: [{
          position: Number, // position in text where blank appears
          correctAnswers: [String], // multiple acceptable answers
          caseSensitive: {
            type: Boolean,
            default: false
          },
          exactMatch: {
            type: Boolean,
            default: false
          }
        }],
        
        // For short answer and essay
        sampleAnswer: String,
        answerKeywords: [String], // keywords that should appear in answer
        
        // For audio/pronunciation
        expectedPronunciation: String, // phonetic representation
        audioPrompt: String, // audio file URL for listening questions
        recordingDuration: {
          type: Number, // maximum recording time in seconds
          min: [1, 'Recording duration must be at least 1 second'],
          default: 60
        },
        
        // For matching questions
        leftItems: [{
          id: String,
          content: String
        }],
        rightItems: [{
          id: String,
          content: String
        }],
        correctMatches: [{
          leftId: String,
          rightId: String
        }],
        
        // For ordering questions
        items: [{
          id: String,
          content: String,
          correctOrder: Number
        }],
        
        // Media attachments
        images: [String], // image URLs
        audioFiles: [String], // audio URLs
        videoFiles: [String], // video URLs
        
        // Additional context
        hint: {
          type: String,
          maxlength: [300, 'Hint cannot exceed 300 characters']
        },
        explanation: {
          type: String,
          maxlength: [1000, 'Explanation cannot exceed 1000 characters']
        },
        
        // Sanskrit-specific features
        sanskritText: String, // Devanagari text
        transliteration: String, // IAST transliteration
        translation: String, // English translation
        grammaticalNotes: String // grammatical analysis
      },
      
      // Question metadata
      tags: [String],
      learningObjectives: [String],
      prerequisites: [String],
      
      // Question analytics
      analytics: {
        timesAsked: {
          type: Number,
          default: 0,
          min: 0
        },
        correctAnswers: {
          type: Number,
          default: 0,
          min: 0
        },
        averageTimeSpent: {
          type: Number, // in seconds
          default: 0,
          min: 0
        },
        difficultyRating: {
          type: Number, // calculated from student performance
          min: 0,
          max: 5,
          default: 2.5
        }
      }
    }],
    
    // Assessment resources
    resources: [{
      title: String,
      type: {
        type: String,
        enum: ['reference', 'study_material', 'practice', 'example']
      },
      url: String,
      description: String
    }]
  },
  
  // Assessment availability and scheduling
  availability: {
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    
    // Date-based availability
    availableFrom: {
      type: Date,
      default: Date.now
    },
    availableUntil: Date,
    
    // Progress-based availability
    prerequisites: {
      requiredLectures: [String], // lecture IDs that must be completed
      requiredAssessments: [String], // assessment IDs that must be passed
      minimumCourseProgress: {
        type: Number, // percentage of course that must be completed
        min: 0,
        max: 100,
        default: 0
      }
    },
    
    // Access restrictions
    accessControl: {
      allowedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      blockedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      requiresProctoring: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Assessment statistics and analytics
  statistics: {
    // Participation stats
    totalAttempts: {
      type: Number,
      default: 0,
      min: 0
    },
    uniqueParticipants: {
      type: Number,
      default: 0,
      min: 0
    },
    completionRate: {
      type: Number, // percentage of started assessments that were completed
      min: 0,
      max: 100,
      default: 0
    },
    
    // Performance stats
    averageScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    highestScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    lowestScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    passRate: {
      type: Number, // percentage of participants who passed
      min: 0,
      max: 100,
      default: 0
    },
    
    // Time analytics
    averageTimeSpent: {
      type: Number, // average time in minutes
      min: 0,
      default: 0
    },
    medianTimeSpent: {
      type: Number,
      min: 0,
      default: 0
    },
    
    // Question analytics
    mostDifficultQuestion: String, // question ID
    easiestQuestion: String, // question ID
    mostSkippedQuestion: String, // question ID
    
    // Last updated
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
assessmentSchema.index({ courseId: 1, type: 1 });
assessmentSchema.index({ createdBy: 1 });
assessmentSchema.index({ 'availability.isActive': 1 });
assessmentSchema.index({ 'placement.unitId': 1 });
assessmentSchema.index({ 'placement.lessonId': 1 });
assessmentSchema.index({ type: 1, 'availability.isActive': 1 });
assessmentSchema.index({ createdAt: -1 });

// Text search index
assessmentSchema.index({
  title: 'text',
  description: 'text',
  'content.questions.questionText': 'text'
}, {
  weights: {
    title: 10,
    description: 5,
    'content.questions.questionText': 3
  }
});

// Virtual for passing score percentage
assessmentSchema.virtual('passingScorePercentage').get(function() {
  if (!this.configuration.totalPoints || this.configuration.totalPoints === 0) return 0;
  return Math.round((this.configuration.passingScore / this.configuration.totalPoints) * 100);
});

// Virtual for question count
assessmentSchema.virtual('questionCount').get(function() {
  return this.content.questions.length;
});

// Virtual for estimated duration (based on question types and count)
assessmentSchema.virtual('estimatedDuration').get(function() {
  const baseTimePerQuestion = {
    'multiple_choice': 1.5,
    'single_choice': 1.0,
    'true_false': 0.5,
    'fill_blank': 2.0,
    'short_answer': 3.0,
    'essay': 10.0,
    'audio_recording': 2.0,
    'pronunciation_check': 1.5,
    'matching': 2.5,
    'ordering': 2.0,
    'drag_drop': 2.0
  };
  
  let totalEstimatedMinutes = 0;
  
  this.content.questions.forEach(question => {
    const baseTime = baseTimePerQuestion[question.questionType] || 2.0;
    const difficultyMultiplier = question.difficulty === 'easy' ? 0.8 : 
                                 question.difficulty === 'hard' ? 1.5 : 1.0;
    totalEstimatedMinutes += baseTime * difficultyMultiplier;
  });
  
  return Math.ceil(totalEstimatedMinutes);
});

// Method to calculate passing score percentage
assessmentSchema.methods.calculatePassingPercentage = function() {
  if (this.configuration.totalPoints > 0) {
    this.configuration.passingPercentage = Math.round(
      (this.configuration.passingScore / this.configuration.totalPoints) * 100
    );
  }
  return this.save();
};

// Method to add a question
assessmentSchema.methods.addQuestion = function(questionData) {
  const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newQuestion = {
    questionId,
    ...questionData,
    analytics: {
      timesAsked: 0,
      correctAnswers: 0,
      averageTimeSpent: 0,
      difficultyRating: 2.5
    }
  };
  
  this.content.questions.push(newQuestion);
  
  // Recalculate total points
  this.configuration.totalPoints = this.content.questions.reduce((sum, q) => sum + q.points, 0);
  
  return this.save();
};

// Method to remove a question
assessmentSchema.methods.removeQuestion = function(questionId) {
  const questionIndex = this.content.questions.findIndex(q => q.questionId === questionId);
  
  if (questionIndex === -1) {
    throw new Error('Question not found');
  }
  
  this.content.questions.splice(questionIndex, 1);
  
  // Recalculate total points
  this.configuration.totalPoints = this.content.questions.reduce((sum, q) => sum + q.points, 0);
  
  return this.save();
};

// Method to get random questions (for randomized assessments)
assessmentSchema.methods.getRandomQuestions = function(count) {
  const questionsToShow = count || this.configuration.questionsPerAttempt || this.content.questions.length;
  
  if (questionsToShow >= this.content.questions.length) {
    return this.configuration.randomizeQuestions ? 
      this.shuffleArray([...this.content.questions]) : 
      this.content.questions;
  }
  
  // Get random subset
  const shuffled = this.shuffleArray([...this.content.questions]);
  return shuffled.slice(0, questionsToShow);
};

// Helper method to shuffle array
assessmentSchema.methods.shuffleArray = function(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Method to check if user can access assessment
assessmentSchema.methods.canUserAccess = function(userId, userProgress) {
  // Check if assessment is active
  if (!this.availability.isActive) return false;
  
  // Check date availability
  const now = new Date();
  if (this.availability.availableFrom && now < this.availability.availableFrom) return false;
  if (this.availability.availableUntil && now > this.availability.availableUntil) return false;
  
  // Check user-specific access
  const accessControl = this.availability.accessControl;
  if (accessControl.blockedUsers.includes(userId)) return false;
  if (accessControl.allowedUsers.length > 0 && !accessControl.allowedUsers.includes(userId)) return false;
  
  // Check prerequisites
  const prereqs = this.availability.prerequisites;
  
  if (prereqs.minimumCourseProgress > 0) {
    const userCourseProgress = userProgress?.statistics?.completion?.overall || 0;
    if (userCourseProgress < prereqs.minimumCourseProgress) return false;
  }
  
  // Check required lectures (would need user progress data)
  // This would be implemented based on the Progress model structure
  
  return true;
};

// Method to update question analytics
assessmentSchema.methods.updateQuestionAnalytics = function(questionId, isCorrect, timeSpent) {
  const question = this.content.questions.find(q => q.questionId === questionId);
  if (!question) return;
  
  question.analytics.timesAsked += 1;
  if (isCorrect) {
    question.analytics.correctAnswers += 1;
  }
  
  // Update average time spent (using moving average)
  const currentAvg = question.analytics.averageTimeSpent;
  const timesAsked = question.analytics.timesAsked;
  question.analytics.averageTimeSpent = 
    ((currentAvg * (timesAsked - 1)) + timeSpent) / timesAsked;
  
  // Update difficulty rating based on success rate
  const successRate = question.analytics.correctAnswers / question.analytics.timesAsked;
  question.analytics.difficultyRating = 5 - (successRate * 4); // Invert: low success = high difficulty
  
  return this.save();
};

// Method to update assessment statistics
assessmentSchema.methods.updateStatistics = function(attemptData) {
  this.statistics.totalAttempts += 1;
  this.statistics.lastUpdated = new Date();
  
  // Update score statistics
  if (attemptData.score !== undefined) {
    const currentAvg = this.statistics.averageScore || 0;
    const totalAttempts = this.statistics.totalAttempts;
    
    this.statistics.averageScore = 
      ((currentAvg * (totalAttempts - 1)) + attemptData.score) / totalAttempts;
    
    if (!this.statistics.highestScore || attemptData.score > this.statistics.highestScore) {
      this.statistics.highestScore = attemptData.score;
    }
    
    if (!this.statistics.lowestScore || attemptData.score < this.statistics.lowestScore) {
      this.statistics.lowestScore = attemptData.score;
    }
  }
  
  // Update time statistics
  if (attemptData.timeSpent) {
    const currentAvgTime = this.statistics.averageTimeSpent || 0;
    const totalAttempts = this.statistics.totalAttempts;
    
    this.statistics.averageTimeSpent = 
      ((currentAvgTime * (totalAttempts - 1)) + attemptData.timeSpent) / totalAttempts;
  }
  
  // Update completion rate
  if (attemptData.completed) {
    // This would need to track started vs completed attempts
    // Implementation depends on how attempts are tracked
  }
  
  return this.save();
};

// Static method to find assessments by course
assessmentSchema.statics.findByCourse = function(courseId, options = {}) {
  const query = { courseId };
  
  if (options.type) query.type = options.type;
  if (options.activeOnly) query['availability.isActive'] = true;
  if (options.unitId) query['placement.unitId'] = options.unitId;
  if (options.lessonId) query['placement.lessonId'] = options.lessonId;
  
  return this.find(query)
    .select(options.select || '')
    .sort(options.sort || { 'placement.order': 1, createdAt: 1 })
    .limit(options.limit || 0);
};

// Static method to get assessment analytics
assessmentSchema.statics.getAssessmentAnalytics = function(assessmentIds) {
  return this.aggregate([
    { $match: { _id: { $in: assessmentIds } } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgScore: { $avg: '$statistics.averageScore' },
        avgPassRate: { $avg: '$statistics.passRate' },
        totalAttempts: { $sum: '$statistics.totalAttempts' }
      }
    }
  ]);
};

module.exports = mongoose.model('Assessment', assessmentSchema);