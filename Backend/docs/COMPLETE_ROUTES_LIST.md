# Complete Backend Routes Reference

## 🚀 All Routes in ShlokaYug Backend

This document provides a comprehensive list of every single route available in the ShlokaYug backend system, organized by system type and functionality.

---

## 🔐 Authentication System Routes

### **User Authentication** (`/api/v1/auth/*`)

| Method | Route | Description | Access |
|--------|--------|-------------|---------|
| `POST` | `/api/v1/auth/register` | Register new user | Public |
| `POST` | `/api/v1/auth/login` | User login | Public |
| `POST` | `/api/v1/auth/refresh-token` | Refresh access token | Public |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset | Public |
| `POST` | `/api/v1/auth/reset-password` | Reset password with token | Public |
| `POST` | `/api/v1/auth/verify-email` | Verify email address | Public |
| `POST` | `/api/v1/auth/google` | Google OAuth authentication | Public |
| `POST` | `/api/v1/auth/logout` | Logout user (invalidate token) | Protected |
| `POST` | `/api/v1/auth/resend-verification` | Resend email verification | Protected |
| `POST` | `/api/v1/auth/change-password` | Change password | Protected |
| `GET` | `/api/v1/auth/profile` | Get user profile | Protected |
| `GET` | `/api/v1/auth/status` | Check authentication status | Protected |
| `GET` | `/api/v1/auth/health` | Health check for auth service | Public |

### **Guru Authentication** (`/api/v1/guru/*`)

| Method | Route | Description | Access |
|--------|--------|-------------|---------|
| `POST` | `/api/v1/guru/apply` | Apply to become a guru | Public |
| `POST` | `/api/v1/guru/login` | Guru login (approved only) | Public |
| `POST` | `/api/v1/guru/forgot-password` | Guru forgot password | Public |
| `PATCH` | `/api/v1/guru/reset-password/:token` | Reset password with token | Public |
| `POST` | `/api/v1/guru/logout` | Guru logout | Guru Protected |
| `GET` | `/api/v1/guru/me` | Get current guru profile | Guru Protected |
| `PATCH` | `/api/v1/guru/me` | Update guru profile | Guru Protected |
| `PATCH` | `/api/v1/guru/profile/complete` | Complete guru profile | Guru Protected |
| `POST` | `/api/v1/guru/submit-application` | Submit for admin review | Guru Protected |
| `GET` | `/api/v1/guru/application-status` | Check application status | Guru Protected |
| `PATCH` | `/api/v1/guru/update-password` | Update guru password | Guru Protected |

---

## 🛡️ Admin Management Routes

### **Admin General** (`/api/v1/admin/*`)

| Method | Route | Description | Access |
|--------|--------|-------------|---------|
| `GET` | `/api/v1/admin/dashboard/stats` | Get admin dashboard stats | Admin |
| `GET` | `/api/v1/admin/gurus/pending` | Get pending guru applications | Admin |
| `GET` | `/api/v1/admin/gurus/:userId/details` | Get guru application details | Admin |
| `POST` | `/api/v1/admin/gurus/:userId/review` | Review guru application | Admin |
| `GET` | `/api/v1/admin/users` | Get all users | Admin |
| `POST` | `/api/v1/admin/users/:userId/moderate` | Moderate user | Admin |
| `GET` | `/api/v1/admin/content/moderation` | Content moderation queue | Admin |
| `GET` | `/api/v1/admin/analytics/platform` | Platform analytics | Admin |
| `GET` | `/api/v1/admin/reports/revenue` | Revenue reports | Admin |
| `GET` | `/api/v1/admin/health` | Admin service health | Admin |
| `POST` | `/api/v1/admin/emergency/platform-maintenance` | Emergency maintenance | Admin |

### **Admin Guru Management** (`/api/v1/admin/gurus/*`)

