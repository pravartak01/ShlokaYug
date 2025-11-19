# Database Schema Design

## Overview
MongoDB collections designed for the ShlokaYug platform with comprehensive Sanskrit learning, audio processing, and community features.

## Collections Structure

### 1. Users Collection
```javascript
{
  _id: ObjectId,
  email: String, // unique, required
  username: String, // unique, required
  password: String, // hashed
  profile: {
    firstName: String,
    lastName: String,
    avatar: String, // Cloudinary URL
    dateOfBirth: Date,
    location: String,
    bio: String,
    phoneNumber: String,
    preferredScript: String, // 'devanagari' | 'iast' | 'bengali', etc.
    nativeLanguage: String,
    learningGoals: [String]
  },
  role: String, // 'student' | 'guru' | 'admin' | 'moderator'
  subscription: {
    plan: String, // 'free' | 'basic' | 'premium' | 'guru'
    status: String, // 'active' | 'expired' | 'cancelled'
    startDate: Date,
    endDate: Date,
    paymentDetails: {
      provider: String, // 'razorpay' | 'stripe'
      subscriptionId: String,
      lastPayment: Date,
      amount: Number,
      currency: String
    }
  },
  gamification: {
    level: Number, // default: 1
    totalXP: Number, // default: 0
    currentXP: Number, // XP in current level
    xpToNextLevel: Number,
    badges: [{
      badgeId: ObjectId,
      earnedAt: Date,
      category: String
    }],
    streaks: {
      current: Number,
      longest: Number,
      lastActivity: Date
    },
    achievements: [{
      achievementId: String,
      unlockedAt: Date,
      progress: Number
    }]
  },
  preferences: {
    notifications: {
      email: Boolean,
      push: Boolean,
      dailyReminders: Boolean,
      newContent: Boolean,
      community: Boolean
    },
    privacy: {
      profileVisibility: String, // 'public' | 'followers' | 'private'
      showProgress: Boolean,
      allowMessages: Boolean
    },
    audio: {
      autoplay: Boolean,
      defaultSpeed: Number,
      backgroundAudio: Boolean
    }
  },
  socialAuth: {
    googleId: String,
    facebookId: String,
    appleId: String
  },
  verification: {
    isEmailVerified: Boolean,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  metadata: {
    lastLogin: Date,
    loginCount: Number,
    accountCreated: Date,
    isActive: Boolean, // default: true
    bannedUntil: Date,
    banReason: String
  }
}
```

### 2. Shlokas Collection
```javascript
{
  _id: ObjectId,
  title: String, // e.g., "Gayatri Mantra"
  titleTransliterated: String, // IAST version
  content: {
    sanskrit: {
      devanagari: String,
      iast: String,
      bengali: String, // optional
      gujarati: String, // optional
      telugu: String // optional
    },
    translation: {
      english: String,
      hindi: String,
      local: String // based on user's language
    },
    meaning: {
      wordByWord: [{
        word: String,
        meaning: String,
        grammaticalInfo: String
      }],
      context: String,
      significance: String
    }
  },
  chandas: {
    meterName: String, // e.g., "Gayatri", "Anushtubh"
    pattern: String, // LG pattern: "LGLGLGLG..."
    syllableCount: Number,
    lineCount: Number,
    lineStructure: [Number], // syllables per line
    analysisDetails: {
      isValidMeter: Boolean,
      deviations: [String],
      alternativeMeters: [String]
    }
  },
  audio: {
    referenceRecording: {
      url: String, // Cloudinary URL
      duration: Number, // in seconds
      format: String, // 'mp3' | 'wav'
      quality: String, // 'high' | 'medium' | 'low'
    },
    karaokeTimeline: [{
      syllable: String,
      startTime: Number, // milliseconds
      endTime: Number,
      pitch: Number,
      isStressed: Boolean
    }],
    alternativeRecordings: [{
      url: String,
      contributorId: ObjectId,
      style: String, // 'traditional' | 'modern' | 'regional'
      rating: Number
    }]
  },
  metadata: {
    source: String, // e.g., "Rig Veda 3.62.10"
    category: [String], // ['mantra', 'devotional', 'philosophical']
    tags: [String], // ['morning', 'meditation', 'beginner']
    difficulty: String, // 'beginner' | 'intermediate' | 'advanced'
    estimatedTime: Number, // minutes to learn
    popularity: Number, // calculated field
    festivals: [String], // associated festivals
    deities: [String], // associated deities
  },
  community: {
    likes: Number,
    shares: Number,
    comments: [{
      userId: ObjectId,
      content: String,
      timestamp: Date,
      replies: [{
        userId: ObjectId,
        content: String,
        timestamp: Date
      }]
    }],
    userRecordings: [{
      userId: ObjectId,
      audioUrl: String,
      accuracy: Number,
      feedback: String,
      isPublic: Boolean,
      timestamp: Date
    }]
  },
  createdBy: ObjectId, // admin or guru who added
  createdAt: Date,
  updatedAt: Date,
  isActive: Boolean
}
```

