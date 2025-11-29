# Backend Folder Structure

## Root Directory
```
Backend/
├── docs/                           # Documentation
│   ├── api/                        # API documentation
│   │   ├── GURU_API_REFERENCE.md  # Guru endpoint documentation
│   │   └── USER_API_REFERENCE.md  # User endpoint documentation  
│   ├── architecture/               # Architecture documents
│   │   ├── ROUTE_SEPARATION_GUIDE.md
│   │   └── DATABASE_SCHEMA.md
│   └── *.md                       # General documentation
├── scripts/                       # Utility scripts
│   ├── admin-tests/               # Admin system testing scripts
│   ├── setup/                     # Setup and migration scripts
│   └── *.ps1                      # PowerShell scripts
├── src/                           # Source code
├── tests/                         # Test suites
├── uploads/                       # File upload directory
├── package.json                   # Dependencies and scripts
├── .env.example                   # Environment variables template
└── README.md                      # Main documentation
```

## Source Code Structure
```
src/
├── app.js                         # Main application entry point
├── config/                        # Configuration files
│   ├── database.js                # MongoDB connection
│   ├── cloudinary.js              # File storage configuration
│   └── email.js                   # Email service configuration
├── models/                        # Database models
│   ├── Guru.js                    # Guru model (separate)
│   ├── User.js                    # User model (separate)
│   ├── Course.js                  # Course management
│   ├── Enrollment.js              # Student enrollments
│   ├── Progress.js                # Learning progress tracking
│   ├── Assessment.js              # Assessments and quizzes
│   ├── Video.js                   # Video content
│   ├── Comment.js                 # Video comments
│   ├── CommunityPost.js           # Community features
│   ├── Follow.js                  # User following system
│   ├── PaymentTransaction.js      # Payment processing
│   ├── Certificate.js             # Course certificates
│   ├── AudioRecording.js          # Audio content
│   ├── Shloka.js                  # Sanskrit verses
│   ├── Note.js                    # User notes
│   ├── ContentFile.js             # File management
│   └── VideoInteractions.js       # Video engagement
├── controllers/                   # Business logic
│   ├── guruAuthController.js      # Guru authentication (separate)
│   ├── adminGuruController.js     # Admin guru management (separate)
│   ├── authController.js          # User authentication
│   ├── courseController.js        # Course management
│   ├── enrollmentController.js    # Enrollment handling
│   ├── paymentController.js       # Payment processing
│   └── subscriptionController.js  # Subscription management
├── middleware/                    # Request middleware
│   ├── guruAuth.js                # Guru authentication middleware
│   ├── adminAuth.js               # Admin authentication middleware
│   ├── auth.js                    # User authentication middleware
│   ├── validation.js              # Request validation
│   ├── errorHandler.js            # Error handling
│   ├── notFound.js                # 404 handler
│   ├── roleCheck.js               # Role-based access
│   ├── courseValidation.js        # Course validation
│   ├── enrollmentValidation.js    # Enrollment validation
│   └── validateRequest.js         # General request validation
├── routes/                        # API routes
│   ├── guruAuth.js                # Guru routes (/api/v1/guru/*)
│   ├── adminGuru.js               # Admin guru routes (/api/v1/admin/gurus/*)
│   ├── authRoutes.js              # User authentication routes
│   ├── courses.js                 # Course management routes
│   ├── enrollments.js             # Enrollment routes
│   ├── payments.js                # Payment routes
│   ├── subscriptions.js           # Subscription routes
│   ├── progress.js                # Progress tracking routes
│   ├── assessments.js             # Assessment routes
│   ├── content.js                 # Content management routes
│   ├── videos.js                  # Video platform routes
│   ├── shorts.js                  # Short video routes
│   ├── community.js               # Community features routes
│   └── admin.js                   # General admin routes
├── services/                      # External services
│   ├── emailService.js            # Email notifications
│   ├── googleAuthService.js       # Google OAuth integration
│   ├── paymentService.js          # Payment processing
│   └── cloudinaryService.js      # File upload service
├── utils/                         # Utility functions
│   ├── catchAsync.js              # Async error handling
│   ├── appError.js                # Custom error class
│   ├── email.js                   # Email utilities
│   ├── adminBootstrap.js          # Admin user creation
│   └── helpers.js                 # General utilities
├── validators/                    # Input validation
│   ├── authValidators.js          # Authentication validation
│   ├── courseValidators.js        # Course validation
│   └── userValidators.js          # User data validation
├── templates/                     # Email templates
│   ├── welcome.html               # Welcome email
│   ├── reset-password.html        # Password reset
│   └── guru-approval.html         # Guru approval notification
├── ai/                           # AI integration
│   └── gemini/                    # Gemini AI services
└── audio/                        # Audio processing
    └── processing/                # Audio manipulation
```