| Method | Route | Description | Access |
|--------|--------|-------------|---------|
| `GET` | `/api/v1/admin/gurus/stats` | Guru statistics dashboard | Admin |
| `GET` | `/api/v1/admin/gurus/pending` | Pending guru applications | Admin |
| `GET` | `/api/v1/admin/gurus/approved` | Approved gurus list | Admin |
| `GET` | `/api/v1/admin/gurus/application/:id` | Detailed application view | Admin |
| `POST` | `/api/v1/admin/gurus/:id/approve` | Approve guru application | Admin |
| `POST` | `/api/v1/admin/gurus/:id/reject` | Reject guru application | Admin |
| `PATCH` | `/api/v1/admin/gurus/:id/status` | Update guru status | Admin |
| `POST` | `/api/v1/admin/gurus/:id/notes` | Add admin notes | Admin |

---

## 📚 Course Management Routes

### **Courses** (`/api/v1/courses/*`)

| Method | Route | Description | Access |
|--------|--------|-------------|---------|
| `GET` | `/api/v1/courses` | Get all published courses | Public |
| `GET` | `/api/v1/courses/:id` | Get course by ID | Public/Private |
| `POST` | `/api/v1/courses` | Create new course | Guru |
| `PUT` | `/api/v1/courses/:id` | Update course | Instructor |
| `DELETE` | `/api/v1/courses/:id` | Delete course (soft delete) | Instructor |
| `POST` | `/api/v1/courses/:id/units` | Add unit to course | Instructor |
| `POST` | `/api/v1/courses/:courseId/units/:unitId/lessons` | Add lesson to unit | Instructor |
| `POST` | `/api/v1/courses/:courseId/units/:unitId/lessons/:lessonId/lectures` | Add lecture to lesson | Instructor |
| `PATCH` | `/api/v1/courses/:id/publish` | Publish course | Instructor |
| `PATCH` | `/api/v1/courses/:id/unpublish` | Unpublish course | Instructor |
| `GET` | `/api/v1/courses/instructor/my-courses` | Get instructor's courses | Guru |
| `GET` | `/api/v1/courses/instructor/:id/analytics` | Course analytics | Instructor |

---

## 🎓 Learning & Enrollment Routes

### **Enrollments** (`/api/v1/enrollments/*`)

| Method | Route | Description | Access |
|--------|--------|-------------|---------|
| `POST` | `/api/v1/enrollments/auto-enroll` | Auto enrollment (payment triggered) | Protected |
| `POST` | `/api/v1/enrollments/enroll` | Manual course enrollment | Protected |
| `POST` | `/api/v1/enrollments/initiate` | Initiate enrollment process | Protected |
| `POST` | `/api/v1/enrollments/confirm` | Confirm enrollment | Protected |
| `GET` | `/api/v1/enrollments/my-enrollments` | User's enrollments | Protected |
| `GET` | `/api/v1/enrollments/my-courses` | User's courses | Protected |
| `POST` | `/api/v1/enrollments/lecture-complete` | Mark lecture complete | Protected |
| `GET` | `/api/v1/enrollments/course/:courseId/progress` | Course progress | Protected |
| `GET` | `/api/v1/enrollments/search` | Search enrollments | Protected |
| `GET` | `/api/v1/enrollments/analytics` | Enrollment analytics | Admin |
| `GET` | `/api/v1/enrollments/:id` | Get enrollment details | Protected |
| `POST` | `/api/v1/enrollments/:id/validate` | Validate enrollment | Protected |
| `PATCH` | `/api/v1/enrollments/:id/progress` | Update progress | Protected |
| `PATCH` | `/api/v1/enrollments/:id/subscription` | Update subscription | Protected |
| `DELETE` | `/api/v1/enrollments/:id` | Delete enrollment | Protected |
| `GET` | `/api/v1/enrollments/:id/devices` | Get enrolled devices | Protected |
| `POST` | `/api/v1/enrollments/:id/devices` | Add device | Protected |
| `DELETE` | `/api/v1/enrollments/:id/devices/:deviceId` | Remove device | Protected |
| `POST` | `/api/v1/enrollments/force-complete/:courseId` | Force complete course | Protected |

### **Progress Tracking** (`/api/v1/progress/*`)

