const mongoose = require('mongoose');

// Schema for Course management in LMS
const courseSchema = new mongoose.Schema(
  {
    // Basic course information
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [200, 'Course title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true,
      maxlength: [2000, 'Course description cannot exceed 2000 characters'],
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },

    // Instructor information
    instructor: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Instructor ID is required'],
        index: true,
      },
      name: {
        type: String,
        required: [true, 'Instructor name is required'],
        trim: true,
      },
      credentials: {
        type: String,
        trim: true,
        maxlength: [500, 'Credentials cannot exceed 500 characters'],
      },
      avatar: String,
      bio: {
        type: String,
        trim: true,
        maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      },
      specializations: [
        {
          type: String,
          trim: true,
          maxlength: [100, 'Specialization cannot exceed 100 characters'],
        },
      ],
    },

    // Course structure for LMS
    structure: {
      units: [
        {
          unitId: {
            type: String,
            required: [true, 'Unit ID is required'],
          },
          title: {
            type: String,
            required: [true, 'Unit title is required'],
            trim: true,
            maxlength: [150, 'Unit title cannot exceed 150 characters'],
          },
          description: {
            type: String,
            trim: true,
            maxlength: [1000, 'Unit description cannot exceed 1000 characters'],
          },
          order: {
            type: Number,
            required: [true, 'Unit order is required'],
            min: [1, 'Unit order must be at least 1'],
          },
          estimatedDuration: {
            type: Number, // in minutes
            min: [0, 'Duration cannot be negative'],
            default: 0,
          },

          lessons: [
            {
              lessonId: {
                type: String,
                required: [true, 'Lesson ID is required'],
              },
              title: {
                type: String,
                required: [true, 'Lesson title is required'],
                trim: true,
                maxlength: [150, 'Lesson title cannot exceed 150 characters'],
              },
              description: {
                type: String,
                trim: true,
                maxlength: [1000, 'Lesson description cannot exceed 1000 characters'],
              },
              order: {
                type: Number,
                required: [true, 'Lesson order is required'],
                min: [1, 'Lesson order must be at least 1'],
              },
              estimatedDuration: {
                type: Number, // in minutes
                min: [0, 'Duration cannot be negative'],
                default: 0,
              },

              lectures: [
                {
                  lectureId: {
                    type: String,
                    required: [true, 'Lecture ID is required'],
                  },
                  title: {
                    type: String,
                    required: [true, 'Lecture title is required'],
                    trim: true,
                    maxlength: [150, 'Lecture title cannot exceed 150 characters'],
                  },
                  description: {
                    type: String,
                    trim: true,
                    maxlength: [1000, 'Lecture description cannot exceed 1000 characters'],
                  },
                  order: {
                    type: Number,
                    required: [true, 'Lecture order is required'],
                    min: [1, 'Lecture order must be at least 1'],
                  },

                  content: {
                    videoUrl: String,
                    audioUrl: String,
                    thumbnailUrl: String,
                    duration: {
                      type: Number,
                      min: [0, 'Duration cannot be negative'],
                      default: 0,
                    },

                    materials: [
                      {
                        type: {
                          type: String,
                          enum: ['pdf', 'audio', 'image', 'text', 'link'],
                          required: true,
                        },
                        title: {
                          type: String,
                          required: true,
                          trim: true,
                          maxlength: [100, 'Material title cannot exceed 100 characters'],
                        },
                        url: {
                          type: String,
                          required: true,
                        },
                        downloadable: {
                          type: Boolean,
                          default: true,
                        },
                      },
                    ],

                    shlokaIds: [
                      {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Shloka',
                      },
                    ],

                    transcript: String,
                    keyPoints: [String],
                  },

                  metadata: {
                    difficulty: {
                      type: String,
                      enum: ['beginner', 'intermediate', 'advanced'],
                      default: 'beginner',
                    },
                    tags: [String],
                    isFree: {
                      type: Boolean,
                      default: false,
                    },
                  },
                },
              ],
            },
          ],
        },
      ],

      totalUnits: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalLessons: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalLectures: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalDuration: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // Pricing configuration
    pricing: {
      oneTime: {
        amount: {
          type: Number,
          min: [0, 'Price cannot be negative'],
          default: 0,
        },
        currency: {
          type: String,
          default: 'INR',
          enum: ['INR', 'USD', 'EUR'],
        },
      },

      subscription: {
        monthly: {
          amount: {
            type: Number,
            min: [0, 'Monthly price cannot be negative'],
            default: 0,
          },
          currency: {
            type: String,
            default: 'INR',
            enum: ['INR', 'USD', 'EUR'],
          },
        },
        yearly: {
          amount: {
            type: Number,
            min: [0, 'Yearly price cannot be negative'],
            default: 0,
          },
          currency: {
            type: String,
            default: 'INR',
            enum: ['INR', 'USD', 'EUR'],
          },
        },
      },
    },

    // Course metadata
    metadata: {
      category: [
        {
          type: String,
          required: true,
          enum: [
            'vedic_chanting',
            'sanskrit_language',
            'philosophy',
            'rituals_ceremonies',
            'yoga_meditation',
            'ayurveda',
            'music_arts',
            'scriptures',
            'other',
          ],
        },
      ],
      tags: [String],
      difficulty: {
        type: String,
        required: [true, 'Difficulty level is required'],
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      },
      language: {
        instruction: {
          type: String,
          default: 'english',
          enum: ['english', 'hindi', 'sanskrit', 'tamil', 'bengali', 'gujarati'],
        },
        content: {
          type: String,
          default: 'sanskrit',
          enum: ['sanskrit', 'hindi', 'mixed'],
        },
      },

      isActive: {
        type: Boolean,
        default: true,
      },
      featured: {
        type: Boolean,
        default: false,
      },
    },

    // Course statistics
    stats: {
      enrollment: {
        total: {
          type: Number,
          default: 0,
          min: 0,
        },
      },

      ratings: {
        average: {
          type: Number,
          min: 1,
          max: 5,
          default: null,
        },
        count: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    },

    // Publishing information
    publishing: {
      status: {
        type: String,
        enum: ['draft', 'review', 'published', 'archived', 'suspended'],
        default: 'draft',
      },
      publishedAt: Date,
      lastModified: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
courseSchema.index({ 'instructor.userId': 1 });
courseSchema.index({ 'metadata.category': 1 });
courseSchema.index({ 'metadata.difficulty': 1 });
courseSchema.index({ 'metadata.isActive': 1 });
courseSchema.index({ 'publishing.status': 1 });
courseSchema.index({ createdAt: -1 });

// Virtual for enrollment percentage
courseSchema.virtual('enrollmentPercentage').get(function () {
  return this.stats.enrollment.total || 0;
});

// Virtual for total content duration in hours
courseSchema.virtual('totalHours').get(function () {
  if (this.structure.totalDuration) {
    return Math.round((this.structure.totalDuration / 60) * 10) / 10;
  }
  return 0;
});

// Method to calculate total course content
courseSchema.methods.calculateTotalContent = function () {
  const totalUnits = this.structure.units.length;
  let totalLessons = 0;
  let totalLectures = 0;
  let totalDuration = 0;

  this.structure.units.forEach((unit) => {
    totalLessons += unit.lessons.length;
    unit.lessons.forEach((lesson) => {
      totalLectures += lesson.lectures.length;
      lesson.lectures.forEach((lecture) => {
        totalDuration += lecture.content.duration || 0;
      });
    });
  });

  this.structure.totalUnits = totalUnits;
  this.structure.totalLessons = totalLessons;
  this.structure.totalLectures = totalLectures;
  this.structure.totalDuration = totalDuration;

  return this.save();
};

// Method to update enrollment stats
courseSchema.methods.updateEnrollment = function () {
  this.stats.enrollment.total += 1;
  return this.save();
};

// Static method to find courses by guru
courseSchema.statics.findByGuru = function (guruId, options = {}) {
  const query = {
    'instructor.userId': guruId,
    'metadata.isActive': true,
  };

  if (options.published) {
    query['publishing.status'] = 'published';
  }

  return this.find(query)
    .select(options.select || '')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 0);
};

// Static method to find featured courses
courseSchema.statics.findFeatured = function (limit = 10) {
  return this.find({
    'metadata.featured': true,
    'metadata.isActive': true,
    'publishing.status': 'published',
  })
    .select('title description instructor.name stats.ratings metadata.difficulty pricing')
    .sort({ 'stats.ratings.average': -1 })
    .limit(limit);
};

module.exports = mongoose.model('Course', courseSchema);
