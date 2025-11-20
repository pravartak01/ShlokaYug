# ShlokaYug Learning Management System (LMS) - Requirements Documentation

## 📚 **System Overview**

ShlokaYug LMS is a specialized Sanskrit learning platform connecting **Gurus (Teachers)** with **Shishyas (Students)** through structured courses, interactive content, and flexible payment options. The platform focuses on authentic Sanskrit pronunciation, shloka teachings, and cultural knowledge transmission.

---

## 👥 **User Roles & Permissions**

### **1. Shishya (Student)**
- **Primary Goal**: Learn Sanskrit, pronunciation, and shloka meanings
- **Access Levels**:
  - **Free Tier**: Basic features (shloka recognition, chandas analysis, shorts/reels)
  - **Paid Tier**: Full course access based on purchase/subscription
- **Capabilities**:
  - Browse and preview courses
  - Purchase individual courses or subscribe to gurus
  - Track learning progress and earn certificates
  - Interact with gurus via comments/Q&A
  - Rate and review courses

### **2. Guru (Teacher)**
- **Primary Goal**: Share Sanskrit knowledge and earn revenue
- **Access Requirements**: Admin verification via certifications
- **Capabilities**:
  - Create and upload structured courses
  - Upload videos, audio, and PDF materials
  - Set course pricing and discount coupons
  - View analytics and revenue reports
  - Interact with students via comments/Q&A
  - Manage course content and curriculum

### **3. Admin**
- **Primary Goal**: Platform management and quality control
- **Capabilities**:
  - Verify and approve new gurus
  - Monitor platform analytics
  - Manage user disputes and violations
  - Access revenue and content reports
  - Ban/suspend users when necessary

---

## 🏗️ **Course Structure Hierarchy**

### **Multi-Level Content Organization**
```
Course (Main Title)
├── Unit 1 (Thematic Section)
│   ├── Lesson 1.1 (Specific Topic)
│   │   ├── Lecture 1 (Video/Audio Content)
│   │   ├── Lecture 2 (Video/Audio Content)
│   │   └── Lecture 3 (Video/Audio Content)
│   ├── Lesson 1.2 (Specific Topic)
│   │   ├── Lecture 1
│   │   └── Lecture 2
├── Unit 2 (Thematic Section)
│   └── Lesson 2.1
│       └── Lecture 1
└── Unit 3 (Thematic Section)
    └── ...
```

### **Backend Data Structure**
```javascript
{
  courseId: "course_12345",
  title: "Complete Sanskrit Pronunciation Guide",
  instructor: {
    guruId: "guru_67890",
    name: "Pandit Ravi Sharma",
    credentials: "PhD Sanskrit, 20 years experience"
  },
  structure: {
    units: [
      {
        unitId: "unit_001",
        title: "Basic Pronunciation Fundamentals",
        order: 1,
        lessons: [
          {
            lessonId: "lesson_001_001",
            title: "Introduction to Sanskrit Vowels",
            order: 1,
            lectures: [
              {
                lectureId: "lecture_001",
                title: "Short Vowels (Hrasva Swar)",
                order: 1,
                content: {
                  videoUrl: "https://cloudinary.com/video1.mp4",
                  duration: 1200, // seconds
                  description: "Learn the correct pronunciation of short vowels",
                  materials: [
                    {
                      type: "pdf",
                      title: "Vowel Practice Sheet",
                      url: "https://cloudinary.com/vowel_sheet.pdf"
                    }
                  ]
                }
              },
              {
                lectureId: "lecture_002",
                title: "Long Vowels (Deergha Swar)",
                order: 2,
                content: { ... }
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

## 💰 **Payment & Pricing Model**

### **Revenue Sharing**
- **Platform**: 20% of all transactions
- **Guru**: 80% of all transactions
- **Payment Gateway**: Razorpay integration

### **Payment Options for Students**

#### **1. One-Time Course Purchase**
- **Access**: Single course only
- **Duration**: Lifetime access to purchased course
- **Pricing**: Set by individual guru
- **Best For**: Students wanting specific courses

#### **2. Monthly Subscription (Guru-Specific)**
- **Access**: All courses by that specific guru
- **Duration**: 30 days renewable
- **Pricing**: ₹20-30 less than one-time course price
- **Best For**: Students learning from favorite guru

#### **3. Yearly Subscription (Guru-Specific)**
- **Access**: All courses by that specific guru
- **Duration**: 365 days
- **Pricing**: ~10x monthly price with discount
- **Best For**: Dedicated long-term learners

### **Pricing Strategy Examples**
```
Guru: Pandit Ravi Sharma
Course: "Complete Sanskrit Pronunciation"