| Method | Route | Description | Access |
|--------|--------|-------------|---------|
| `POST` | `/api/v1/progress/update` | Update learning progress | Protected |
| `GET` | `/api/v1/progress/course/:courseId` | Get course progress | Protected |
| `GET` | `/api/v1/progress/analytics` | Progress analytics | Protected |
| `PATCH` | `/api/v1/progress/lecture/:lectureId/complete` | Mark lecture complete | Protected |
| `POST` | `/api/v1/progress/bookmark` | Bookmark content | Protected |
| `GET` | `/api/v1/progress/bookmarks/:courseId` | Get bookmarks | Protected |
| `DELETE` | `/api/v1/progress/bookmark/:bookmarkId` | Delete bookmark | Protected |
| `GET` | `/api/v1/progress/summary` | Progress summary | Protected |

---

## 📝 Assessment & Testing Routes

### **Assessments** (`/api/v1/assessments/*`)

| Method | Route | Description | Access |
|--------|--------|-------------|---------|
| `POST` | `/api/v1/assessments` | Create assessment | Guru |
| `GET` | `/api/v1/assessments/course/:courseId` | Course assessments | Protected |
| `GET` | `/api/v1/assessments/:assessmentId` | Get assessment | Protected |
| `POST` | `/api/v1/assessments/:assessmentId/submit` | Submit assessment | Protected |
| `GET` | `/api/v1/assessments/:assessmentId/results` | Assessment results | Protected |
| `PUT` | `/api/v1/assessments/:assessmentId` | Update assessment | Guru |
| `PATCH` | `/api/v1/assessments/:assessmentId/publish` | Publish assessment | Guru |
| `DELETE` | `/api/v1/assessments/:assessmentId` | Delete assessment | Guru |
| `GET` | `/api/v1/assessments/course/:courseId/analytics` | Assessment analytics | Guru |
| `GET` | `/api/v1/assessments/:assessmentId/analytics` | Individual assessment analytics | Guru |

---

## 💰 Payment & Subscription Routes

### **Payments** (`/api/v1/payments/*`)

| Method | Route | Description | Access |
|--------|--------|-------------|---------|
| `POST` | `/api/v1/payments/create-order` | Create payment order | Protected |
| `POST` | `/api/v1/payments/verify` | Verify payment | Protected |
| `POST` | `/api/v1/payments/refund/:paymentId` | Process refund | Admin |
| `GET` | `/api/v1/payments/transaction/:transactionId` | Get transaction | Protected |
| `GET` | `/api/v1/payments/methods` | Available payment methods | Protected |
| `GET` | `/api/v1/payments/subscription-plans` | Subscription plans | Protected |
| `GET` | `/api/v1/payments/my-payments` | User's payment history | Student |
| `GET` | `/api/v1/payments/revenue-analytics` | Revenue analytics | Guru/Admin |
| `GET` | `/api/v1/payments/pending-distributions` | Pending distributions | Admin |
| `POST` | `/api/v1/payments/distribute-revenue` | Distribute revenue | Admin |
| `PATCH` | `/api/v1/payments/update-distribution/:distributionId` | Update distribution | Admin |

### **Subscriptions** (`/api/v1/subscriptions/*`)

| Method | Route | Description | Access |
|--------|--------|-------------|---------|
| `GET` | `/api/v1/subscriptions/plans` | Available plans | Protected |
| `POST` | `/api/v1/subscriptions/create` | Create subscription | Protected |
| `POST` | `/api/v1/subscriptions/upgrade` | Upgrade subscription | Protected |
| `POST` | `/api/v1/subscriptions/cancel` | Cancel subscription | Protected |
| `POST` | `/api/v1/subscriptions/resume` | Resume subscription | Protected |
| `PATCH` | `/api/v1/subscriptions/update-plan` | Update plan | Protected |
| `GET` | `/api/v1/subscriptions/my-subscription` | User subscription | Protected |
| `GET` | `/api/v1/subscriptions/analytics` | Subscription analytics | Admin |
| `GET` | `/api/v1/subscriptions/revenue-reports` | Revenue reports | Admin |

---

## 📹 Video Platform Routes

### **Videos** (`/api/v1/videos/*`)