### 3. Audio Recordings Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  shlokaId: ObjectId,
  recording: {
    originalUrl: String, // user upload
    processedUrl: String, // after FFmpeg processing
    duration: Number,
    fileSize: Number,
    format: String,
    quality: String,
    uploadedAt: Date
  },
  analysis: {
    overallAccuracy: Number, // 0-100
    timingAccuracy: Number,
    pronunciationAccuracy: Number,
    rhythmAccuracy: Number,
    detailedAnalysis: [{
      syllable: String,
      expectedTiming: Number,
      actualTiming: Number,
      timingDifference: Number,
      pronunciationScore: Number,
      feedback: String
    }],
    aiGeneratedFeedback: String,
    recommendedImprovements: [String]
  },
  practice: {
    attemptNumber: Number,
    sessionId: String,
    practiceMode: String, // 'guided' | 'free' | 'exam'
    isCompleted: Boolean,
    timeSpent: Number // seconds
  },
  gamification: {
    xpEarned: Number,
    badgesEarned: [ObjectId],
    streakContribution: Boolean,
    milestoneReached: String
  },
  privacy: {
    isPublic: Boolean,
    allowComments: Boolean,
    shareable: Boolean
  },
  metadata: {
    deviceInfo: String,
    appVersion: String,
    recordingConditions: String, // 'quiet' | 'noisy' | 'outdoor'
  },
  moderation: {
    status: String, // 'pending' | 'approved' | 'rejected'
    reviewedBy: ObjectId,
    reviewedAt: Date,
    rejectionReason: String
  }
}
```

### 4. Courses Collection (LMS)
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  instructor: {
    userId: ObjectId,
    name: String,
    bio: String,
    credentials: String
  },
  structure: {
    modules: [{
      id: String,
      title: String,
      description: String,
      order: Number,
      lessons: [{
        id: String,
        title: String,
        type: String, // 'video' | 'audio' | 'text' | 'practice'
        content: {
          shlokaIds: [ObjectId],
          instructionText: String,
          audioUrl: String,
          videoUrl: String,
          practiceExercises: [{
            type: String, // 'recitation' | 'quiz' | 'analysis'
            instructions: String,
            expectedDuration: Number
          }]
        },
        prerequisites: [String], // lesson IDs
        estimatedTime: Number,
        order: Number
      }]
    }],
    totalDuration: Number, // hours
    totalLessons: Number
  },
  enrollment: {
    maxStudents: Number,
    currentEnrollment: Number,
    enrollmentDeadline: Date,
    isOpenEnrollment: Boolean,
    price: {
      amount: Number,
      currency: String,
      discounts: [{
        code: String,
        percentage: Number,
        validUntil: Date
      }]
    }
  },
  requirements: {
    prerequisiteLevel: String,
    requiredCourses: [ObjectId],
    recommendedAge: String,
    timeCommitment: String
  },
  metadata: {
    category: [String],
    tags: [String],
    difficulty: String,
    language: String, // instruction language
    isActive: Boolean,
    featured: Boolean,
    rating: Number,
    reviewCount: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 5. User Progress Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  courseId: ObjectId, // optional, null for individual shloka practice
  shlokaId: ObjectId, // optional, null for course progress
  progress: {
    completedModules: [String],
    completedLessons: [String],
    currentModule: String,
    currentLesson: String,
    overallProgress: Number, // percentage
    timeSpent: Number, // total minutes
    lastAccessed: Date,
    isCompleted: Boolean,
    completedAt: Date
  },
  performance: {
    averageAccuracy: Number,
    bestAccuracy: Number,
    totalAttempts: Number,
    successfulAttempts: Number,
    practiceStreak: Number,
    weakAreas: [String], // identified problem areas
    strongAreas: [String],
    improvementTrend: Number // positive/negative trend
  },
  assignments: [{
    assignmentId: ObjectId,
    submittedAt: Date,
    audioSubmissionUrl: String,
    score: Number,
    feedback: String,
    gradedBy: ObjectId,
    gradedAt: Date
  }],
  milestones: [{
    type: String, // 'completion' | 'accuracy' | 'streak'
    achievedAt: Date,
    value: Number,
    xpAwarded: Number
  }],
  notes: [{
    lessonId: String,
    content: String,
    timestamp: Date,
    type: String // 'note' | 'doubt' | 'insight'
  }]
}
```

