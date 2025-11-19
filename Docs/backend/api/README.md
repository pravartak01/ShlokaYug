# ShlokaYug Backend API Documentation

## Base URL
- Development: `http://localhost:5000/api/v1`
- Production: `https://api.shlokayug.com/api/v1`

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints Overview

### 1. Authentication & User Management

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "preferredScript": "devanagari"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "username",
      "profile": {...}
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /auth/login
Login with email/username and password.

**Request Body:**
```json
{
  "identifier": "user@example.com", // email or username
  "password": "securePassword123"
}
```

#### POST /auth/google
Login with Google OAuth.

#### POST /auth/refresh
Refresh JWT token.

#### POST /auth/forgot-password
Request password reset.

#### POST /auth/reset-password
Reset password with token.

#### POST /auth/verify-email
Verify email with verification token.

### 2. User Profile Management

#### GET /users/profile
Get current user's profile.

#### PUT /users/profile
Update user profile.

#### GET /users/:id/public
Get public profile of another user.

#### POST /users/upload-avatar
Upload profile picture.

#### GET /users/dashboard
Get dashboard data (progress, stats, recent activity).

### 3. Shloka Management

#### GET /shlokas
Get list of shlokas with filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `category`: Filter by category
- `difficulty`: Filter by difficulty level
- `meter`: Filter by chandas meter
- `search`: Text search in title/content
- `tags`: Filter by tags

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "shlokas": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 200,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET /shlokas/:id
Get detailed information about a specific shloka.

#### POST /shlokas
Create new shloka (Admin/Guru only).

#### PUT /shlokas/:id
Update shloka (Admin/Guru only).

#### DELETE /shlokas/:id
Delete shloka (Admin only).

### 4. Chandas Analysis

#### POST /chandas/analyze
Analyze text for chandas pattern.

**Request Body:**
```json
{
  "text": "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यम्",
  "script": "devanagari",
  "language": "sanskrit"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "analysis": {
      "syllables": ["ॐ", "भूर्", "भु", "वः", "स्वः", ...],
      "pattern": "LGLGLGLG...",
      "meterName": "Gayatri",
      "isValidMeter": true,
      "syllableCount": 24,
      "lineStructure": [8, 8, 8],
      "deviations": [],
      "confidence": 0.95
    },
    "recommendations": [
      "Perfect Gayatri meter",
      "Traditional pronunciation maintained"
    ]
  }
}
```

#### GET /chandas/meters
Get list of supported chandas meters.

#### POST /chandas/validate
Validate if text follows specific meter.

### 5. Audio Processing

#### POST /audio/upload
Upload audio recording for analysis.