| Method | Route | Description | Access |
|--------|--------|-------------|---------|
| `POST` | `/api/v1/videos/upload` | Upload video | Guru |
| `GET` | `/api/v1/videos/feed` | Video feed | Public |
| `GET` | `/api/v1/videos/search` | Search videos | Public |
| `GET` | `/api/v1/videos/:videoId` | Get video by ID | Public |
| `POST` | `/api/v1/videos/:videoId/view` | Record video view | Public |
| `POST` | `/api/v1/videos/:videoId/react` | React to video | Protected |
| `GET` | `/api/v1/videos/:videoId/comments` | Get video comments | Public |
| `POST` | `/api/v1/videos/:videoId/comments` | Add video comment | Protected |
| `POST` | `/api/v1/videos/comments/:commentId/like` | Like comment | Protected |
| `POST` | `/api/v1/videos/channels/:channelId/subscribe` | Subscribe to channel | Protected |
| `GET` | `/api/v1/videos/subscriptions` | User subscriptions | Protected |

### **Shorts** (`/api/v1/shorts/*`)

| Method | Route | Description | Access |
|--------|--------|-------------|---------|
| `GET` | `/api/v1/shorts/feed` | Short videos feed | Public |
| `GET` | `/api/v1/shorts/hashtags/trending` | Trending hashtags | Public |
| `GET` | `/api/v1/shorts/hashtag/:hashtag` | Shorts by hashtag | Public |
| `GET` | `/api/v1/shorts/audio/:audioId` | Shorts by audio | Public |
| `POST` | `/api/v1/shorts/:shortId/view` | Record short view | Public |
| `POST` | `/api/v1/shorts/:shortId/react` | React to short | Protected |
| `GET` | `/api/v1/shorts/:shortId/comments` | Get short comments | Public |
| `POST` | `/api/v1/shorts/:shortId/comments` | Add short comment | Protected |

---

## 👥 Community & Social Routes

### **Community Features** (`/api/v1/community/*`)

| Method | Route | Description | Access |
|--------|--------|-------------|---------|
| `POST` | `/api/v1/community/posts` | Create community post | Protected |
| `GET` | `/api/v1/community/timeline` | User timeline | Protected |
| `GET` | `/api/v1/community/explore` | Explore posts | Public |
| `GET` | `/api/v1/community/users/:username/posts` | User's posts | Public |
| `POST` | `/api/v1/community/posts/:postId/like` | Like post | Protected |
| `POST` | `/api/v1/community/posts/:postId/repost` | Repost content | Protected |
| `POST` | `/api/v1/community/posts/:postId/comments` | Comment on post | Protected |
| `POST` | `/api/v1/community/users/:username/follow` | Follow user | Protected |
| `DELETE` | `/api/v1/community/users/:username/follow` | Unfollow user | Protected |
| `GET` | `/api/v1/community/users/:username/followers` | User followers | Public |
| `GET` | `/api/v1/community/users/:username/following` | User following | Public |
| `GET` | `/api/v1/community/suggestions/follow` | Follow suggestions | Protected |
| `GET` | `/api/v1/community/trending/hashtags` | Trending hashtags | Public |
| `GET` | `/api/v1/community/hashtags/:hashtag/posts` | Posts by hashtag | Public |
| `GET` | `/api/v1/community/search` | Search community | Protected |
| `GET` | `/api/v1/community/stats` | Community stats | Public |
| `GET` | `/api/v1/community/health` | Community health | Public |

---

## 📄 Content Management Routes

### **Content** (`/api/v1/content/*`)

| Method | Route | Description | Access |
|--------|--------|-------------|---------|
| `POST` | `/api/v1/content/upload` | Upload content file | Guru |
| `GET` | `/api/v1/content/stream/:token` | Stream content | Protected |
| `GET` | `/api/v1/content/secure/:token` | Secure content access | Protected |
| `GET` | `/api/v1/content/metadata/:courseId/:lectureId` | Content metadata | Protected |
| `POST` | `/api/v1/content/download-token` | Generate download token | Protected |
| `GET` | `/api/v1/content/download/:token` | Download content | Protected |
| `DELETE` | `/api/v1/content/:contentId` | Delete content | Guru |
| `GET` | `/api/v1/content/course/:courseId/analytics` | Content analytics | Guru |
| `GET` | `/api/v1/content/thumbnail/:token` | Content thumbnail | Public |
| `POST` | `/api/v1/content/bulk-upload` | Bulk content upload | Guru |

---