Option 1: One-time purchase - ₹500
Option 2: Monthly subscription (all courses) - ₹480/month
Option 3: Yearly subscription (all courses) - ₹4800/year

Guru: Acharya Priya Devi  
Course: "Bhagavad Gita Recitation"

Option 1: One-time purchase - ₹800
Option 2: Monthly subscription (all courses) - ₹780/month
Option 3: Yearly subscription (all courses) - ₹7800/year
```

### **Free vs Paid Content**

#### **Free Tier Access**
- ✅ Shloka recognition and analysis
- ✅ Chandas (meter) identification
- ✅ Basic pronunciation guidance
- ✅ Short videos/reels (promotional content)
- ✅ Community features (comments, discussions)

#### **Paid Tier Access**
- ✅ **Everything in Free Tier**
- ✅ Complete structured courses
- ✅ Detailed pronunciation tutorials
- ✅ Cultural context and meanings
- ✅ Progress tracking and certificates
- ✅ Direct guru interaction
- ✅ Downloadable study materials (PDFs)

---

## 🎯 **Core Features & Functionality**

### **For Students (Shishyas)**

#### **Course Discovery & Purchase**
- Browse courses by guru, difficulty, or topic
- Preview course structure and sample content
- Compare one-time vs subscription pricing
- Apply discount coupons from gurus
- Secure payment processing via Razorpay

#### **Learning Experience**
- Sequential unit → lesson → lecture progression
- Video streaming (no downloads for security)
- PDF study materials access
- Progress tracking with completion percentages
- Note-taking functionality within lessons
- Bookmark favorite lectures for quick access

#### **Community & Interaction**
- Comment on individual lectures
- Ask questions in Q&A sections
- Rate courses and provide feedback
- Share achievements and certificates
- Connect with fellow learners

#### **Progress & Achievements**
- Track completion across units/lessons/lectures
- Maintain learning streaks and statistics
- Earn certificates upon course completion
- View learning analytics and time spent
- Export progress reports

### **For Gurus (Teachers)**

#### **Content Creation & Management**
- Create courses with unlimited units/lessons/lectures
- Upload videos (any quality, no size limits)
- Add audio files for pronunciation guides
- Upload PDF materials and reference documents
- Organize content with drag-and-drop interface

#### **Course Configuration**
- Set course titles, descriptions, and learning objectives
- Configure prerequisites and recommended sequence
- Add course tags and difficulty levels
- Upload course thumbnails and promotional materials
- Set estimated completion time

#### **Pricing & Revenue**
- Set individual course pricing
- Create discount coupons with expiry dates
- Configure subscription pricing for their course catalog
- View real-time earnings and analytics
- Export revenue reports for tax purposes

#### **Student Interaction**
- Respond to student questions in Q&A
- Monitor course ratings and reviews
- Send announcements to enrolled students
- View detailed student progress analytics
- Moderate course discussions

### **For Admins**

#### **Guru Management**
- Review and approve guru applications
- Verify educational credentials and certificates
- Monitor guru activity and content quality
- Handle guru disputes and violations
- Manage guru revenue sharing

#### **Platform Analytics**
- Track overall platform usage and growth
- Monitor popular courses and trending topics
- Analyze revenue streams and payment patterns
- Generate reports for business intelligence
- Track user engagement and retention

#### **Content & Community Moderation**
- Review reported content or inappropriate behavior
- Manage user disputes and conflicts
- Ban or suspend users when necessary
- Maintain platform content quality standards
- Handle payment disputes and refunds

---

## 🔧 **Technical Architecture**

### **Backend Services Structure**
```
src/
├── controllers/
│   ├── courseController.js      # Course CRUD operations
│   ├── paymentController.js     # Payment processing
│   ├── progressController.js    # Learning progress tracking
│   ├── adminController.js       # Admin panel functions
│   └── contentController.js     # File upload/streaming
├── models/
│   ├── Course.js               # Enhanced course model
│   ├── Progress.js             # Student progress tracking
│   ├── Enrollment.js           # Course enrollment management
│   ├── Assessment.js           # Quizzes and assignments
│   ├── Payment.js              # Payment transactions
│   └── Subscription.js         # Subscription management
├── middleware/
│   ├── guruAuth.js            # Guru-specific authentication
│   ├── subscriptionCheck.js   # Access control middleware
│   ├── fileUpload.js          # Cloudinary integration
│   └── paymentVerify.js       # Razorpay webhook handling
└── routes/
    ├── courses.js             # Course management routes
    ├── payments.js            # Payment processing routes
    ├── admin.js               # Admin panel routes
    └── content.js             # Content upload/streaming routes