## Key Separation Points

### 🔥 **Complete Route Separation**
```
Guru System:
├── /api/v1/guru/*                 # Guru operations
├── /api/v1/admin/gurus/*          # Admin guru management  
├── guruAuthController.js          # Guru business logic
├── adminGuruController.js         # Admin guru logic
├── guruAuth.js (middleware)       # Guru authentication
├── adminAuth.js (middleware)      # Admin authentication
└── Guru.js (model)                # Guru data model

User System:  
├── /api/v1/auth/*                 # User authentication
├── /api/v1/users/*                # User operations
├── authController.js              # User business logic
├── auth.js (middleware)           # User authentication  
└── User.js (model)                # User data model
```

### 🎯 **Admin Focus**
- **`/admin/gurus/*`** - Exclusive guru management interface
- **Separate dashboards** - Admin only sees guru-related tasks  
- **Focused workflow** - Application review → approve/reject → monitor
- **No user management mixing** - Clean separation of concerns

### 🚀 **Independent Systems**
- **Users**: Self-register → immediate access → learn content
- **Gurus**: Apply → admin review → approval → create content
- **No interdependence** - Systems operate completely separately

## File Organization Principles

### 1. **Separation of Concerns**
Each folder serves a specific purpose:
- `models/` - Data layer
- `controllers/` - Business logic  
- `routes/` - API endpoints
- `middleware/` - Request processing
- `services/` - External integrations

### 2. **Feature-Based Grouping**
Related functionality grouped together:
- Guru system files clearly identified
- Admin management separated
- User system independent

### 3. **Clear Naming Conventions**
- `guru*` prefix for guru-specific files
- `admin*` prefix for admin-specific files  
- Descriptive names indicating purpose

### 4. **Documentation Structure**
- `docs/api/` - API reference documentation
- `docs/architecture/` - System design documents
- `docs/*.md` - General documentation
- Inline code comments for complex logic

### 5. **Testing Organization**
- `tests/` - Automated test suites
- `scripts/admin-tests/` - Admin testing tools
- `scripts/setup/` - Database setup scripts

## Import Patterns

### Guru System Imports
```javascript
// Guru authentication
const { guruAuth, requireVerification } = require('../middleware/guruAuth');
const guruAuthController = require('../controllers/guruAuthController');
const Guru = require('../models/Guru');

// Admin guru management  
const { adminAuth } = require('../middleware/adminAuth');
const adminGuruController = require('../controllers/adminGuruController');
```

### User System Imports
```javascript
// User authentication
const { auth, authorize } = require('../middleware/auth');  
const authController = require('../controllers/authController');
const User = require('../models/User');
```

### Shared Utilities
```javascript
// Shared across systems
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { validate } = require('../middleware/validation');
```

## Development Workflow

### 1. **Adding New Guru Features**
```
1. Update Guru model (models/Guru.js)
2. Add controller method (controllers/guruAuthController.js)  
3. Create route (routes/guruAuth.js)
4. Add middleware if needed (middleware/guruAuth.js)
5. Update tests (tests/)
6. Update documentation (docs/api/)
```

### 2. **Adding Admin Features**
```
1. Add controller method (controllers/adminGuruController.js)
2. Create route (routes/adminGuru.js)  
3. Add validation (middleware/validation.js)
4. Update tests
5. Update documentation
```

### 3. **Adding User Features**
```
1. Update User model (models/User.js)
2. Add controller method (controllers/authController.js)
3. Create route (routes/authRoutes.js)  
4. Follow standard user workflow
```

## Deployment Structure

### Production Organization
```
Production/
├── src/                   # Application code
├── docs/                  # Documentation (optional)
├── node_modules/          # Dependencies
├── uploads/              # User uploads
├── logs/                 # Application logs
├── .env                  # Environment variables
└── package.json          # Dependencies
```

### Environment Considerations
- **Development**: Full structure with docs and tests
- **Staging**: Includes testing and documentation  
- **Production**: Minimal structure, exclude dev dependencies

This organization ensures:
✅ **Clear separation** between guru and user systems  
✅ **Easy maintenance** with logical file grouping  
✅ **Scalable structure** for future feature additions  
✅ **Developer-friendly** navigation and understanding  
✅ **Production-ready** deployment structure