## 📝 Notes & Certificates Routes

### **Notes** (`/api/v1/notes/*`)

| Method | Route | Description | Access |
|--------|--------|-------------|---------|
| `GET` | `/api/v1/notes/:courseId/:lectureId` | Get lecture notes | Protected |
| `POST` | `/api/v1/notes` | Create note | Protected |
| `PUT` | `/api/v1/notes/:noteId` | Update note | Protected |
| `DELETE` | `/api/v1/notes/:noteId` | Delete note | Protected |

### **Certificates** (`/api/v1/certificates/*`)

| Method | Route | Description | Access |
|--------|--------|-------------|---------|
| `GET` | `/api/v1/certificates/:courseId` | Get course certificate | Protected |
| `POST` | `/api/v1/certificates/generate` | Generate certificate | Protected |
| `GET` | `/api/v1/certificates/verify/:certificateId` | Verify certificate | Public |

---

## 📊 Route Statistics

### **Total Route Count**
- **Total Routes**: **135+ endpoints**
- **Route Files**: **16 modules**
- **Authentication Systems**: **3 (User, Guru, Admin)**

### **Routes by Category**
- **Authentication**: 24 endpoints (User: 13, Guru: 11)
- **Admin Management**: 19 endpoints (General: 11, Guru Management: 8)
- **Course Management**: 12 endpoints
- **Learning & Enrollment**: 24 endpoints (Enrollments: 16, Progress: 8)
- **Assessment**: 10 endpoints
- **Payment & Subscriptions**: 19 endpoints (Payments: 10, Subscriptions: 9)
- **Video Platform**: 19 endpoints (Videos: 11, Shorts: 8)
- **Community**: 16 endpoints
- **Content Management**: 10 endpoints
- **Notes & Certificates**: 7 endpoints (Notes: 4, Certificates: 3)

### **Access Control Summary**
- **Public Routes**: ~30 endpoints (feeds, course discovery, video streaming)
- **Protected Routes**: ~70 endpoints (enrolled users, basic features)
- **Guru Routes**: ~25 endpoints (content creation, teaching tools)
- **Admin Routes**: ~19 endpoints (platform management, guru approval)

---

## 🔐 Security & Access Patterns

### **Authentication Middleware Used**
- `auth` - Standard user authentication
- `guruAuth` - Guru-specific authentication
- `adminAuth` - Admin-only authentication
- `protect` - General protection (alias for auth)

### **Role-Based Access**
- **Public**: Course discovery, video viewing, community exploration
- **Student**: Learning, progress tracking, community participation
- **Guru**: Content creation, student management, analytics
- **Admin**: Platform oversight, guru approval, system management

### **Route Security Features**
- Rate limiting on authentication endpoints
- Input validation on all POST/PUT/PATCH routes
- Role-based authorization
- JWT token validation
- Request sanitization and parameter pollution protection

---

## 🚀 API Usage Examples

### **Authentication Flow**
```bash
# User Registration
POST /api/v1/auth/register
{
  "username": "student123",
  "email": "student@example.com", 
  "password": "SecurePass123!"
}

# Guru Application
POST /api/v1/guru/apply
{
  "username": "guru_sanskrit",
  "email": "guru@example.com",
  "firstName": "Sanskrit",
  "lastName": "Teacher"
}

# Admin Guru Approval
POST /api/v1/admin/gurus/:id/approve
Authorization: Bearer <admin_token>
{
  "approvalNotes": "Excellent credentials"
}
```

### **Learning Flow**
```bash
# Browse Courses
GET /api/v1/courses?category=sanskrit&level=beginner

# Enroll in Course
POST /api/v1/enrollments/enroll
Authorization: Bearer <user_token>
{
  "courseId": "course_id_here"
}

# Track Progress
POST /api/v1/progress/update
Authorization: Bearer <user_token>
{
  "lectureId": "lecture_id", 
  "timeSpent": 1800,
  "completed": true
}
```

---

This comprehensive routes list covers every endpoint available in the ShlokaYug backend, organized by functionality and access level for easy reference and development planning.

**Last Updated**: November 28, 2025  
**Total Endpoints**: 135+  
**Systems**: User, Guru, Admin (Complete Separation)