### 6. Community Posts Collection
```javascript
{
  _id: ObjectId,
  authorId: ObjectId,
  type: String, // 'recording' | 'question' | 'tip' | 'achievement'
  content: {
    title: String,
    description: String,
    mediaUrls: [String], // audio/video/image URLs
    shlokaId: ObjectId, // if related to specific shloka
    tags: [String]
  },
  engagement: {
    likes: [{
      userId: ObjectId,
      timestamp: Date
    }],
    comments: [{
      _id: ObjectId,
      userId: ObjectId,
      content: String,
      timestamp: Date,
      replies: [{
        userId: ObjectId,
        content: String,
        timestamp: Date
      }],
      likes: [ObjectId] // userIds who liked
    }],
    shares: Number,
    views: Number
  },
  moderation: {
    status: String, // 'pending' | 'approved' | 'flagged' | 'removed'
    flags: [{
      userId: ObjectId,
      reason: String,
      timestamp: Date
    }],
    reviewedBy: ObjectId,
    reviewedAt: Date
  },
  visibility: {
    isPublic: Boolean,
    allowComments: Boolean,
    isPromoted: Boolean,
    isFeatured: Boolean
  },
  metadata: {
    createdAt: Date,
    updatedAt: Date,
    lastEngagement: Date,
    location: String, // if user shared location
    deviceType: String
  }
}
```

### 7. Live Sessions Collection
```javascript
{
  _id: ObjectId,
  hostId: ObjectId,
  title: String,
  description: String,
  schedule: {
    startTime: Date,
    endTime: Date,
    timezone: String,
    isRecurring: Boolean,
    recurrencePattern: String // daily/weekly/monthly
  },
  session: {
    type: String, // 'chanting' | 'lecture' | 'practice' | 'discussion'
    shlokasList: [ObjectId], // planned shlokas
    maxParticipants: Number,
    isPasswordProtected: Boolean,
    password: String,
    streamingUrl: String,
    recordingUrl: String // after session ends
  },
  participants: [{
    userId: ObjectId,
    joinedAt: Date,
    leftAt: Date,
    participationType: String, // 'listener' | 'chanter' | 'moderator'
    audioEnabled: Boolean,
    videoEnabled: Boolean
  }],
  interaction: {
    chatMessages: [{
      userId: ObjectId,
      message: String,
      timestamp: Date,
      type: String // 'text' | 'emoji' | 'system'
    }],
    reactions: [{
      userId: ObjectId,
      type: String, // 'like' | 'love' | 'appreciate'
      timestamp: Date
    }],
    polls: [{
      question: String,
      options: [String],
      votes: [{
        userId: ObjectId,
        option: String,
        timestamp: Date
      }]
    }]
  },
  status: String, // 'scheduled' | 'live' | 'ended' | 'cancelled'
  metadata: {
    createdAt: Date,
    actualStartTime: Date,
    actualEndTime: Date,
    totalParticipants: Number,
    peakConcurrentUsers: Number,
    averageDuration: Number // participant average
  }
}
```

### 8. Badges & Achievements Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  icon: String, // icon URL or name
  category: String, // 'learning' | 'community' | 'accuracy' | 'streak'
  criteria: {
    type: String, // 'count' | 'accuracy' | 'streak' | 'time' | 'special'
    threshold: Number,
    metric: String, // 'shlokas_learned' | 'accuracy_score' | 'days_streak'
    conditions: [String] // additional conditions
  },
  rarity: String, // 'common' | 'rare' | 'epic' | 'legendary'
  rewards: {
    xpBonus: Number,
    specialPerks: [String], // unlocked features
    displayTitle: String // title user can use
  },
  metadata: {
    isActive: Boolean,
    createdAt: Date,
    earnedCount: Number, // how many users have this
    displayOrder: Number
  }
}
```

### 9. Certificates Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  courseId: ObjectId, // null for individual achievements
  certificateType: String, // 'course_completion' | 'achievement' | 'proficiency'
  details: {
    title: String,
    description: String,
    issuedFor: String, // what was achieved
    issuerName: String,
    issuerTitle: String,
    issuerSignature: String, // URL
    level: String, // beginner/intermediate/advanced
    validFrom: Date,
    expiresAt: Date // null if doesn't expire
  },
  verification: {
    certificateId: String, // unique public ID
    verificationUrl: String,
    qrCode: String, // QR code image URL
    digitalSignature: String,
    isRevoked: Boolean,
    revokedReason: String
  },
  file: {
    pdfUrl: String,
    thumbnailUrl: String,
    downloadCount: Number
  },
  sharing: {
    isPublic: Boolean,
    sharedOn: [{
      platform: String, // 'linkedin' | 'facebook' | 'twitter'
      sharedAt: Date
    }]
  },
  metadata: {
    generatedAt: Date,
    templateUsed: String,
    generatedBy: String // system/admin
  }
}
```

