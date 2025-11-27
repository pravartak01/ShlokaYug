const mongoose = require('mongoose');

const shlokaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    titleTransliterated: {
      type: String,
      trim: true,
      maxlength: [200, 'Transliterated title cannot exceed 200 characters'],
    },
    content: {
      sanskrit: {
        devanagari: {
          type: String,
          required: [true, 'Sanskrit text in Devanagari is required'],
          trim: true,
        },
        iast: {
          type: String,
          trim: true,
        },
        bengali: {
          type: String,
          trim: true,
        },
        gujarati: {
          type: String,
          trim: true,
        },
        telugu: {
          type: String,
          trim: true,
        },
      },
      translation: {
        english: {
          type: String,
          required: [true, 'English translation is required'],
          trim: true,
          maxlength: [1000, 'Translation cannot exceed 1000 characters'],
        },
        hindi: {
          type: String,
          trim: true,
          maxlength: [1000, 'Hindi translation cannot exceed 1000 characters'],
        },
        local: {
          type: String,
          trim: true,
          maxlength: [1000, 'Local translation cannot exceed 1000 characters'],
        },
      },
      meaning: {
        wordByWord: [
          {
            word: {
              type: String,
              required: true,
              trim: true,
            },
            meaning: {
              type: String,
              required: true,
              trim: true,
            },
            grammaticalInfo: {
              type: String,
              trim: true,
            },
          },
        ],
        context: {
          type: String,
          trim: true,
          maxlength: [1000, 'Context cannot exceed 1000 characters'],
        },
        significance: {
          type: String,
          trim: true,
          maxlength: [1000, 'Significance cannot exceed 1000 characters'],
        },
      },
    },
    chandas: {
      meterName: {
        type: String,
        trim: true,
        maxlength: [50, 'Meter name cannot exceed 50 characters'],
      },
      pattern: {
        type: String,
        trim: true,
        validate: {
          validator(pattern) {
            return !pattern || /^[LG]+$/.test(pattern);
          },
          message: 'Pattern must contain only L (Laghu) and G (Guru) characters',
        },
      },
      syllableCount: {
        type: Number,
        min: [1, 'Syllable count must be at least 1'],
      },
      lineCount: {
        type: Number,
        min: [1, 'Line count must be at least 1'],
      },
      lineStructure: [
        {
          type: Number,
          min: [1, 'Each line must have at least 1 syllable'],
        },
      ],
      analysisDetails: {
        isValidMeter: {
          type: Boolean,
          default: false,
        },
        deviations: [String],
        alternativeMeters: [String],
        confidence: {
          type: Number,
          min: 0,
          max: 1,
          default: 0,
        },
      },
    },
    audio: {
      referenceRecording: {
        url: String,
        duration: {
          type: Number,
          min: [0, 'Duration cannot be negative'],
        },
        format: {
          type: String,
          enum: ['mp3', 'wav', 'aac', 'm4a'],
          default: 'mp3',
        },
        quality: {
          type: String,
          enum: ['high', 'medium', 'low'],
          default: 'medium',
        },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
      karaokeTimeline: [
        {
          syllable: {
            type: String,
            required: true,
          },
          startTime: {
            type: Number,
            required: true,
            min: 0,
          },
          endTime: {
            type: Number,
            required: true,
            min: 0,
            validate: {
              validator() {
                return this.endTime > this.startTime;
              },
              message: 'End time must be greater than start time',
            },
          },
          pitch: {
            type: Number,
            min: 0,
          },
          isStressed: {
            type: Boolean,
            default: false,
          },
        },
      ],
      alternativeRecordings: [
        {
          url: String,
          contributorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          style: {
            type: String,
            enum: ['traditional', 'modern', 'regional'],
            default: 'traditional',
          },
          rating: {
            type: Number,
            min: 1,
            max: 5,
            default: 3,
          },
          votes: {
            type: Number,
            default: 0,
            min: 0,
          },
        },
      ],
    },
    metadata: {
      source: {
        type: String,
        trim: true,
        maxlength: [200, 'Source cannot exceed 200 characters'],
      },
      category: [
        {
          type: String,
          required: true,
          enum: [
            'mantra',
            'devotional',
            'philosophical',
            'educational',
            'healing',
            'protection',
            'prosperity',
            'knowledge',
            'peace',
            'strength',
            'purification',
            'meditation',
          ],
        },
      ],
      tags: [
        {
          type: String,
          trim: true,
          maxlength: [50, 'Each tag cannot exceed 50 characters'],
        },
      ],
      difficulty: {
        type: String,
        required: [true, 'Difficulty level is required'],
        enum: ['beginner', 'intermediate', 'advanced'],
      },
      estimatedTime: {
        type: Number,
        min: [1, 'Estimated time must be at least 1 minute'],
        max: [120, 'Estimated time cannot exceed 120 minutes'],
      },
      popularity: {
        type: Number,
        default: 0,
        min: 0,
      },
      festivals: [
        {
          type: String,
          trim: true,
          maxlength: [50, 'Festival name cannot exceed 50 characters'],
        },
      ],
      deities: [
        {
          type: String,
          trim: true,
          maxlength: [50, 'Deity name cannot exceed 50 characters'],
        },
      ],
      language: {
        type: String,
        default: 'sanskrit',
        enum: ['sanskrit', 'hindi', 'tamil', 'telugu', 'bengali', 'gujarati'],
      },
      region: {
        type: String,
        trim: true,
        maxlength: [50, 'Region cannot exceed 50 characters'],
      },
      era: {
        type: String,
        trim: true,
        maxlength: [50, 'Era cannot exceed 50 characters'],
      },
    },
    community: {
      likes: {
        type: Number,
        default: 0,
        min: 0,
      },
      shares: {
        type: Number,
        default: 0,
        min: 0,
      },
      views: {
        type: Number,
        default: 0,
        min: 0,
      },
      comments: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          content: {
            type: String,
            required: true,
            trim: true,
            maxlength: [500, 'Comment cannot exceed 500 characters'],
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
          replies: [
            {
              userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
              },
              content: {
                type: String,
                required: true,
                trim: true,
                maxlength: [300, 'Reply cannot exceed 300 characters'],
              },
              timestamp: {
                type: Date,
                default: Date.now,
              },
            },
          ],
          isModerated: {
            type: Boolean,
            default: false,
          },
        },
      ],
      userRecordings: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          audioUrl: String,
          accuracy: {
            type: Number,
            min: 0,
            max: 100,
          },
          feedback: String,
          isPublic: {
            type: Boolean,
            default: false,
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
          likes: {
            type: Number,
            default: 0,
            min: 0,
          },
        },
      ],
      averageRating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      ratingCount: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    moderation: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'flagged'],
        default: 'pending',
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reviewedAt: Date,
      rejectionReason: String,
      flags: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          reason: {
            type: String,
            required: true,
            enum: ['inappropriate', 'incorrect', 'spam', 'copyright', 'other'],
          },
          description: String,
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
shlokaSchema.index({ title: 1 });
shlokaSchema.index({ 'chandas.meterName': 1 });
shlokaSchema.index({ 'metadata.category': 1 });
shlokaSchema.index({ 'metadata.tags': 1 });
shlokaSchema.index({ 'metadata.difficulty': 1 });
shlokaSchema.index({ 'metadata.popularity': -1 });
shlokaSchema.index({ 'community.likes': -1 });
shlokaSchema.index({ 'community.views': -1 });
shlokaSchema.index({ isActive: 1 });
shlokaSchema.index({ featured: 1 });
shlokaSchema.index({ 'moderation.status': 1 });
shlokaSchema.index({ createdAt: -1 });