**Form Data:**
- `audio`: Audio file (MP3, M4A, WAV)
- `shlokaId`: ID of related shloka
- `practiceMode`: 'guided' | 'free' | 'exam'

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Audio uploaded and queued for processing",
  "data": {
    "recordingId": "recording_id",
    "status": "processing",
    "estimatedProcessingTime": 30
  }
}
```

#### GET /audio/recordings/:id
Get audio recording details and analysis.

#### GET /audio/recordings/my
Get user's audio recordings.

#### POST /audio/recordings/:id/analyze
Re-analyze audio recording.

#### DELETE /audio/recordings/:id
Delete audio recording.

#### POST /audio/karaoke/generate
Generate karaoke timeline for shloka.

**Request Body:**
```json
{
  "shlokaId": "shloka_id",
  "style": "traditional", // or 'modern'
  "tempo": "medium" // 'slow' | 'medium' | 'fast'
}
```

### 6. AI Services

#### POST /ai/compose
Generate Sanskrit verse using AI.

**Request Body:**
```json
{
  "prompt": "Create a verse about knowledge and wisdom",
  "meter": "anushtubh", // optional
  "theme": "educational",
  "language": "sanskrit",
  "includeTranslation": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "composition": {
      "sanskrit": {
        "devanagari": "Generated verse in Devanagari",
        "iast": "Generated verse in IAST"
      },
      "translation": "English translation",
      "meaning": "Word-by-word meaning",
      "chandas": {
        "meter": "anushtubh",
        "pattern": "LGLGLGLG...",
        "isValid": true
      }
    },
    "audioUrl": "generated_audio_url"
  }
}
```

#### POST /ai/feedback
Get AI-generated feedback for chanting.

#### POST /ai/translate
Translate text between scripts.

#### POST /ai/explain
Get AI explanation of shloka meaning.

### 7. Learning Management System (LMS)

#### GET /courses
Get available courses.

#### GET /courses/:id
Get course details.

#### POST /courses/:id/enroll
Enroll in a course.

#### GET /courses/:id/progress
Get user's progress in course.

#### POST /courses/:id/modules/:moduleId/complete
Mark module as complete.

#### GET /assignments/my
Get user's assignments.

#### POST /assignments/:id/submit
Submit assignment.

#### GET /assignments/:id/feedback
Get assignment feedback.

### 8. Community Features

#### GET /community/posts
Get community posts with filtering.

#### POST /community/posts
Create new community post.

#### GET /community/posts/:id
Get specific post details.

#### POST /community/posts/:id/like
Like/unlike a post.

#### POST /community/posts/:id/comments
Add comment to post.

#### GET /community/trending
Get trending posts.

#### POST /community/upload
Upload audio/video to community.

#### POST /community/report
Report inappropriate content.

### 9. Live Sessions

#### GET /live-sessions
Get upcoming live sessions.

#### POST /live-sessions
Create new live session (Guru only).

#### GET /live-sessions/:id
Get live session details.

#### POST /live-sessions/:id/join
Join live session.

#### POST /live-sessions/:id/leave
Leave live session.

#### WebSocket /live-sessions/:id/ws
WebSocket connection for real-time features.

### 10. Gamification

#### GET /gamification/profile
Get user's gamification profile.

#### GET /gamification/leaderboard
Get leaderboards.

#### GET /gamification/badges
Get available badges.

#### GET /gamification/achievements
Get user's achievements.

#### POST /gamification/claim-reward
Claim earned reward.

### 11. Search & Recommendations

#### GET /search
Universal search across content.

**Query Parameters:**
- `q`: Search query
- `type`: 'shlokas' | 'users' | 'posts' | 'courses'
- `filters`: JSON string of filters

#### GET /recommendations/shlokas
Get personalized shloka recommendations.

#### GET /recommendations/courses
Get recommended courses.

#### GET /recommendations/daily
Get daily practice recommendations.

### 12. Analytics & Progress

#### GET /analytics/progress
Get detailed progress analytics.

#### GET /analytics/accuracy-trends
Get accuracy improvement trends.

#### GET /analytics/time-spent
Get time spent analytics.

#### GET /analytics/streaks
Get streak analytics.

### 13. Admin APIs

#### GET /admin/users
Get users list (Admin only).

#### PUT /admin/users/:id/role
Update user role.

#### GET /admin/content/moderation
Get content pending moderation.

#### POST /admin/content/:id/approve
Approve content.

#### POST /admin/content/:id/reject
Reject content.

#### GET /admin/analytics
Get platform analytics.

### 14. Notifications

#### GET /notifications
Get user notifications.

#### PUT /notifications/:id/read
Mark notification as read.

#### POST /notifications/preferences
Update notification preferences.

#### POST /notifications/send
Send notification (Admin only).

### 15. Payments & Subscriptions

#### GET /payments/plans
Get subscription plans.

#### POST /payments/subscribe
Create subscription.

#### POST /payments/razorpay/webhook
Razorpay webhook handler.

#### GET /payments/history
Get payment history.

#### POST /payments/cancel
Cancel subscription.

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {...}, // optional additional details
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Validation Error
- `429`: Too Many Requests
- `500`: Internal Server Error

### Common Error Codes
- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_REQUIRED`: JWT token required
- `INVALID_TOKEN`: JWT token invalid or expired
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `DUPLICATE_RESOURCE`: Resource already exists
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `FILE_TOO_LARGE`: Uploaded file exceeds size limit
- `INVALID_FILE_FORMAT`: Unsupported file format
- `PROCESSING_ERROR`: Audio/AI processing failed

## Rate Limiting

### Default Limits
- General APIs: 100 requests per 15 minutes per IP
- Audio upload: 10 requests per hour per user
- AI services: 50 requests per hour per user
- Authentication: 5 failed attempts per 15 minutes per IP

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642234567
```

## Webhooks

### Webhook Events
- `user.registered`: New user registration
- `audio.processed`: Audio processing complete
- `course.completed`: User completed course
- `payment.success`: Successful payment
- `live.session.started`: Live session started

### Webhook Payload Format
```json
{
  "event": "audio.processed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "recordingId": "recording_id",
    "userId": "user_id",
    "analysis": {...}
  },
  "signature": "webhook_signature"
}
```

## API Versioning

### Version Strategy
- Current version: v1
- Backward compatibility maintained for 1 year
- Version specified in URL: `/api/v1/`
- Breaking changes require new version

### Migration Guide
When new versions are released, migration guides will be provided with:
- List of breaking changes
- Migration timeline
- Code examples
- Automated migration tools (where possible)