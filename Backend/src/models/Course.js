const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  instructor: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor user ID is required']
    },
    name: {
      type: String,
      required: [true, 'Instructor name is required'],
      trim: true,
      maxlength: [100, 'Instructor name cannot exceed 100 characters']
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Instructor bio cannot exceed 1000 characters']
    },
    credentials: {
      type: String,
      trim: true,
      maxlength: [500, 'Credentials cannot exceed 500 characters']
    },
    avatar: String,
    experience: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      default: 0
    },
    specializations: [{
      type: String,
      trim: true,
      maxlength: [50, 'Specialization cannot exceed 50 characters']
    }]
  },
  structure: {
    modules: [{
      id: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: [true, 'Module title is required'],
        trim: true,
        maxlength: [150, 'Module title cannot exceed 150 characters']
      },
      description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Module description cannot exceed 1000 characters']
      },
      order: {
        type: Number,
        required: [true, 'Module order is required'],
        min: [1, 'Module order must be at least 1']
      },
      estimatedDuration: {
        type: Number, // in minutes
        min: [0, 'Duration cannot be negative']
      },
      prerequisites: [{
        moduleId: String,
        description: String
      }],
      learningObjectives: [{
        type: String,
        trim: true,
        maxlength: [200, 'Learning objective cannot exceed 200 characters']
      }],
      lessons: [{
        id: {
          type: String,
          required: true
        },
        title: {
          type: String,
          required: [true, 'Lesson title is required'],
          trim: true,
          maxlength: [150, 'Lesson title cannot exceed 150 characters']
        },
        description: {
          type: String,
          trim: true,
          maxlength: [1000, 'Lesson description cannot exceed 1000 characters']
        },
        type: {
          type: String,
          required: [true, 'Lesson type is required'],
          enum: ['video', 'audio', 'text', 'practice', 'quiz', 'assignment', 'live_session']
        },
        content: {
          shlokaIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shloka'
          }],
          instructionText: String,
          audioUrl: String,
          videoUrl: String,
          documentUrls: [String],
          practiceExercises: [{
            type: {
              type: String,
              enum: ['recitation', 'quiz', 'analysis', 'composition', 'listening']
            },
            title: String,
            instructions: String,
            expectedDuration: Number, // in minutes
            passingScore: {
              type: Number,
              default: 70,
              min: 0,
              max: 100
            },
            questions: [{
              type: String,
              enum: ['multiple_choice', 'true_false', 'audio_recording', 'text_input'],
              question: String,
              options: [String], // for multiple choice
              correctAnswer: String,
              explanation: String,
              points: {
                type: Number,
                default: 1,
                min: 0
              }
            }],
            resources: [{
              title: String,
              url: String,
              type: String // 'reference', 'example', 'guide'
            }]
          }]
        },
        prerequisites: [{
          lessonId: String,
          description: String
        }],
        estimatedTime: {
          type: Number, // in minutes
          required: [true, 'Estimated time is required'],
          min: [1, 'Estimated time must be at least 1 minute']
        },
        order: {
          type: Number,
          required: [true, 'Lesson order is required'],
          min: [1, 'Lesson order must be at least 1']
        },
        isOptional: {
          type: Boolean,
          default: false
        },
        difficulty: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced'],
          default: 'beginner'
        }
      }]
    }],
    totalDuration: {
      type: Number, // total hours
      min: [0, 'Duration cannot be negative']
    },
    totalLessons: {
      type: Number,
      min: [1, 'Course must have at least 1 lesson']
    },
    totalModules: {
      type: Number,
      min: [1, 'Course must have at least 1 module']
    },
    completionCriteria: {
      minimumScore: {
        type: Number,
        default: 70,
        min: 0,
        max: 100
      },
      mandatoryLessons: [String], // lesson IDs that must be completed
      minimumTimeSpent: Number, // in minutes
      requiredAssignments: [String] // assignment IDs
    }
  },
  enrollment: {
    maxStudents: {
      type: Number,
      min: [1, 'Max students must be at least 1'],
      default: 1000
    },
    currentEnrollment: {
      type: Number,
      default: 0,
      min: 0
    },
    enrollmentDeadline: Date,
    isOpenEnrollment: {
      type: Boolean,
      default: true
    },
    waitingList: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      joinedAt: {
        type: Date,
        default: Date.now
      },
      priority: {
        type: Number,
        default: 1
      }
    }],
    price: {
      amount: {
        type: Number,
        min: [0, 'Price cannot be negative'],
        default: 0
      },
      currency: {
        type: String,
        default: 'INR',
        enum: ['INR', 'USD', 'EUR']
      },
      discounts: [{
        code: {
          type: String,
          trim: true,
          uppercase: true
        },
        percentage: {
          type: Number,
          min: [0, 'Discount cannot be negative'],
          max: [100, 'Discount cannot exceed 100%']
        },
        validFrom: Date,
        validUntil: Date,
        usageLimit: Number,
        usedCount: {
          type: Number,
          default: 0
        },
        isActive: {
          type: Boolean,
          default: true
        }
      }],
      scholarships: [{
        name: String,
        criteria: String,
        discountPercentage: Number,
        slotsAvailable: Number,
        slotsUsed: {
          type: Number,
          default: 0
        }
      }]
    }
  },
  requirements: {
    prerequisiteLevel: {
      type: String,
      enum: ['none', 'beginner', 'intermediate', 'advanced'],
      default: 'none'
    },
    requiredCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    recommendedAge: {
      min: {
        type: Number,
        min: 5,
        max: 100
      },
      max: {
        type: Number,
        min: 5,
        max: 100
      }
    },
    timeCommitment: {
      hoursPerWeek: {
        type: Number,
        min: [0.5, 'Time commitment must be at least 0.5 hours per week']
      },
      totalWeeks: Number,
      flexibleSchedule: {
        type: Boolean,
        default: true
      }
    },
    technicalRequirements: {
      deviceTypes: [{
        type: String,
        enum: ['mobile', 'tablet', 'desktop', 'any']
      }],
      internetRequired: {
        type: Boolean,
        default: true
      },
      microphoneRequired: {
        type: Boolean,
        default: true
      },
      minimumAppVersion: String
    }
  },
  metadata: {
    category: [{
      type: String,
      required: true,
      enum: [
        'vedic_chanting', 'mantra_recitation', 'devotional_singing',
        'classical_music', 'pronunciation', 'grammar', 'philosophy',
        'ritual_practices', 'meditation', 'beginner_basics'
      ]
    }],
    tags: [{
      type: String,
      trim: true,
      maxlength: [50, 'Tag cannot exceed 50 characters']
    }],
    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    language: {
      instruction: {
        type: String,
        default: 'english',
        enum: ['english', 'hindi', 'sanskrit', 'tamil', 'bengali']
      },
      content: {
        type: String,
        default: 'sanskrit',
        enum: ['sanskrit', 'hindi', 'mixed']
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    isCertified: {
      type: Boolean,
      default: true
    },
    certificateTemplate: String,
    rating: {
      average: {
        type: Number,
        min: 1,
        max: 5,
        default: null
      },
      count: {
        type: Number,
        default: 0,
        min: 0
      },
      distribution: {
        five: { type: Number, default: 0 },
        four: { type: Number, default: 0 },
        three: { type: Number, default: 0 },
        two: { type: Number, default: 0 },
        one: { type: Number, default: 0 }
      }
    },
    statistics: {
      totalEnrollments: {
        type: Number,
        default: 0
      },
      completionRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      averageCompletionTime: Number, // in days
      studentSatisfaction: {
        type: Number,
        min: 1,
        max: 5
      }
    }
  },
  publishing: {
    status: {
      type: String,
      enum: ['draft', 'review', 'published', 'archived'],
      default: 'draft'
    },
    publishedAt: Date,
    lastUpdated: Date,
    version: {
      type: String,
      default: '1.0'
    },
    changeLog: [{
      version: String,
      changes: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
courseSchema.index({ 'instructor.userId': 1 });
courseSchema.index({ 'metadata.category': 1 });
courseSchema.index({ 'metadata.difficulty': 1 });
courseSchema.index({ 'enrollment.isOpenEnrollment': 1 });
courseSchema.index({ 'metadata.isActive': 1 });
courseSchema.index({ 'metadata.featured': 1 });
courseSchema.index({ 'publishing.status': 1 });
courseSchema.index({ 'metadata.rating.average': -1 });
courseSchema.index({ 'enrollment.currentEnrollment': -1 });
courseSchema.index({ createdAt: -1 });

// Text index for search
courseSchema.index({
  title: 'text',
  description: 'text',
  'metadata.tags': 'text',
  'instructor.name': 'text'
}, {
  weights: {
    title: 10,
    'metadata.tags': 5,
    description: 3,
    'instructor.name': 2
  }
});

// Virtual for enrollment percentage
courseSchema.virtual('enrollmentPercentage').get(function() {
  if (this.enrollment.maxStudents === 0) return 0;
  return Math.round((this.enrollment.currentEnrollment / this.enrollment.maxStudents) * 100);
});

// Virtual for total content duration in hours
courseSchema.virtual('totalHours').get(function() {
  if (this.structure.totalDuration) {
    return this.structure.totalDuration;
  }
  
  // Calculate from modules if not set
  let totalMinutes = 0;
  this.structure.modules.forEach(module => {
    module.lessons.forEach(lesson => {
      totalMinutes += lesson.estimatedTime || 0;
    });
  });
  
  return Math.round(totalMinutes / 60 * 10) / 10; // Round to 1 decimal
});

// Virtual for course progress (would need student data)
courseSchema.virtual('isEnrollmentOpen').get(function() {
  const now = new Date();
  return this.enrollment.isOpenEnrollment &&
         this.metadata.isActive &&
         this.publishing.status === 'published' &&
         (!this.enrollment.enrollmentDeadline || this.enrollment.enrollmentDeadline > now) &&
         (this.enrollment.currentEnrollment < this.enrollment.maxStudents);
});

// Pre-save middleware to update calculated fields
courseSchema.pre('save', function(next) {
  // Update total modules and lessons count
  if (this.isModified('structure.modules')) {
    this.structure.totalModules = this.structure.modules.length;
    this.structure.totalLessons = this.structure.modules.reduce((total, module) => {
      return total + (module.lessons ? module.lessons.length : 0);
    }, 0);
    
    // Calculate total duration
    let totalMinutes = 0;
    this.structure.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        totalMinutes += lesson.estimatedTime || 0;
      });
    });
    this.structure.totalDuration = Math.round(totalMinutes / 60 * 10) / 10;
  }
  
  // Update last updated timestamp
  if (this.isModified() && !this.isNew) {
    this.publishing.lastUpdated = new Date();
  }
  
  next();
});

// Method to enroll student
courseSchema.methods.enrollStudent = function(userId) {
  if (!this.isEnrollmentOpen) {
    throw new Error('Enrollment is not open for this course');
  }
  
  this.enrollment.currentEnrollment += 1;
  
  // Add to waiting list if full
  if (this.enrollment.currentEnrollment > this.enrollment.maxStudents) {
    this.enrollment.currentEnrollment -= 1;
    this.enrollment.waitingList.push({
      userId,
      joinedAt: new Date(),
      priority: this.enrollment.waitingList.length + 1
    });
    throw new Error('Course is full. Added to waiting list.');
  }
  
  return this.save();
};

// Method to unenroll student
courseSchema.methods.unenrollStudent = function(userId) {
  this.enrollment.currentEnrollment = Math.max(0, this.enrollment.currentEnrollment - 1);
  
  // Move someone from waiting list if available
  if (this.enrollment.waitingList.length > 0) {
    const nextStudent = this.enrollment.waitingList.shift();
    this.enrollment.currentEnrollment += 1;
    // Note: In practice, you'd also need to create enrollment record for the waiting list student
  }
  
  return this.save();
};

// Method to update rating
courseSchema.methods.updateRating = function(newRating) {
  const currentTotal = (this.metadata.rating.average || 0) * (this.metadata.rating.count || 0);
  const newCount = (this.metadata.rating.count || 0) + 1;
  const newAverage = (currentTotal + newRating) / newCount;
  
  this.metadata.rating.average = Math.round(newAverage * 10) / 10;
  this.metadata.rating.count = newCount;
  
  // Update distribution
  const ratingKey = ['one', 'two', 'three', 'four', 'five'][newRating - 1];
  this.metadata.rating.distribution[ratingKey] += 1;
  
  return this.save();
};

// Method to get lesson by ID
courseSchema.methods.getLessonById = function(lessonId) {
  for (const module of this.structure.modules) {
    const lesson = module.lessons.find(lesson => lesson.id === lessonId);
    if (lesson) {
      return { module, lesson };
    }
  }
  return null;
};

// Method to get next lesson
courseSchema.methods.getNextLesson = function(currentLessonId) {
  const modules = this.structure.modules.sort((a, b) => a.order - b.order);
  
  for (let i = 0; i < modules.length; i++) {
    const module = modules[i];
    const lessons = module.lessons.sort((a, b) => a.order - b.order);
    
    for (let j = 0; j < lessons.length; j++) {
      if (lessons[j].id === currentLessonId) {
        // Return next lesson in same module
        if (j + 1 < lessons.length) {
          return { module, lesson: lessons[j + 1] };
        }
        // Return first lesson of next module
        if (i + 1 < modules.length && modules[i + 1].lessons.length > 0) {
          const nextModule = modules[i + 1];
          const nextLesson = nextModule.lessons.sort((a, b) => a.order - b.order)[0];
          return { module: nextModule, lesson: nextLesson };
        }
        // No next lesson (course completed)
        return null;
      }
    }
  }
  return null;
};

// Static method to search courses
courseSchema.statics.searchCourses = function(query, filters = {}, options = {}) {
  const {
    page = 1,
    limit = 20,
    sort = '-metadata.rating.average',
    category,
    difficulty,
    instructor,
    minPrice,
    maxPrice,
    duration,
    language
  } = options;

  let searchQuery = {
    'metadata.isActive': true,
    'publishing.status': 'published'
  };

  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }

  // Apply filters
  if (category) {
    searchQuery['metadata.category'] = { $in: Array.isArray(category) ? category : [category] };
  }

  if (difficulty) {
    searchQuery['metadata.difficulty'] = difficulty;
  }

  if (instructor) {
    searchQuery['instructor.userId'] = instructor;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    searchQuery['enrollment.price.amount'] = {};
    if (minPrice !== undefined) searchQuery['enrollment.price.amount'].$gte = minPrice;
    if (maxPrice !== undefined) searchQuery['enrollment.price.amount'].$lte = maxPrice;
  }

  if (duration) {
    // Duration filter: 'short' (< 5h), 'medium' (5-20h), 'long' (> 20h)
    if (duration === 'short') {
      searchQuery['structure.totalDuration'] = { $lt: 5 };
    } else if (duration === 'medium') {
      searchQuery['structure.totalDuration'] = { $gte: 5, $lte: 20 };
    } else if (duration === 'long') {
      searchQuery['structure.totalDuration'] = { $gt: 20 };
    }
  }

  if (language) {
    searchQuery['metadata.language.instruction'] = language;
  }

  const skip = (page - 1) * limit;

  return this.find(searchQuery)
    .populate('instructor.userId', 'username profile.firstName profile.lastName profile.avatar')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get featured courses
courseSchema.statics.getFeatured = function(limit = 6) {
  return this.find({
    'metadata.isActive': true,
    'metadata.featured': true,
    'publishing.status': 'published'
  })
  .sort({ 'metadata.rating.average': -1, 'enrollment.currentEnrollment': -1 })
  .limit(limit)
  .populate('instructor.userId', 'username profile.firstName profile.lastName profile.avatar');
};

// Static method to get instructor's courses
courseSchema.statics.getInstructorCourses = function(instructorId, includeUnpublished = false) {
  let query = { 'instructor.userId': instructorId };
  
  if (!includeUnpublished) {
    query['publishing.status'] = 'published';
    query['metadata.isActive'] = true;
  }
  
  return this.find(query)
    .sort({ 'publishing.publishedAt': -1, createdAt: -1 });
};

module.exports = mongoose.model('Course', courseSchema);