// Text indexes for search functionality
shlokaSchema.index(
  {
    title: 'text',
    'content.sanskrit.devanagari': 'text',
    'content.sanskrit.iast': 'text',
    'content.translation.english': 'text',
    'content.translation.hindi': 'text',
    'metadata.source': 'text',
    'metadata.tags': 'text',
  },
  {
    weights: {
      title: 10,
      'content.sanskrit.devanagari': 8,
      'content.translation.english': 5,
      'metadata.tags': 3,
      'metadata.source': 1,
    },
  }
);

// Virtual for total syllables (calculated from lineStructure)
shlokaSchema.virtual('totalSyllables').get(function () {
  if (this.chandas.lineStructure && this.chandas.lineStructure.length > 0) {
    return this.chandas.lineStructure.reduce((total, count) => total + count, 0);
  }
  return this.chandas.syllableCount || 0;
});

// Virtual for engagement score
shlokaSchema.virtual('engagementScore').get(function () {
  const likes = this.community.likes || 0;
  const views = this.community.views || 0;
  const comments = this.community.comments ? this.community.comments.length : 0;
  const shares = this.community.shares || 0;

  // Weighted engagement score
  return likes * 3 + comments * 5 + shares * 8 + views * 0.1;
});

// Virtual for difficulty score (numerical representation)
shlokaSchema.virtual('difficultyScore').get(function () {
  const difficultyMap = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
  };
  return difficultyMap[this.metadata.difficulty] || 1;
});

// Pre-save middleware to calculate popularity
shlokaSchema.pre('save', function (next) {
  if (this.isModified('community')) {
    // Calculate popularity based on engagement
    const ageInDays = (new Date() - this.createdAt) / (1000 * 60 * 60 * 24);
    const decayFactor = 0.99 ** ageInDays; // Older content gets lower popularity

    this.metadata.popularity = Math.round(this.engagementScore * decayFactor);
  }
  next();
});

