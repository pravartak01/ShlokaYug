# ShlokaYug LMS - Technical Implementation Guide

## 🏗️ **Backend Architecture Overview**

This document outlines the complete technical implementation approach for the ShlokaYug Learning Management System (LMS) backend, covering database design, API architecture, payment integration, and deployment strategy.

---

## 📊 **Database Schema Design**

### **Enhanced Course Model Structure**

```javascript
// Course Collection - Main course information
{
  _id: ObjectId,
  title: String,                    // "Complete Sanskrit Pronunciation Guide"
  description: String,              // Detailed course description
  shortDescription: String,         // Brief overview for cards
  
  // Instructor Information
  instructor: {
    guruId: ObjectId,              // Reference to User with role 'guru'
    name: String,                  // "Pandit Ravi Sharma"
    credentials: String,           // "PhD Sanskrit, 20 years experience"
    avatar: String,                // Cloudinary URL
    bio: String,                   // Detailed instructor biography
    specializations: [String]      // ["Vedic Chanting", "Pronunciation"]
  },
  
  // Hierarchical Course Structure
  structure: {
    units: [{
      unitId: String,              // "unit_001"
      title: String,               // "Basic Pronunciation Fundamentals"
      description: String,         // Unit overview
      order: Number,               // Display order
      estimatedDuration: Number,   // Total minutes for unit
      
      lessons: [{
        lessonId: String,          // "lesson_001_001"
        title: String,             // "Introduction to Sanskrit Vowels"
        description: String,       // Lesson overview
        order: Number,             // Display order within unit
        estimatedDuration: Number, // Minutes for this lesson
        
        lectures: [{
          lectureId: String,       // "lecture_001"
          title: String,           // "Short Vowels (Hrasva Swar)"
          description: String,     // Lecture description
          order: Number,           // Display order within lesson
          
          content: {
            // Media Content
            videoUrl: String,      // Primary video content (Cloudinary)
            audioUrl: String,      // Audio-only version (optional)
            thumbnailUrl: String,  // Video thumbnail
            duration: Number,      // Content duration in seconds
            
            // Supporting Materials
            materials: [{
              type: String,        // 'pdf', 'audio', 'image', 'text'
              title: String,       // "Vowel Practice Sheet"
              description: String,
              url: String,         // Cloudinary URL
              fileSize: Number,    // In bytes
              downloadable: Boolean
            }],
            
            // Interactive Elements
            transcript: String,    // Video/audio transcript
            keyPoints: [String],   // Important takeaways
            vocabulary: [{         // Sanskrit terms introduced
              term: String,        // Sanskrit word
              pronunciation: String, // IAST/phonetic
              meaning: String      // English meaning
            }]
          },
          
          // Lecture Metadata
          metadata: {
            difficulty: String,    // 'beginner', 'intermediate', 'advanced'
            tags: [String],        // ['pronunciation', 'vowels', 'basics']
            prerequisites: [String], // Previous lecture IDs required
            objectives: [String]   // Learning objectives
          }
        }]
      }]
    }],
    
    // Overall Structure Metadata
    totalUnits: Number,
    totalLessons: Number,
    totalLectures: Number,
    totalDuration: Number,         // Total course minutes
    estimatedCompletionWeeks: Number
  },
  
  // Pricing Configuration
  pricing: {
    oneTime: {
      amount: Number,              // ₹500
      currency: String,            // "INR"
      originalPrice: Number        // For discount display
    },
    subscription: {
      monthly: {
        amount: Number,            // ₹480
        currency: String,          // "INR"
        savings: Number            // ₹20 saved vs one-time
      },
      yearly: {
        amount: Number,            // ₹4800
        currency: String,          // "INR"
        savings: Number            // ₹1200 saved vs monthly
      }
    },
    
    // Discount Management
    discounts: [{
      code: String,                // "DIWALI25"
      type: String,                // 'percentage' or 'fixed'
      value: Number,               // 25 (for 25% off) or 100 (for ₹100 off)
      validFrom: Date,
      validUntil: Date,
      maxUses: Number,
      currentUses: Number,
      applicableToSubscription: Boolean
    }]
  },
  
  // Course Metadata
  metadata: {
    category: [String],            // ['vedic_chanting', 'pronunciation']
    tags: [String],                // ['beginner', 'sanskrit', 'vowels']
    difficulty: String,            // Overall course difficulty
    language: {
      instruction: String,         // 'english', 'hindi', 'sanskrit'
      content: String              // 'sanskrit', 'mixed'
    },
    prerequisites: [String],       // Required knowledge/courses
    targetAudience: String,        // "Complete beginners to Sanskrit"
    learningOutcomes: [String],    // What students will achieve
    
    // Content Guidelines
    isActive: Boolean,
    featured: Boolean,
    isCertified: Boolean,         // Offers completion certificate
    certificateTemplate: String   // Template ID for certificates
  },
  
  // Engagement Statistics
  stats: {
    enrollment: {
      total: Number,              // Total enrollments
      oneTime: Number,            // One-time purchases
      monthly: Number,            // Monthly subscribers
      yearly: Number              // Yearly subscribers
    },
    
    ratings: {
      average: Number,            // 4.5
      count: Number,              // Total ratings
      distribution: {
        five: Number,             // Count of 5-star ratings
        four: Number,
        three: Number,
        two: Number,
        one: Number
      }
    },
    
    engagement: {
      averageCompletionRate: Number, // Percentage
      averageWatchTime: Number,      // Minutes per student
      totalWatchTime: Number,        // Total across all students
      mostPopularLecture: String,    // Lecture ID
      dropoffPoints: [String]        // Lecture IDs where students drop off
    },
    
    revenue: {
      total: Number,              // Total earnings for guru
      thisMonth: Number,          // Current month earnings
      platformShare: Number,      // Platform's 20% cut
      lastUpdated: Date
    }
  },
  
  // Publishing Information
  publishing: {
    status: String,               // 'draft', 'published', 'archived'
    publishedAt: Date,
    lastModified: Date,
    version: String,              // "1.0", "1.1", etc.
    changeLog: [{
      version: String,
      changes: String,
      modifiedAt: Date,
      modifiedBy: ObjectId
    }]
  },
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### **Student Enrollment & Progress Tracking**

```javascript
// Enrollment Collection - Track individual course enrollments
{
  _id: ObjectId,
  studentId: ObjectId,            // Reference to User
  courseId: ObjectId,             // Reference to Course
  guruId: ObjectId,               // Reference to Course Instructor
  
  // Enrollment Details
  enrollmentType: String,         // 'one_time', 'monthly_sub', 'yearly_sub'
  enrolledAt: Date,
  source: String,                 // 'web', 'mobile', 'referral'
  
  // Payment Information
  payment: {
    transactionId: String,        // Razorpay payment ID
    orderId: String,              // Razorpay order ID
    amount: Number,               // Amount paid
    currency: String,             // "INR"
    method: String,               // 'card', 'netbanking', 'wallet', 'upi'
    status: String,               // 'completed', 'failed', 'pending'
    paidAt: Date,
    
    // Razorpay Response Data
    razorpayData: {
      paymentId: String,
      signature: String,
      orderId: String,
      method: String,
      amount: Number,
      currency: String
    },
    
    // Discount Applied
    discount: {
      code: String,
      type: String,
      value: Number,
      savings: Number
    }
  },
  
  // Access Control
  access: {
    startDate: Date,
    endDate: Date,                // null for one-time purchases
    isActive: Boolean,
    suspendedAt: Date,            // If access suspended
    suspensionReason: String
  },
  
  // Learning Progress
  progress: {
    // Completion Tracking
    completedUnits: [{
      unitId: String,
      completedAt: Date,
      timeSpent: Number           // Minutes
    }],
    
    completedLessons: [{
      lessonId: String,
      unitId: String,
      completedAt: Date,
      timeSpent: Number,
      score: Number               // If lesson has quiz
    }],
    
    completedLectures: [{
      lectureId: String,
      lessonId: String,
      unitId: String,
      completedAt: Date,
      watchTime: Number,          // Seconds watched
      totalDuration: Number,      // Total lecture duration
      watchPercentage: Number,    // Percentage watched
      notes: String               // Student notes for this lecture
    }],
    
    // Overall Progress
    overallProgress: Number,      // Percentage (0-100)
    currentUnit: String,          // Current unit ID
    currentLesson: String,        // Current lesson ID
    currentLecture: String,       // Current lecture ID
    
    // Engagement Metrics
    totalTimeSpent: Number,       // Total minutes in course
    sessionsCount: Number,        // Number of learning sessions
    averageSessionDuration: Number, // Average minutes per session
    lastAccessed: Date,
    longestStreakDays: Number,
    currentStreakDays: Number,
    lastActiveDate: Date
  },
  
  // Performance Analytics
  performance: {
    // Learning Efficiency
    averageWatchSpeed: Number,    // Playback speed preference
    preferredLearningTime: String, // 'morning', 'afternoon', 'evening'
    devicePreference: String,     // 'mobile', 'tablet', 'desktop'
    
    // Engagement Patterns
    weeklyProgress: [{
      week: Date,                 // Week starting date
      minutesWatched: Number,
      lecturesCompleted: Number,
      loginDays: Number
    }],
    
    // Areas of Focus
    strugglingTopics: [{
      topic: String,              // Topic where student is struggling
      lectureId: String,
      attempts: Number,           // Number of times watched
      lastAttempt: Date
    }],
    
    masteredTopics: [{
      topic: String,              // Topic student has mastered
      lectureId: String,
      masteryDate: Date,
      score: Number
    }]
  },
  
  // Course Interaction
  interaction: {
    // Comments and Questions
    comments: [{
      lectureId: String,
      content: String,
      createdAt: Date,
      replies: [{
        fromGuru: Boolean,
        content: String,
        createdAt: Date
      }]
    }],
    
    // Course Rating
    rating: {
      stars: Number,              // 1-5
      review: String,
      ratedAt: Date,
      helpful: Number             // How many found this review helpful
    },
    
    // Bookmarks
    bookmarks: [{
      lectureId: String,
      timestamp: Number,          // Seconds into video
      note: String,
      createdAt: Date
    }]
  },
  
  // Completion & Certification
  completion: {
    isCompleted: Boolean,
    completedAt: Date,
    completionTime: Number,       // Days taken to complete
    finalScore: Number,           // Overall course score
    
    certificate: {
      issued: Boolean,
      issuedAt: Date,
      certificateId: String,      // Unique certificate identifier
      certificateUrl: String,     // PDF download URL
      verificationUrl: String     // Public verification link
    }
  },
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### **Subscription Management System**

```javascript
// Subscription Collection - Guru-specific subscriptions
{
  _id: ObjectId,
  studentId: ObjectId,
  guruId: ObjectId,
  
  // Subscription Plan Details
  plan: {
    type: String,                 // 'monthly', 'yearly'
    amount: Number,               // Monthly/yearly amount
    currency: String,             // "INR"
    billingCycle: String          // 'monthly', 'yearly'
  },
  
  // Subscription Status
  status: String,                 // 'active', 'cancelled', 'expired', 'suspended'
  
  // Billing Information
  billing: {
    razorpaySubscriptionId: String, // Razorpay subscription ID
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    nextBillingDate: Date,
    
    // Payment History
    payments: [{
      paymentId: String,
      amount: Number,
      status: String,             // 'success', 'failed'
      paidAt: Date,
      failureReason: String
    }],
    
    // Billing Address
    billingAddress: {
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      pincode: String
    }
  },
  
  // Usage Analytics
  usage: {
    coursesAccessed: [{
      courseId: ObjectId,
      firstAccessed: Date,
      lastAccessed: Date,
      totalTimeSpent: Number,     // Minutes
      completionPercentage: Number
    }],
    
    totalCourses: Number,         // Total courses available from guru
    accessedCourses: Number,      // Courses student has accessed
    completedCourses: Number,     // Courses student has completed
    
    monthlyUsage: [{
      month: Date,                // Month start
      minutesWatched: Number,
      coursesAccessed: Number,
      sessionsCount: Number
    }]
  },
  
  // Subscription Management
  management: {
    autoRenewal: Boolean,
    cancellationRequested: Boolean,
    cancellationDate: Date,
    cancellationReason: String,
    
    // Plan Changes
    planChangeHistory: [{
      fromPlan: String,
      toPlan: String,
      changedAt: Date,
      prorationAmount: Number
    }],
    
    // Pause/Resume
    pauseHistory: [{
      pausedAt: Date,
      resumedAt: Date,
      reason: String
    }]
  },
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  
  // Virtual field for days remaining
  get daysRemaining() {
    const now = new Date();
    const end = new Date(this.billing.currentPeriodEnd);
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  }
}
```

---

## 🔧 **API Architecture**

### **Course Management APIs**

#### **Course Creation & Management**
```javascript
// POST /api/v1/courses - Create new course
{
  authentication: "Guru role required",
  body: {
    title: String,
    description: String,
    shortDescription: String,
    category: [String],
    tags: [String],
    difficulty: String,
    pricing: {
      oneTime: Number,
      monthly: Number,
      yearly: Number
    }
  },
  response: {
    success: Boolean,
    courseId: String,
    message: String
  }
}

// POST /api/v1/courses/:courseId/units - Add unit to course
{
  authentication: "Course owner required",
  params: { courseId: String },
  body: {
    title: String,
    description: String,
    order: Number
  },
  response: {
    success: Boolean,
    unitId: String,
    message: String
  }
}

// POST /api/v1/courses/:courseId/units/:unitId/lessons - Add lesson to unit
{
  authentication: "Course owner required",
  params: { courseId: String, unitId: String },
  body: {
    title: String,
    description: String,
    order: Number,
    estimatedDuration: Number
  },
  response: {
    success: Boolean,
    lessonId: String,
    message: String
  }
}

// POST /api/v1/courses/:courseId/lectures - Add lecture to lesson
{
  authentication: "Course owner required",
  params: { courseId: String },
  body: {
    unitId: String,
    lessonId: String,
    title: String,
    description: String,
    order: Number,
    videoFile: File,        // Multer upload
    materials: [File],      // Supporting files
    transcript: String,
    keyPoints: [String]
  },
  response: {
    success: Boolean,
    lectureId: String,
    videoUrl: String,
    message: String
  }
}
```

#### **Content Discovery & Access**
```javascript
// GET /api/v1/courses - Browse courses with filtering
{
  queryParams: {
    page: Number,           // Pagination
    limit: Number,
    category: String,       // Filter by category
    difficulty: String,     // Filter by difficulty
    guruId: String,         // Filter by guru
    priceMin: Number,       // Price range
    priceMax: Number,
    search: String,         // Search in title/description
    sort: String            // 'newest', 'popular', 'rating', 'price'
  },
  response: {
    success: Boolean,
    courses: [{
      courseId: String,
      title: String,
      description: String,
      instructor: Object,
      pricing: Object,
      stats: Object,
      thumbnail: String
    }],
    pagination: {
      currentPage: Number,
      totalPages: Number,
      totalCourses: Number
    }
  }
}

// GET /api/v1/courses/:courseId - Get detailed course information
{
  authentication: "Optional - affects response detail",
  params: { courseId: String },
  response: {
    success: Boolean,
    course: {
      // Full course details if enrolled/preview for non-enrolled
      basicInfo: Object,
      structure: Object,     // Full if enrolled, limited if not
      enrollment: Object,    // User's enrollment status
      access: Object         // User's access permissions
    }
  }
}

// GET /api/v1/courses/:courseId/content/:lectureId - Stream lecture content
{
  authentication: "Required with valid enrollment",
  params: { courseId: String, lectureId: String },
  headers: { 
    "Range": "bytes=0-1024"  // For video streaming
  },
  response: {
    // Streamed video content with appropriate headers
    "Content-Type": "video/mp4",
    "Content-Length": String,
    "Accept-Ranges": "bytes",
    "Content-Range": "bytes 0-1024/total"
  }
}
```

### **Enrollment & Payment APIs**

#### **Course Purchase Flow**
```javascript
// POST /api/v1/payments/orders - Create payment order
{
  authentication: "Student role required",
  body: {
    courseId: String,
    type: String,           // 'one_time', 'monthly_sub', 'yearly_sub'
    discountCode: String    // Optional
  },
  response: {
    success: Boolean,
    order: {
      orderId: String,      // Razorpay order ID
      amount: Number,
      currency: String,
      courseDetails: Object,
      discountApplied: Object
    },
    razorpayKey: String     // Public key for frontend
  }
}

// POST /api/v1/payments/verify - Verify payment and create enrollment
{
  authentication: "Student role required",
  body: {
    orderId: String,
    paymentId: String,
    signature: String,
    courseId: String,
    enrollmentType: String
  },
  response: {
    success: Boolean,
    enrollment: {
      enrollmentId: String,
      courseId: String,
      accessStartDate: Date,
      accessEndDate: Date,
      status: String
    },
    message: String
  }
}

// GET /api/v1/enrollments/my - Get student's enrollments
{
  authentication: "Student role required",
  queryParams: {
    status: String,         // 'active', 'completed', 'expired'
    page: Number,
    limit: Number
  },
  response: {
    success: Boolean,
    enrollments: [{
      courseId: String,
      courseTitle: String,
      instructor: Object,
      progress: Number,
      enrollmentType: String,
      status: String,
      nextToWatch: String   // Next lecture to continue
    }],
    pagination: Object
  }
}
```

#### **Subscription Management**
```javascript
// POST /api/v1/subscriptions - Create guru subscription
{
  authentication: "Student role required",
  body: {
    guruId: String,
    plan: String,           // 'monthly', 'yearly'
    discountCode: String    // Optional
  },
  response: {
    success: Boolean,
    subscription: {
      subscriptionId: String,
      guruId: String,
      plan: String,
      amount: Number,
      nextBillingDate: Date,
      coursesIncluded: Number
    }
  }
}

// PUT /api/v1/subscriptions/:subscriptionId - Manage subscription
{
  authentication: "Subscription owner required",
  params: { subscriptionId: String },
  body: {
    action: String,         // 'cancel', 'pause', 'resume', 'change_plan'
    reason: String,         // For cancellation
    newPlan: String        // For plan changes
  },
  response: {
    success: Boolean,
    subscription: Object,
    message: String
  }
}
```

### **Progress Tracking APIs**

#### **Learning Progress Management**
```javascript
// POST /api/v1/progress/update - Update learning progress
{
  authentication: "Student with course access required",
  body: {
    courseId: String,
    lectureId: String,
    action: String,         // 'start', 'progress', 'complete'
    watchTime: Number,      // Seconds watched
    totalDuration: Number,  // Total lecture duration
    notes: String           // Optional student notes
  },
  response: {
    success: Boolean,
    progress: {
      lectureProgress: Number,    // Percentage for this lecture
      lessonProgress: Number,     // Percentage for current lesson
      unitProgress: Number,       // Percentage for current unit
      overallProgress: Number,    // Overall course percentage
      nextToWatch: String        // Next recommended lecture
    }
  }
}

// GET /api/v1/progress/:courseId - Get detailed progress
{
  authentication: "Student with course access required",
  params: { courseId: String },
  response: {
    success: Boolean,
    progress: {
      overall: Number,
      byUnit: [{
        unitId: String,
        unitTitle: String,
        progress: Number,
        completedLessons: Number,
        totalLessons: Number
      }],
      recentActivity: [{
        lectureId: String,
        lectureTitle: String,
        watchedAt: Date,
        watchTime: Number
      }],
      achievements: [{
        type: String,
        earnedAt: Date,
        description: String
      }]
    },
    analytics: {
      totalTimeSpent: Number,
      averageSessionDuration: Number,
      currentStreak: Number,
      longestStreak: Number
    }
  }
}

// POST /api/v1/progress/bookmark - Bookmark lecture moment
{
  authentication: "Student with course access required",
  body: {
    courseId: String,
    lectureId: String,
    timestamp: Number,      // Seconds into video
    note: String           // Optional note
  },
  response: {
    success: Boolean,
    bookmark: {
      bookmarkId: String,
      timestamp: Number,
      note: String,
      createdAt: Date
    }
  }
}
```

### **Content Interaction APIs**

#### **Comments & Q&A System**
```javascript
// POST /api/v1/courses/:courseId/comments - Add comment to lecture
{
  authentication: "Student with course access required",
  params: { courseId: String },
  body: {
    lectureId: String,
    content: String,
    timestamp: Number       // Optional - for time-specific comments
  },
  response: {
    success: Boolean,
    comment: {
      commentId: String,
      content: String,
      author: Object,
      createdAt: Date,
      timestamp: Number
    }
  }
}

// GET /api/v1/courses/:courseId/comments/:lectureId - Get lecture comments
{
  authentication: "Student with course access required",
  params: { courseId: String, lectureId: String },
  queryParams: {
    page: Number,
    limit: Number,
    sort: String            // 'newest', 'oldest', 'timestamp'
  },
  response: {
    success: Boolean,
    comments: [{
      commentId: String,
      content: String,
      author: Object,
      createdAt: Date,
      timestamp: Number,
      replies: [{
        replyId: String,
        content: String,
        author: Object,
        fromGuru: Boolean,
        createdAt: Date
      }]
    }],
    pagination: Object
  }
}

// POST /api/v1/courses/:courseId/comments/:commentId/reply - Reply to comment
{
  authentication: "Course access required (student) or course owner (guru)",
  params: { courseId: String, commentId: String },
  body: {
    content: String
  },
  response: {
    success: Boolean,
    reply: {
      replyId: String,
      content: String,
      author: Object,
      fromGuru: Boolean,
      createdAt: Date
    }
  }
}

// POST /api/v1/courses/:courseId/rating - Rate course
{
  authentication: "Student with course access required",
  params: { courseId: String },
  body: {
    rating: Number,         // 1-5 stars
    review: String          // Optional written review
  },
  response: {
    success: Boolean,
    rating: {
      stars: Number,
      review: String,
      ratedAt: Date
    },
    courseStats: {
      averageRating: Number,
      totalRatings: Number
    }
  }
}
```

---

## 🔐 **Authentication & Authorization**

### **Enhanced User Roles & Permissions**

```javascript
// User Model Enhancement for LMS
const userSchema = {
  // ... existing user fields ...
  
  role: {
    type: String,
    enum: ['student', 'guru', 'admin'],
    default: 'student'
  },
  
  // Guru-specific fields
  guruProfile: {
    applicationStatus: {
      type: String,
      enum: ['not_applied', 'pending', 'approved', 'rejected'],
      default: 'not_applied'
    },
    
    credentials: [{
      type: String,           // 'degree', 'certificate', 'experience'
      title: String,          // "PhD in Sanskrit Literature"
      institution: String,    // "Banaras Hindu University"
      year: Number,
      documentUrl: String     // Uploaded certificate/proof
    }],
    
    experience: {
      years: Number,
      description: String,
      previousInstitutions: [String],
      specializations: [String]
    },
    
    verification: {
      isVerified: Boolean,
      verifiedBy: ObjectId,   // Admin who verified
      verifiedAt: Date,
      verificationNotes: String
    },
    
    teachingStats: {
      totalStudents: Number,
      totalCourses: Number,
      averageRating: Number,
      totalEarnings: Number,
      coursesCompleted: Number
    }
  },
  
  // Student-specific fields
  studentProfile: {
    learningGoals: [String],
    currentLevel: String,     // 'beginner', 'intermediate', 'advanced'
    interests: [String],
    preferredLanguages: [String],
    
    subscriptions: [{
      guruId: ObjectId,
      plan: String,
      status: String,
      subscribedAt: Date
    }],
    
    learningStats: {
      totalCoursesEnrolled: Number,
      totalCoursesCompleted: Number,
      totalLearningHours: Number,
      currentStreak: Number,
      longestStreak: Number,
      certificatesEarned: Number
    }
  }
};
```

### **Middleware for Access Control**

```javascript
// Course Access Middleware
const checkCourseAccess = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    // Check if user has access through enrollment or subscription
    const enrollment = await Enrollment.findOne({
      studentId: userId,
      courseId: courseId,
      'access.isActive': true
    });
    
    if (enrollment) {
      // Check if enrollment is still valid
      const now = new Date();
      if (enrollment.access.endDate && now > enrollment.access.endDate) {
        return res.status(403).json({
          success: false,
          message: 'Course access has expired'
        });
      }
      req.enrollment = enrollment;
      return next();
    }
    
    // Check for active subscription to course guru
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    const subscription = await Subscription.findOne({
      studentId: userId,
      guruId: course.instructor.guruId,
      status: 'active'
    });
    
    if (subscription) {
      // Check if subscription is still valid
      const now = new Date();
      if (now > subscription.billing.currentPeriodEnd) {
        return res.status(403).json({
          success: false,
          message: 'Subscription has expired'
        });
      }
      req.subscription = subscription;
      return next();
    }
    
    // No access found
    return res.status(403).json({
      success: false,
      message: 'You do not have access to this course'
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking course access',
      error: error.message
    });
  }
};

// Guru Content Owner Middleware
const checkCourseOwnership = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    if (course.instructor.guruId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not own this course'
      });
    }
    
    req.course = course;
    next();
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking course ownership',
      error: error.message
    });
  }
};

// Admin Role Check Middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Guru Role Check Middleware
const requireGuru = (req, res, next) => {
  if (req.user.role !== 'guru') {
    return res.status(403).json({
      success: false,
      message: 'Guru access required'
    });
  }
  
  if (req.user.guruProfile.verification.isVerified !== true) {
    return res.status(403).json({
      success: false,
      message: 'Guru verification required'
    });
  }
  
  next();
};
```

---

## 💳 **Payment Integration with Razorpay**

### **Payment Controller Implementation**

```javascript
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Payment Order
const createPaymentOrder = async (req, res) => {
  try {
    const { courseId, type, discountCode } = req.body;
    const userId = req.user.id;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Calculate final amount with discounts
    let amount;
    switch (type) {
      case 'one_time':
        amount = course.pricing.oneTime.amount;
        break;
      case 'monthly_sub':
        amount = course.pricing.subscription.monthly.amount;
        break;
      case 'yearly_sub':
        amount = course.pricing.subscription.yearly.amount;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid payment type'
        });
    }
    
    // Apply discount if provided
    let discountApplied = null;
    if (discountCode) {
      const discount = course.pricing.discounts.find(
        d => d.code === discountCode && 
        new Date() >= d.validFrom && 
        new Date() <= d.validUntil &&
        d.currentUses < d.maxUses
      );
      
      if (discount) {
        if (discount.type === 'percentage') {
          amount = amount * (1 - discount.value / 100);
        } else {
          amount = Math.max(0, amount - discount.value);
        }
        discountApplied = discount;
      }
    }
    
    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paisa
      currency: 'INR',
      receipt: `course_${courseId}_${userId}_${Date.now()}`,
      payment_capture: 1
    };
    
    const order = await razorpay.orders.create(options);
    
    // Store order details temporarily
    const orderDetails = {
      orderId: order.id,
      courseId: courseId,
      userId: userId,
      type: type,
      amount: amount,
      originalAmount: course.pricing[type === 'one_time' ? 'oneTime' : 'subscription'].amount,
      discountApplied: discountApplied,
      createdAt: new Date()
    };
    
    // You might want to store this in Redis or a temporary collection
    // For now, we'll include it in the response
    
    res.status(200).json({
      success: true,
      order: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        courseDetails: {
          courseId: course._id,
          title: course.title,
          instructor: course.instructor.name
        },
        discountApplied: discountApplied
      },
      razorpayKey: process.env.RAZORPAY_KEY_ID
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: error.message
    });
  }
};

// Verify Payment and Create Enrollment
const verifyPayment = async (req, res) => {
  try {
    const { 
      orderId, 
      paymentId, 
      signature, 
      courseId, 
      enrollmentType 
    } = req.body;
    
    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + '|' + paymentId)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }
    
    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);
    
    if (payment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: 'Payment not captured'
      });
    }
    
    // Create enrollment
    const enrollment = await Enrollment.create({
      studentId: req.user.id,
      courseId: courseId,
      guruId: payment.notes.guruId, // Should be included in order
      enrollmentType: enrollmentType,
      payment: {
        transactionId: paymentId,
        orderId: orderId,
        amount: payment.amount / 100, // Convert from paisa
        currency: payment.currency,
        method: payment.method,
        status: 'completed',
        paidAt: new Date(payment.created_at * 1000),
        razorpayData: {
          paymentId: payment.id,
          signature: signature,
          orderId: orderId,
          method: payment.method,
          amount: payment.amount,
          currency: payment.currency
        }
      },
      access: {
        startDate: new Date(),
        endDate: enrollmentType === 'one_time' ? null : getSubscriptionEndDate(enrollmentType),
        isActive: true
      }
    });
    
    // Update course enrollment statistics
    await Course.findByIdAndUpdate(courseId, {
      $inc: { 
        'stats.enrollment.total': 1,
        [`stats.enrollment.${enrollmentType}`]: 1
      }
    });
    
    res.status(200).json({
      success: true,
      enrollment: {
        enrollmentId: enrollment._id,
        courseId: enrollment.courseId,
        accessStartDate: enrollment.access.startDate,
        accessEndDate: enrollment.access.endDate,
        status: 'active'
      },
      message: 'Payment verified and enrollment created successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

// Helper function to calculate subscription end date
const getSubscriptionEndDate = (type) => {
  const now = new Date();
  switch (type) {
    case 'monthly_sub':
      return new Date(now.setMonth(now.getMonth() + 1));
    case 'yearly_sub':
      return new Date(now.setFullYear(now.getFullYear() + 1));
    default:
      return null;
  }
};
```

---

## 📁 **File Upload & Content Management**

### **Cloudinary Integration for Course Content**

```javascript
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer configuration for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1024 // 1GB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow videos, audio, and documents
    const allowedMimes = [
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'audio/mp3', 'audio/wav', 'audio/aac',
      'application/pdf',
      'image/jpeg', 'image/png'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  }
});

// Upload video content
const uploadVideoContent = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }
    
    const { courseId, unitId, lessonId } = req.body;
    
    // Verify course ownership
    const course = await Course.findById(courseId);
    if (!course || course.instructor.guruId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to upload to this course'
      });
    }
    
    // Upload to Cloudinary with video optimization
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: `shlokayug/courses/${courseId}/videos`,
          public_id: `${unitId}_${lessonId}_${Date.now()}`,
          video_codec: 'h264',
          quality: 'auto',
          format: 'mp4',
          transformation: [
            { video_codec: 'h264' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(req.file.buffer);
    });
    
    // Generate thumbnail
    const thumbnailUrl = cloudinary.url(uploadResult.public_id, {
      resource_type: 'video',
      transformation: [
        { width: 640, height: 360, crop: 'fill' },
        { quality: 'auto' },
        { format: 'jpg' }
      ]
    });
    
    res.status(200).json({
      success: true,
      upload: {
        videoUrl: uploadResult.secure_url,
        thumbnailUrl: thumbnailUrl,
        duration: uploadResult.duration,
        fileSize: uploadResult.bytes,
        publicId: uploadResult.public_id
      },
      message: 'Video uploaded successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading video',
      error: error.message
    });
  }
};

// Stream video content with access control
const streamVideoContent = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const range = req.headers.range;
    
    // Verify user has access to this course
    // (This middleware should be applied before this controller)
    
    // Get lecture details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Find the specific lecture
    let lecture = null;
    for (const unit of course.structure.units) {
      for (const lesson of unit.lessons) {
        const foundLecture = lesson.lectures.find(l => l.lectureId === lectureId);
        if (foundLecture) {
          lecture = foundLecture;
          break;
        }
      }
      if (lecture) break;
    }
    
    if (!lecture || !lecture.content.videoUrl) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }
    
    // For streaming, redirect to Cloudinary URL with signed access
    const signedUrl = cloudinary.utils.private_download_url(
      lecture.content.publicId,
      'video',
      {
        expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour
      }
    );
    
    // Log access for analytics
    await logLectureAccess(req.user.id, courseId, lectureId);
    
    res.redirect(signedUrl);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error streaming content',
      error: error.message
    });
  }
};

// Helper function to log lecture access
const logLectureAccess = async (userId, courseId, lectureId) => {
  try {
    const enrollment = await Enrollment.findOne({
      studentId: userId,
      courseId: courseId
    });
    
    if (enrollment) {
      // Update last accessed
      enrollment.progress.lastAccessed = new Date();
      
      // Log this lecture access
      const existingLecture = enrollment.progress.completedLectures
        .find(l => l.lectureId === lectureId);
      
      if (!existingLecture) {
        enrollment.progress.completedLectures.push({
          lectureId: lectureId,
          lessonId: '', // Will be populated
          unitId: '',   // Will be populated
          completedAt: null, // Not completed yet, just accessed
          watchTime: 0,
          totalDuration: 0,
          watchPercentage: 0
        });
      }
      
      await enrollment.save();
    }
  } catch (error) {
    console.error('Error logging lecture access:', error);
  }
};
```

---

## 🎯 **Admin Panel APIs**

### **Guru Management System**

```javascript
// Admin Controller for Guru Management
const adminController = {
  
  // Get pending guru applications
  getPendingGurus: async (req, res) => {
    try {
      const pendingGurus = await User.find({
        'guruProfile.applicationStatus': 'pending'
      }).select('email username profile guruProfile createdAt');
      
      res.status(200).json({
        success: true,
        pendingApplications: pendingGurus.map(guru => ({
          userId: guru._id,
          username: guru.username,
          email: guru.email,
          name: `${guru.profile.firstName} ${guru.profile.lastName}`,
          credentials: guru.guruProfile.credentials,
          experience: guru.guruProfile.experience,
          appliedAt: guru.createdAt
        }))
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching pending applications',
        error: error.message
      });
    }
  },
  
  // Approve or reject guru application
  reviewGuruApplication: async (req, res) => {
    try {
      const { userId } = req.params;
      const { action, notes } = req.body; // 'approve' or 'reject'
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      if (action === 'approve') {
        user.role = 'guru';
        user.guruProfile.applicationStatus = 'approved';
        user.guruProfile.verification.isVerified = true;
        user.guruProfile.verification.verifiedBy = req.user.id;
        user.guruProfile.verification.verifiedAt = new Date();
        user.guruProfile.verification.verificationNotes = notes;
        
        // Send approval email
        // await sendGuruApprovalEmail(user.email, user.profile.firstName);
        
      } else if (action === 'reject') {
        user.guruProfile.applicationStatus = 'rejected';
        user.guruProfile.verification.verificationNotes = notes;
        
        // Send rejection email
        // await sendGuruRejectionEmail(user.email, user.profile.firstName, notes);
      }
      
      await user.save();
      
      res.status(200).json({
        success: true,
        message: `Guru application ${action}d successfully`,
        guru: {
          userId: user._id,
          username: user.username,
          status: user.guruProfile.applicationStatus,
          verifiedAt: user.guruProfile.verification.verifiedAt
        }
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error reviewing application',
        error: error.message
      });
    }
  },
  
  // Get platform analytics
  getPlatformAnalytics: async (req, res) => {
    try {
      const { timeframe = '30d' } = req.query;
      
      // Calculate date range
      const now = new Date();
      let startDate;
      switch (timeframe) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      // Aggregate various statistics
      const [
        userStats,
        courseStats,
        enrollmentStats,
        revenueStats
      ] = await Promise.all([
        
        // User statistics
        User.aggregate([
          {
            $group: {
              _id: '$role',
              count: { $sum: 1 }
            }
          }
        ]),
        
        // Course statistics
        Course.aggregate([
          {
            $group: {
              _id: null,
              totalCourses: { $sum: 1 },
              publishedCourses: {
                $sum: { $cond: ['$publishing.status', 'published', 1, 0] }
              },
              averageRating: { $avg: '$stats.ratings.average' }
            }
          }
        ]),
        
        // Enrollment statistics
        Enrollment.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: '$enrollmentType',
              count: { $sum: 1 },
              totalRevenue: { $sum: '$payment.amount' }
            }
          }
        ]),
        
        // Revenue statistics
        Enrollment.aggregate([
          {
            $match: {
              'payment.status': 'completed',
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt'
                }
              },
              dailyRevenue: { $sum: '$payment.amount' },
              enrollments: { $sum: 1 }
            }
          },
          { $sort: { '_id': 1 } }
        ])
      ]);
      
      // Format response
      const analytics = {
        users: {
          total: userStats.reduce((sum, stat) => sum + stat.count, 0),
          byRole: userStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {})
        },
        
        courses: courseStats[0] || {
          totalCourses: 0,
          publishedCourses: 0,
          averageRating: 0
        },
        
        enrollments: {
          byType: enrollmentStats,
          totalInPeriod: enrollmentStats.reduce((sum, stat) => sum + stat.count, 0)
        },
        
        revenue: {
          timeline: revenueStats,
          totalInPeriod: revenueStats.reduce((sum, stat) => sum + stat.dailyRevenue, 0),
          platformShare: revenueStats.reduce((sum, stat) => sum + (stat.dailyRevenue * 0.2), 0)
        },
        
        timeframe: timeframe,
        generatedAt: new Date()
      };
      
      res.status(200).json({
        success: true,
        analytics: analytics
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching analytics',
        error: error.message
      });
    }
  }
};
```

---

This technical implementation guide provides the complete backend architecture for the ShlokaYug LMS system. The implementation covers all major components including course management, payment processing, content delivery, progress tracking, and administrative functions.

*Technical Implementation Guide - ShlokaYug LMS*  
*Version 1.0 - November 20, 2025*  
*Ready for Development Implementation*