## Indexes Strategy

### Primary Indexes
```javascript
// Users Collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "username": 1 }, { unique: true })
db.users.createIndex({ "socialAuth.googleId": 1 }, { sparse: true })
db.users.createIndex({ "role": 1 })
db.users.createIndex({ "subscription.status": 1 })

// Shlokas Collection
db.shlokas.createIndex({ "title": 1 })
db.shlokas.createIndex({ "chandas.meterName": 1 })
db.shlokas.createIndex({ "metadata.category": 1 })
db.shlokas.createIndex({ "metadata.tags": 1 })
db.shlokas.createIndex({ "metadata.difficulty": 1 })
db.shlokas.createIndex({ "content.sanskrit.devanagari": "text" })
db.shlokas.createIndex({ "content.translation.english": "text" })

// Audio Recordings Collection
db.audiorecordings.createIndex({ "userId": 1, "shlokaId": 1 })
db.audiorecordings.createIndex({ "analysis.overallAccuracy": -1 })
db.audiorecordings.createIndex({ "recording.uploadedAt": -1 })
db.audiorecordings.createIndex({ "privacy.isPublic": 1 })

// Courses Collection
db.courses.createIndex({ "instructor.userId": 1 })
db.courses.createIndex({ "metadata.category": 1 })
db.courses.createIndex({ "metadata.difficulty": 1 })
db.courses.createIndex({ "enrollment.isOpenEnrollment": 1 })

// User Progress Collection
db.userprogress.createIndex({ "userId": 1, "courseId": 1 }, { unique: true })
db.userprogress.createIndex({ "userId": 1, "shlokaId": 1 })
db.userprogress.createIndex({ "progress.lastAccessed": -1 })

// Community Posts Collection
db.communityposts.createIndex({ "authorId": 1 })
db.communityposts.createIndex({ "metadata.createdAt": -1 })
db.communityposts.createIndex({ "type": 1 })
db.communityposts.createIndex({ "moderation.status": 1 })
db.communityposts.createIndex({ "engagement.likes": -1 })

// Live Sessions Collection
db.livesessions.createIndex({ "hostId": 1 })
db.livesessions.createIndex({ "schedule.startTime": 1 })
db.livesessions.createIndex({ "status": 1 })
db.livesessions.createIndex({ "session.type": 1 })
```

## Data Validation Rules

### Mongoose Schema Validation Examples
```javascript
// User email validation
email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  validate: {
    validator: function(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    message: 'Invalid email format'
  }
}

// Audio file size validation
fileSize: {
  type: Number,
  max: [20 * 1024 * 1024, 'File size cannot exceed 20MB'],
  min: [1024, 'File size must be at least 1KB']
}

// Accuracy score validation
overallAccuracy: {
  type: Number,
  min: [0, 'Accuracy cannot be negative'],
  max: [100, 'Accuracy cannot exceed 100%'],
  default: 0
}
```

## Migration Strategy

### Version 1.0 → 1.1 Migration Scripts
```javascript
// Add new fields with default values
db.users.updateMany(
  { "gamification": { $exists: false } },
  { 
    $set: { 
      "gamification": {
        level: 1,
        totalXP: 0,
        currentXP: 0,
        xpToNextLevel: 100,
        badges: [],
        streaks: { current: 0, longest: 0 },
        achievements: []
      }
    }
  }
)
```

## Backup & Recovery Strategy

### Daily Backups
```bash
# MongoDB backup script
mongodump --uri="mongodb://localhost:27017/shlokayug_prod" --out=/backups/$(date +%Y%m%d)

# Automated cleanup (keep 30 days)
find /backups -type d -mtime +30 -exec rm -rf {} +
```

### Point-in-Time Recovery
- Enable MongoDB oplog
- Regular snapshot creation
- Transaction log preservation