// Pre-save middleware to generate IAST if not provided
shlokaSchema.pre('save', async function (next) {
  if (this.isModified('content.sanskrit.devanagari') && !this.content.sanskrit.iast) {
    try {
      // This would integrate with a transliteration service
      // For now, we'll just set it to be processed later
      this.content.sanskrit.iast = '[TO_BE_PROCESSED]';
    } catch (error) {
      console.error('IAST conversion error:', error);
    }
  }
  next();
});

// Method to add view
shlokaSchema.methods.addView = function () {
  this.community.views += 1;
  return this.save();
};

// Method to add like
shlokaSchema.methods.toggleLike = function (userId) {
  // This would be handled differently with a separate likes collection
  // For simplicity, we're just incrementing/decrementing the count
  this.community.likes += 1;
  return this.save();
};

// Method to add comment
shlokaSchema.methods.addComment = function (userId, content) {
  this.community.comments.push({
    userId,
    content,
    timestamp: new Date(),
  });
  return this.save();
};

// Method to update rating
shlokaSchema.methods.updateRating = function (newRating) {
  const currentTotal = (this.community.averageRating || 0) * (this.community.ratingCount || 0);
  const newCount = (this.community.ratingCount || 0) + 1;
  const newAverage = (currentTotal + newRating) / newCount;

  this.community.averageRating = Math.round(newAverage * 10) / 10; // Round to 1 decimal
  this.community.ratingCount = newCount;

  return this.save();
};

// Static method to search shlokas
shlokaSchema.statics.searchShlokas = function (query, filters = {}, options = {}) {
  const {
    page = 1,
    limit = 20,
    sort = '-metadata.popularity',
    difficulty,
    category,
    tags,
    meter,
    minDuration,
    maxDuration,
  } = options;

  const searchQuery = {
    isActive: true,
    'moderation.status': 'approved',
  };

  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }

  // Apply filters
  if (difficulty) {
    searchQuery['metadata.difficulty'] = difficulty;
  }

  if (category) {
    searchQuery['metadata.category'] = { $in: Array.isArray(category) ? category : [category] };
  }

  if (tags) {
    searchQuery['metadata.tags'] = { $in: Array.isArray(tags) ? tags : [tags] };
  }

  if (meter) {
    searchQuery['chandas.meterName'] = new RegExp(meter, 'i');
  }

  if (minDuration || maxDuration) {
    searchQuery['metadata.estimatedTime'] = {};
    if (minDuration) searchQuery['metadata.estimatedTime'].$gte = minDuration;
    if (maxDuration) searchQuery['metadata.estimatedTime'].$lte = maxDuration;
  }

  const skip = (page - 1) * limit;

  return this.find(searchQuery)
    .populate('createdBy', 'username profile.firstName profile.lastName')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get trending shlokas
shlokaSchema.statics.getTrending = function (timeframe = 'week', limit = 10) {
  const timeframeMap = {
    day: 1,
    week: 7,
    month: 30,
  };

  const days = timeframeMap[timeframe] || 7;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return this.find({
    isActive: true,
    'moderation.status': 'approved',
    createdAt: { $gte: startDate },
  })
    .sort({ 'metadata.popularity': -1, 'community.views': -1 })
    .limit(limit)
    .populate('createdBy', 'username profile.firstName profile.lastName');
};

// Static method to get recommended shlokas
shlokaSchema.statics.getRecommendations = function (userId, userPreferences = {}, limit = 10) {
  const {
    difficulty = ['beginner'],
    categories = [],
    preferredScript = 'devanagari',
  } = userPreferences;

  const query = {
    isActive: true,
    'moderation.status': 'approved',
  };

  // Prefer difficulty levels suitable for user
  if (difficulty.length > 0) {
    query['metadata.difficulty'] = { $in: difficulty };
  }

  // Prefer categories user is interested in
  if (categories.length > 0) {
    query['metadata.category'] = { $in: categories };
  }

  return this.find(query)
    .sort({ 'metadata.popularity': -1, 'community.averageRating': -1 })
    .limit(limit)
    .populate('createdBy', 'username profile.firstName profile.lastName');
};

// Static method to get shlokas by festival
shlokaSchema.statics.getByFestival = function (festival, limit = 20) {
  return this.find({
    isActive: true,
    'moderation.status': 'approved',
    'metadata.festivals': { $in: [festival] },
  })
    .sort({ 'metadata.popularity': -1 })
    .limit(limit)
    .populate('createdBy', 'username profile.firstName profile.lastName');
};

module.exports = mongoose.model('Shloka', shlokaSchema);