```

### **Database Collections**

#### **Courses Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  instructor: {
    guruId: ObjectId,
    name: String,
    credentials: String,
    avatar: String
  },
  structure: {
    units: [{
      unitId: String,
      title: String,
      description: String,
      order: Number,
      lessons: [{
        lessonId: String,
        title: String,
        description: String,
        order: Number,
        lectures: [{
          lectureId: String,
          title: String,
          description: String,
          order: Number,
          content: {
            videoUrl: String,
            audioUrl: String,
            duration: Number,
            materials: [{
              type: String, // 'pdf', 'audio', 'image'
              title: String,
              url: String
            }]
          }
        }]
      }]
    }]
  },
  pricing: {
    oneTime: {
      amount: Number,
      currency: String
    },
    subscription: {
      monthly: Number,
      yearly: Number
    }
  },
  metadata: {
    category: [String],
    tags: [String],
    difficulty: String,
    estimatedHours: Number,
    prerequisites: [String],
    language: String
  },
  stats: {
    enrollmentCount: Number,
    rating: {
      average: Number,
      count: Number
    },
    revenue: {
      total: Number,
      monthly: Number
    }
  },
  status: {
    isPublished: Boolean,
    publishedAt: Date,
    lastUpdated: Date
  }
}
```

#### **Enrollments Collection**
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  courseId: ObjectId,
  guruId: ObjectId,
  enrollmentType: String, // 'one_time', 'monthly_sub', 'yearly_sub'
  payment: {
    transactionId: String,
    amount: Number,
    method: String,
    date: Date,
    razorpayData: Object
  },
  access: {
    startDate: Date,
    endDate: Date, // null for one-time purchases
    isActive: Boolean
  },
  progress: {
    completedUnits: [String],
    completedLessons: [String],
    completedLectures: [String],
    overallProgress: Number, // percentage
    lastAccessed: Date,
    totalTimeSpent: Number // minutes
  }
}
```

#### **Subscriptions Collection**
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  guruId: ObjectId,
  plan: String, // 'monthly', 'yearly'
  status: String, // 'active', 'cancelled', 'expired'
  billing: {
    amount: Number,
    nextBillingDate: Date,
    razorpaySubscriptionId: String
  },
  usage: {
    coursesAccessed: [ObjectId],
    totalCourses: Number,
    lastAccessDate: Date
  }
}
```

---

## 🔐 **Security & Access Control**

### **Authentication & Authorization**
- **JWT-based authentication** for all user types
- **Role-based access control** (Student/Guru/Admin)
- **Subscription verification middleware** for paid content
- **Course ownership verification** for guru content management

### **Content Protection**
- **Video streaming only** (no download options)
- **Cloudinary secure URLs** with time-limited access
- **User session tracking** to prevent account sharing
- **Device limit enforcement** for subscription accounts

### **Payment Security**
- **Razorpay secure payment gateway** integration
- **Webhook verification** for payment confirmations
- **PCI DSS compliance** through Razorpay
- **Refund and dispute handling** mechanisms

---

## 📊 **Analytics & Reporting**

### **Student Analytics**
- Course completion rates and progress tracking
- Time spent per course, unit, lesson, and lecture
- Learning streaks and engagement patterns
- Preferred learning times and device usage
- Quiz scores and assessment performance

