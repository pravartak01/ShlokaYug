# SVARAM Backend

## 🎵 Overview
SVARAM is a comprehensive Sanskrit learning platform featuring separated guru and user systems with admin management capabilities, plus a complete challenge system with automatic leaderboards and certificate generation. The backend provides a robust API infrastructure supporting course management, user authentication, payment processing, community features, and detailed learning analytics with complete separation of concerns.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB
- Cloudinary Account (for media storage)

### Installation
```bash
npm install
cp .env.example .env
# Configure your environment variables
npm start
```

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/svaram

# Authentication  
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Admin Configuration
ADMIN_EMAIL=admin@svaram.com
ADMIN_PASSWORD=secure-admin-password
```

## 🏗️ Architecture

### System Separation
Our backend implements **complete separation** between guru and user systems:

#### 👨‍🏫 **Guru System** (`/api/v1/guru/*`)
- **Application Process**: Gurus apply → admin reviews → approval/rejection
- **Authentication**: Separate JWT tokens and middleware
- **Capabilities**: Create courses, upload content, manage students
- **Admin Oversight**: Full lifecycle management

#### 👨‍🎓 **User System** (`/api/v1/auth/*`, `/api/v1/users/*`)  
- **Direct Access**: Self-registration with immediate platform access
- **Learning Focus**: Enroll in courses, track progress, community participation
- **Independent**: No guru-related fields or dependencies

#### 🛡️ **Admin System** (`/api/v1/admin/*`)
- **Guru Management**: Approve/reject applications, monitor performance
- **Platform Oversight**: User management, content moderation
- **Analytics**: Platform usage and performance metrics

### Key Benefits
- **🔧 Maintainability**: Clear separation of concerns
- **📈 Scalability**: Independent system scaling  
- **🔒 Security**: Role-based access with separate authentication
- **👥 User Experience**: Tailored interfaces for each role
- **🏆 Gamification**: Complete challenge system with rewards
- **🎯 Engagement**: Community features and social learning

## 📁 Folder Structure

```
Backend/
├── docs/                          # 📚 Documentation
│   ├── api/                       # API references
│   ├── architecture/              # System design
│   └── *.md                       # General docs
├── scripts/                       # 🛠️ Utility scripts  
├── src/                          # 💻 Source code
│   ├── models/                    # Data models
│   ├── controllers/               # Business logic
│   ├── routes/                    # API endpoints  
│   ├── middleware/                # Request processing
│   └── services/                  # External integrations
├── tests/                        # 🧪 Test suites
└── uploads/                      # 📁 File storage
```

> **📋 Complete Structure**: See [`docs/FOLDER_STRUCTURE.md`](./docs/FOLDER_STRUCTURE.md)

## 🔐 Authentication Flow

### Guru Authentication
```javascript
// Application submission
POST /api/v1/guru/apply

// Admin review  
POST /api/v1/admin/gurus/approve/:id
POST /api/v1/admin/gurus/reject/:id

// Guru login (after approval)
POST /api/v1/guru/login
```

### User Authentication
```javascript
// Self-registration
POST /api/v1/auth/register  

// Immediate access
POST /api/v1/auth/login
```

## 📖 API Documentation

### Core Endpoints

#### 🏆 Challenge System (NEW)
- **`POST /api/v1/admin/challenges`** - Create challenge (Admin)
- **`GET /api/v1/challenges`** - Browse active challenges
- **`POST /api/v1/challenges/:id/join`** - Join challenge
- **`POST /api/v1/challenges/:id/complete`** - Complete challenge
- **`GET /api/v1/certificates/verify/:code`** - Verify certificate (Public)

#### Guru System
- **`POST /api/v1/guru/apply`** - Submit guru application
- **`POST /api/v1/guru/login`** - Guru authentication
- **`GET /api/v1/guru/profile`** - Get guru profile
- **`PUT /api/v1/guru/profile`** - Update guru profile

#### Admin Guru Management
- **`GET /api/v1/admin/gurus/pending`** - Get pending applications
- **`POST /api/v1/admin/gurus/approve/:id`** - Approve guru
- **`POST /api/v1/admin/gurus/reject/:id`** - Reject guru
- **`GET /api/v1/admin/gurus/stats`** - Get guru statistics

#### User System  
- **`POST /api/v1/auth/register`** - User registration
- **`POST /api/v1/auth/login`** - User authentication
- **`GET /api/v1/users/profile`** - Get user profile

> **📚 Complete API Reference**: See [`docs/COMPLETE_ROUTES_LIST.md`](./docs/COMPLETE_ROUTES_LIST.md)

## 🧪 Testing

### Run Tests
```bash
# All tests
npm test

# Specific test suite
npm run test:gurus
npm run test:users  
npm run test:admin
```

### Test Coverage
- **✅ Model Separation**: Validates guru/user independence
- **✅ Authentication**: Tests separate auth flows
- **✅ Admin Workflow**: End-to-end guru approval process  
- **✅ API Endpoints**: Comprehensive endpoint testing

## 🚀 Deployment

### Development
```bash
npm run dev          # Development server with hot reload
npm run test:watch   # Continuous testing
```

### Production
```bash
npm start           # Production server
npm run build       # Build assets (if applicable)
```

### Environment Setup
1. **Database**: Ensure MongoDB is running
2. **Admin User**: Created automatically on first startup  
3. **File Storage**: Configure Cloudinary for media uploads
4. **Email Service**: Setup SMTP for notifications

## 📊 Project Statistics

### Current Implementation
- **🏗️ Models**: 21+ database models (includes challenge system)
- **🔀 Routes**: 19+ route modules
- **🎮 Controllers**: 11+ controller modules  
- **🛡️ Middleware**: 10 middleware functions
- **🧪 Tests**: Comprehensive test coverage
- **📚 Documentation**: Complete API references
- **🌐 Endpoints**: 170+ total API endpoints

### Challenge System Features
- **🏆 Challenge Types**: 8 different challenge types
- **🎯 Automatic Rewards**: Points and badges system
- **📊 Real-time Leaderboards**: Dynamic ranking
- **🏅 Digital Certificates**: Auto-generation with verification
- **👑 Admin Dashboard**: Complete challenge management

### Guru System Metrics
- **👨‍🏫 Total Gurus**: Dynamic (admin managed)
- **📋 Application States**: pending → approved/rejected
- **🔐 Authentication**: Independent JWT system
- **📊 Admin Oversight**: Full lifecycle management

---

## 🤝 Contributing

### Development Workflow
1. **Feature Development**
   ```bash
   git checkout -b feature/guru-feature-name
   # Develop in appropriate system (guru/user/admin)
   npm test
   git commit -m "Add guru feature"
   ```

2. **Testing Requirements**
   - Unit tests for new functionality
   - Integration tests for API endpoints  
   - Separation validation for guru/user features

3. **Documentation Updates**
   - Update API documentation for new endpoints
   - Add examples and usage patterns
   - Update folder structure if needed

### Code Standards
- **Separation Principle**: Maintain guru/user independence
- **Security First**: Validate all inputs, secure all endpoints
- **Documentation**: Document all new features and endpoints
- **Testing**: Comprehensive test coverage required

## 📞 Support

### Documentation
- **🏗️ Architecture**: [`docs/ROUTE_SEPARATION_GUIDE.md`](./docs/ROUTE_SEPARATION_GUIDE.md)
- **📁 Structure**: [`docs/FOLDER_STRUCTURE.md`](./docs/FOLDER_STRUCTURE.md)
- **📖 API Reference**: [`docs/api/GURU_API_REFERENCE.md`](./docs/api/GURU_API_REFERENCE.md)

### Common Issues
- **Database Connection**: Ensure MongoDB is running and URI is correct
- **Admin Access**: Check admin credentials in environment variables
- **File Uploads**: Verify Cloudinary configuration
- **Email Issues**: Confirm SMTP settings for notifications

---

## 🙏 About SVARAM

**SVARAM** is dedicated to preserving and sharing Sanskrit knowledge through modern technology. Our platform connects passionate gurus with eager students in a structured, secure environment, enhanced with gamification and community features.

### Mission
Democratizing access to traditional Sanskrit education while maintaining the authenticity and depth of traditional guru-student relationships through innovative challenge systems and community engagement.

### Vision  
Creating the world's premier platform for Sanskrit learning with cutting-edge technology, traditional wisdom, and modern gamification to inspire continuous learning.

---

**Built with ❤️ for Sanskrit Education**

*For technical questions or contributions, please refer to our documentation or create an issue.*