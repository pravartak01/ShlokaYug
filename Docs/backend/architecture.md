# ShlokaYug Backend Architecture

## System Overview
The ShlokaYug backend is designed as a microservices-oriented monolith with clear separation of concerns for handling Sanskrit text processing, audio analysis, AI integration, and community features.

## Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │    Web App      │    │  Admin Panel    │
│  (React Native)│    │   (React.js)    │    │   (React.js)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     API Gateway         │
                    │   (Express.js Router)   │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                       │                        │
┌───────▼─────────┐    ┌────────▼────────┐    ┌─────────▼────────┐
│  Auth Service   │    │  Core Services  │    │  AI/ML Services  │
│                 │    │                 │    │                  │
│ • JWT Auth      │    │ • Chandas Engine│    │ • Gemini API     │
│ • User Mgmt     │    │ • Audio Proc    │    │ • RAG Pipeline   │
│ • Permissions   │    │ • Community     │    │ • TTS Service    │
└─────────────────┘    │ • Gamification  │    │ • Script Convert │
                       │ • LMS Features  │    └──────────────────┘
                       └─────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │      Data Layer         │
                    │                         │
                    │ • MongoDB (Primary)     │
                    │ • Redis (Cache/Queue)   │
                    │ • Cloudinary (Media)    │
                    │ • File Storage (S3)     │
                    └─────────────────────────┘
```

## Core Services Architecture

### 1. Authentication Service (`/src/services/auth/`)
- JWT-based authentication
- Role-based access control (Student, Guru, Admin)
- Social login integration
- Password reset & email verification

### 2. Chandas Analysis Engine (`/src/services/chandas/`)
- Sanskrit text parsing
- Syllable extraction & counting
- LG (Laghu-Guru) pattern generation
- Meter classification & validation
- Multi-script support (Devanagari, IAST, etc.)

### 3. Audio Processing Service (`/src/services/audio/`)
- Audio file upload & processing
- Pitch analysis & phoneme extraction
- Timing comparison with ideal meter
- Confidence scoring algorithm
- Real-time karaoke timeline generation

### 4. AI Integration Layer (`/src/ai/`)
- Gemini API integration
- RAG (Retrieval-Augmented Generation) pipeline
- Sanskrit verse composition
- Automated feedback generation
- Content moderation

### 5. Community Service (`/src/services/community/`)
- User-generated content management
- Video/audio upload handling
- Search & recommendation engine
- Moderation pipeline
- Live session management

### 6. Gamification Engine (`/src/services/gamification/`)
- XP & level calculation
- Badge & achievement system
- Streak tracking
- Leaderboards
- Progress analytics

### 7. Learning Management System (`/src/services/lms/`)
- Course structure management
- Assignment creation & grading
- Student progress tracking
- Guru dashboard features
- Certificate generation

## Data Flow Patterns

### 1. Shloka Processing Flow
```
Input Text → Script Detection → IAST Conversion → 
Syllable Extraction → Chandas Analysis → LG Pattern → 
Karaoke Timeline → Frontend Display
```

### 2. Audio Analysis Flow
```
User Audio Upload → FFmpeg Processing → 
Phoneme Extraction → Timing Analysis → 
Meter Comparison → Accuracy Score → 
Feedback Generation → Progress Update
```

### 3. AI Composition Flow
```
User Prompt → RAG Context Retrieval → 
Gemini API Call → Sanskrit Generation → 
Chandas Validation → TTS Audio → 
Response Package
```

## Database Schema Overview

### Collections Structure
- `users` - User profiles and authentication
- `shlokas` - Sanskrit verses and metadata
- `chandas_patterns` - Meter definitions and rules
- `audio_recordings` - User chanting recordings
- `courses` - LMS course structure
- `progress` - Learning progress tracking
- `community_posts` - User-generated content
- `live_sessions` - Real-time session data
- `badges` - Gamification achievements
- `certificates` - Generated certificates

## Security Architecture

### Authentication Flow
1. User login → JWT token generation
2. Token validation on protected routes
3. Role-based access control
4. Refresh token rotation

### Data Protection
- Input validation & sanitization
- Rate limiting on APIs
- CORS configuration
- File upload restrictions
- Audio/video content scanning

## Scalability Considerations

### Horizontal Scaling
- Stateless service design
- Database connection pooling
- Redis-based session management
- CDN for static assets

### Performance Optimization
- Database indexing strategies
- Caching layers (Redis)
- Audio processing queues
- Background job processing

## Integration Points

### External Services
- **Google Gemini API**: AI text generation
- **Cloudinary**: Media storage & transformation
- **Razorpay/Stripe**: Payment processing
- **SendGrid**: Email services
- **Agora SDK**: Live streaming (future)

### Internal APIs
- RESTful API design
- GraphQL for complex queries (future)
- WebSocket for real-time features
- Webhook endpoints for external integrations

## Development Environment

### Local Setup
- Node.js 18+ environment
- MongoDB local instance
- Redis for caching
- FFmpeg for audio processing
- Environment-based configuration

### Testing Strategy
- Unit tests for core logic
- Integration tests for APIs
- Audio processing validation
- Performance benchmarking

## Deployment Architecture

### Production Setup
- Docker containerization
- Load balancer configuration
- Database replica sets
- CDN integration
- Monitoring & logging

### CI/CD Pipeline
- Automated testing
- Code quality checks
- Security scanning
- Deployment automation