### **Guru Analytics**
- Course enrollment and revenue statistics
- Student engagement and completion rates
- Popular content identification
- Revenue breakdown by course and subscription
- Student feedback and rating trends

### **Platform Analytics**
- Overall user growth and retention metrics
- Popular courses and trending topics
- Revenue streams and financial reporting
- Geographic user distribution
- Device and platform usage statistics

---

## 🚀 **Implementation Roadmap**

### **Phase 1: Core LMS Foundation**
1. Enhanced Course model with Unit→Lesson→Lecture structure
2. Basic course creation and management APIs
3. Student enrollment and progress tracking
4. File upload integration with Cloudinary
5. Authentication and authorization middleware

### **Phase 2: Payment Integration**
1. Razorpay payment gateway setup
2. One-time purchase functionality
3. Subscription management system
4. Revenue sharing calculations
5. Payment webhooks and confirmations

### **Phase 3: Content Delivery**
1. Video streaming optimization
2. PDF and material delivery
3. Progress tracking and analytics
4. Comment and Q&A systems
5. Rating and review functionality

### **Phase 4: Admin Panel**
1. Guru verification and approval system
2. Platform analytics dashboard
3. Content moderation tools
4. User management and dispute resolution
5. Financial reporting and revenue tracking

### **Phase 5: Advanced Features**
1. Certificate generation system
2. Advanced search and filtering
3. Recommendation algorithms
4. Mobile app API optimization
5. Performance monitoring and scaling

---

## 📱 **API Endpoints Overview**

### **Course Management**
```
GET    /api/v1/courses              # Browse available courses
GET    /api/v1/courses/:id          # Get course details
POST   /api/v1/courses              # Create new course (Guru)
PUT    /api/v1/courses/:id          # Update course (Guru)
DELETE /api/v1/courses/:id          # Delete course (Guru)
POST   /api/v1/courses/:id/units    # Add unit to course
POST   /api/v1/courses/:id/lessons  # Add lesson to unit
POST   /api/v1/courses/:id/lectures # Add lecture to lesson
```

### **Enrollment & Progress**
```
POST   /api/v1/enrollments         # Enroll in course
GET    /api/v1/enrollments/my      # Get my enrollments
GET    /api/v1/progress/:courseId  # Get course progress
POST   /api/v1/progress/update     # Update progress
GET    /api/v1/certificates/my     # Get my certificates
```

### **Payment Management**
```
POST   /api/v1/payments/create     # Create payment order
POST   /api/v1/payments/verify     # Verify payment
POST   /api/v1/subscriptions       # Create subscription
PUT    /api/v1/subscriptions/:id   # Manage subscription
GET    /api/v1/payments/history    # Payment history
```

### **Content Delivery**
```
POST   /api/v1/upload/video        # Upload video content
POST   /api/v1/upload/audio        # Upload audio content
POST   /api/v1/upload/document     # Upload PDF materials
GET    /api/v1/stream/:lectureId   # Stream video content
GET    /api/v1/download/:materialId # Download study materials
```

### **Admin Functions**
```
GET    /api/v1/admin/gurus/pending # Pending guru approvals
POST   /api/v1/admin/gurus/approve # Approve guru
GET    /api/v1/admin/analytics     # Platform analytics
GET    /api/v1/admin/revenue       # Revenue reports
POST   /api/v1/admin/users/ban     # Ban user
```

---

## 📋 **Success Metrics**

### **Platform Success Indicators**
- **User Growth**: 1000+ registered students in first 6 months
- **Guru Adoption**: 50+ verified gurus creating content
- **Course Creation**: 500+ courses available across different topics
- **Revenue Target**: ₹10 lakh+ monthly recurring revenue
- **Engagement**: 70%+ course completion rate

### **Quality Metrics**
- **Course Rating**: 4.5+ average rating across all courses
- **Student Satisfaction**: 90%+ positive feedback
- **Guru Satisfaction**: 85%+ revenue satisfaction
- **Platform Reliability**: 99.9% uptime
- **Content Quality**: <5% content violation reports

---

*LMS Requirements Documentation - ShlokaYug*  
*Version 1.0 - November 20, 2025*  
*Prepared for Backend Implementation*