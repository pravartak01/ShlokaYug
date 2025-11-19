# Development Setup Guide

## Prerequisites
- Node.js 18+ and npm 9+
- MongoDB 6.0+
- Redis 7.0+
- FFmpeg (for audio processing)
- Git

## Local Development Setup

### 1. Clone and Install Dependencies
```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Install global dependencies (if needed)
npm install -g nodemon
```

### 2. Environment Configuration
Create `.env` file in the Backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database URLs
MONGODB_URI=mongodb://localhost:27017/shlokayug_dev
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRE=30d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI/ML Services
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key_if_needed

# File Upload & Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Service
EMAIL_FROM=noreply@shlokayug.com
SENDGRID_API_KEY=your_sendgrid_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Payment Gateways
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# CORS Configuration
FRONTEND_URL=http://localhost:3000
MOBILE_APP_URL=exp://localhost:19000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Limits
MAX_FILE_SIZE=50MB
MAX_AUDIO_FILE_SIZE=20MB
MAX_VIDEO_FILE_SIZE=100MB

# Cache Configuration
CACHE_TTL=3600

# Log Level
LOG_LEVEL=debug
```

### 3. Database Setup

#### MongoDB Setup
```bash
# Start MongoDB service
mongod --dbpath /path/to/your/db

# Or using MongoDB Compass GUI
# Connect to: mongodb://localhost:27017
```

#### Redis Setup
```bash
# Start Redis server
redis-server

# Test Redis connection
redis-cli ping
# Should return: PONG
```

### 4. FFmpeg Installation

#### Windows
```bash
# Download from: https://ffmpeg.org/download.html
# Add to PATH environment variable
```

#### macOS
```bash
brew install ffmpeg
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install ffmpeg
```

### 5. Start Development Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Documentation
Once the server is running, visit:
- Swagger UI: `http://localhost:5000/api-docs`
- Health Check: `http://localhost:5000/health`

## Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Testing Strategy
- Unit tests for core business logic
- Integration tests for API endpoints
- Audio processing validation tests
- AI service integration tests

## Code Quality

### Linting
```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix
```

### Code Formatting
```bash
# Format with Prettier (integrated with ESLint)
npm run lint:fix
```

## Database Seeding

### Sample Data
```bash
# Run database seeder (when implemented)
npm run seed

# Reset database
npm run db:reset
```

## Audio Processing Setup

### FFmpeg Configuration
Ensure FFmpeg is properly installed and accessible:

```bash
# Test FFmpeg installation
ffmpeg -version

# Test audio conversion
ffmpeg -i sample.mp3 -f wav output.wav
```

### Audio Processing Pipeline
1. File upload validation
2. Format conversion (MP3/M4A → WAV)
3. Audio analysis (pitch, timing)
4. Metadata extraction
5. Storage optimization

## AI Services Configuration

### Google Gemini Setup
1. Get API key from Google AI Studio
2. Configure in `.env` file
3. Test connection with sample requests

### RAG Pipeline Setup
1. Initialize knowledge base
2. Configure embeddings
3. Setup vector database (if using)

## Monitoring & Logging

### Development Logging
- Console logs for development
- File-based logs for production
- Error tracking integration

### Performance Monitoring
- Request timing middleware
- Database query optimization
- Memory usage tracking

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000
```

#### MongoDB Connection Issues
```bash
# Check MongoDB status
sudo service mongod status

# Restart MongoDB
sudo service mongod restart
```

#### FFmpeg Path Issues
```bash
# Check FFmpeg path
which ffmpeg

# Add to PATH if needed
export PATH=$PATH:/usr/local/bin
```

### Debug Mode
```bash
# Start with debug logging
DEBUG=* npm run dev

# Or specific debug namespace
DEBUG=app:* npm run dev
```

## Production Deployment Notes

### Environment Preparation
- Set `NODE_ENV=production`
- Use production database URLs
- Enable security middleware
- Configure proper logging
- Setup monitoring services

### Performance Optimization
- Enable compression middleware
- Configure CDN for static assets
- Setup database connection pooling
- Implement caching strategies

### Security Checklist
- Update all dependencies
- Enable HTTPS only
- Configure CORS properly
- Implement rate limiting
- Setup security headers
- Validate all inputs
- Sanitize database queries