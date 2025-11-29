# Route Separation Architecture Guide

## Overview

This document outlines the complete separation of Guru and User systems in the ShlokaYug platform, implemented to enable admin-focused guru management while maintaining independent user operations.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Route Structure](#route-structure)
3. [Authentication Systems](#authentication-systems)
4. [Model Separation](#model-separation)
5. [API Endpoints](#api-endpoints)
6. [Admin Management](#admin-management)
7. [Testing Guide](#testing-guide)
8. [Deployment Notes](#deployment-notes)

## Architecture Overview

### Problem Statement
- Admins were overwhelmed managing both gurus and regular users
- Guru approval process was mixed with general user management
- Need for focused admin workflow for teacher verification
- Requirement for separate authentication and authorization flows

### Solution
Complete separation of Guru and User systems with:
- **Separate Models**: `Guru.js` and `User.js` with distinct schemas
- **Separate Routes**: `/api/v1/guru/*` and `/api/v1/admin/gurus/*`
- **Separate Controllers**: Independent business logic for each user type
- **Separate Authentication**: Different middleware and validation rules

## Route Structure

```
/api/v1/
├── guru/                    # Guru-specific operations
│   ├── apply               # Guru application submission
│   ├── login               # Guru authentication (approved only)
│   ├── logout              # Guru session termination
│   ├── me                  # Guru profile management
│   ├── submit-application  # Submit for admin review
│   ├── application-status  # Check review status
│   └── update-password     # Password management
│
├── admin/gurus/            # Admin guru management
│   ├── stats              # Guru statistics dashboard
│   ├── pending            # Pending applications
│   ├── approved           # Approved gurus list
│   ├── application/:id    # Detailed application view
│   ├── :id/approve        # Approve guru application
│   ├── :id/reject         # Reject guru application
│   ├── :id/status         # Update guru status
│   └── :id/notes          # Add admin notes
│
└── auth/                   # Regular user operations
    ├── register            # Student/user registration
    ├── login               # User authentication
    └── ...                 # Standard user endpoints
```

## Authentication Systems

### Guru Authentication

**Middleware**: `src/middleware/guruAuth.js`

```javascript
const { guruAuth } = require('../middleware/guruAuth');

// Guru-specific middleware features:
// - Validates guru JWT tokens
// - Checks approval status (only approved gurus can access)
// - Verifies account activity status
// - Provides guru-specific rate limiting
```

**Key Features**:
- Only approved gurus can authenticate
- Separate JWT token validation
- Guru-specific permissions checking
- Expertise-based authorization

### User Authentication

**Middleware**: `src/middleware/auth.js`

```javascript
const { auth } = require('../middleware/auth');

// Standard user middleware:
// - User JWT validation
// - Role-based access control
// - Subscription-based features
// - Standard rate limiting
```

### Admin Authentication

**Middleware**: `src/middleware/adminAuth.js`

```javascript
const { adminAuth } = require('../middleware/adminAuth');

// Admin-specific features:
// - Admin role verification
// - Guru management permissions
// - Audit logging for admin actions
// - Enhanced security checks
```

## Model Separation

### Guru Model (`src/models/Guru.js`)

```javascript
// Key Fields:
{
  username: String,           // Unique guru identifier
  email: String,             // Contact email
  password: String,          // Hashed password
  
  profile: {
    firstName: String,
    lastName: String,
    phoneNumber: String,
    bio: String,
    // ... guru-specific profile fields
  },
  
  credentials: {
    teachingExperience: {
      totalYears: Number,
      // ... experience details
    },
    qualifications: [Object],
    // ... certification details
  },
  
  expertise: {
    subjects: [String],        // Teaching subjects
    experience: Number,
    // ... expertise details
  },
  
  applicationStatus: {
    status: String,            // draft, submitted, under-review, approved, rejected
    submittedAt: Date,
    reviewedAt: Date,
    reviewedBy: ObjectId,
    // ... application workflow
  },
  
  verification: {
    isVerified: Boolean,
    // ... verification details
  },
  
  accountStatus: {
    isApproved: Boolean,
    canCreateContent: Boolean,
    canTeach: Boolean,
    // ... account permissions
  }
}

// Key Methods:
guru.approve(adminId, notes)     // Approve application
guru.reject(adminId, reason)     // Reject application
guru.correctPassword(password)   // Password verification
guru.createPasswordResetToken() // Password reset
```

### User Model (`src/models/User.js`)

```javascript
// Key Fields (Student-focused):
{
  username: String,
  email: String,
  password: String,
  
  profile: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    // ... student profile fields
  },
  
  learningGoals: [String],     // Student learning objectives
  preferences: {
    language: String,
    // ... learning preferences
  },
  
  enrollments: [ObjectId],     // Course enrollments
  progress: [ObjectId],        // Learning progress
  achievements: [Object],      // Student achievements
  
  subscription: {
    plan: String,
    status: String,
    // ... subscription details
  }
}

// Note: NO guru-related fields in User model
// Complete separation maintained
```

## API Endpoints

### Guru Endpoints

#### Public Endpoints (No Authentication)

```http
POST /api/v1/guru/apply
Content-Type: application/json

{
  "username": "guru_username",
  "email": "guru@example.com",
  "password": "SecurePass123!",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "bio": "Experienced Sanskrit teacher"
  },
  "credentials": {
    "teachingExperience": {
      "totalYears": 5
    }
  },
  "expertise": {
    "subjects": ["sanskrit-grammar", "vedic-chanting"],
    "experience": 5
  }
}
```

```http
POST /api/v1/guru/login
Content-Type: application/json

{
  "identifier": "guru@example.com",
  "password": "SecurePass123!"
}
```

#### Protected Endpoints (Guru Authentication Required)

```http
GET /api/v1/guru/me
Authorization: Bearer <guru_jwt_token>
```

```http
PATCH /api/v1/guru/me
Authorization: Bearer <guru_jwt_token>
Content-Type: application/json

{
  "profile": {
    "bio": "Updated bio information"
  },
  "expertise": {
    "subjects": ["sanskrit-grammar", "vedic-chanting", "classical-literature"]
  }
}
```

```http
POST /api/v1/guru/submit-application
Authorization: Bearer <guru_jwt_token>
```

### Admin Endpoints (Admin Authentication Required)

```http
GET /api/v1/admin/gurus/pending
Authorization: Bearer <admin_jwt_token>
```

```http
GET /api/v1/admin/gurus/application/:guruId
Authorization: Bearer <admin_jwt_token>
```

```http
POST /api/v1/admin/gurus/:guruId/approve
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "approvalNotes": "Excellent qualifications and experience",
  "permissions": ["content-creation", "student-interaction"]
}
```

```http
POST /api/v1/admin/gurus/:guruId/reject
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "rejectionReason": "Insufficient teaching experience documentation"
}
```

## Admin Management

### Admin Dashboard Workflow

1. **View Pending Applications**
   ```javascript
   GET /api/v1/admin/gurus/pending
   // Returns list of submitted applications waiting for review
   ```

2. **Review Application Details**
   ```javascript
   GET /api/v1/admin/gurus/application/:id
   // Returns complete guru application with credentials and expertise
   ```

3. **Make Decision**
   ```javascript
   // Approve
   POST /api/v1/admin/gurus/:id/approve
   
   // Or Reject
   POST /api/v1/admin/gurus/:id/reject
   ```

4. **Post-Approval Management**
   ```javascript
   // View approved gurus
   GET /api/v1/admin/gurus/approved
   
   // Manage guru status
   PATCH /api/v1/admin/gurus/:id/status
   
   // Add administrative notes
   POST /api/v1/admin/gurus/:id/notes
   ```

### Admin Benefits

- **Focused Interface**: Only guru-related tasks in admin panel
- **Reduced Workload**: No regular user management mixed in
- **Better Oversight**: Dedicated tools for teacher verification
- **Audit Trail**: Complete tracking of approval decisions
- **Status Management**: Easy guru activation/suspension

## Testing Guide

### Manual Testing

1. **Test Guru Application Flow**
   ```bash
   # 1. Apply as guru
   curl -X POST http://localhost:5000/api/v1/guru/apply \
     -H "Content-Type: application/json" \
     -d '{"username":"test_guru","email":"test@guru.com","password":"Test123!","profile":{"firstName":"Test","lastName":"Guru"},"credentials":{"teachingExperience":{"totalYears":3}},"expertise":{"subjects":["sanskrit-grammar"],"experience":3}}'
   
   # 2. Login (should fail if not approved)
   curl -X POST http://localhost:5000/api/v1/guru/login \
     -H "Content-Type: application/json" \
     -d '{"identifier":"test@guru.com","password":"Test123!"}'
   ```

2. **Test Admin Approval Flow**
   ```bash
   # 1. Login as admin
   curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"admin_password"}'
   
   # 2. View pending applications
   curl -X GET http://localhost:5000/api/v1/admin/gurus/pending \
     -H "Authorization: Bearer <admin_token>"
   
   # 3. Approve guru
   curl -X POST http://localhost:5000/api/v1/admin/gurus/:id/approve \
     -H "Authorization: Bearer <admin_token>" \
     -H "Content-Type: application/json" \
     -d '{"approvalNotes":"Approved for testing"}'
   ```

### Automated Testing

Run the comprehensive test suite:

```bash
# Run separation test
node tests/separated-guru-system.test.js

# Expected output:
# ✅ Guru model creation: PASSED
# ✅ User model creation: PASSED
# ✅ Model separation: PASSED
# ✅ Application workflow: PASSED
# ✅ Guru methods: PASSED
# ✅ User independence: PASSED
# ✅ Search capabilities: PASSED
# ✅ System verification: PASSED
```

## Deployment Notes

### Environment Variables

```bash
# Required for guru system
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=your_mongodb_connection_string

# Email service (for notifications)
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password

# Admin credentials
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure_admin_password
```

### Database Considerations

1. **Indexes**: Ensure proper indexing for guru queries
   ```javascript
   // Guru model indexes
   db.gurus.createIndex({ "applicationStatus.status": 1 })
   db.gurus.createIndex({ "expertise.subjects": 1 })
   db.gurus.createIndex({ "accountStatus.isApproved": 1 })
   ```

2. **Migration**: If upgrading from mixed system:
   ```javascript
   // Separate existing guru users into Guru collection
   // Update all references and foreign keys
   // Verify data integrity after migration
   ```

### Security Considerations

1. **JWT Tokens**: Separate token validation for gurus and users
2. **Rate Limiting**: Different limits for guru and user operations
3. **Admin Access**: Strict admin role verification for guru management
4. **Audit Logging**: Track all admin actions on guru accounts

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**: Check import paths after restructuring
2. **Authentication failures**: Verify JWT secrets and token formats
3. **Validation errors**: Ensure request body matches model schemas
4. **Database connection**: Verify MongoDB connection and user permissions

### Debug Commands

```bash
# Check server health
curl http://localhost:5000/health

# Verify guru routes
curl http://localhost:5000/api/v1/guru/apply -X OPTIONS

# Check admin routes
curl http://localhost:5000/api/v1/admin/gurus/stats -X OPTIONS
```

---

## Contact & Support

For questions about the route separation implementation:
- Review this documentation
- Check the test files in `/tests/`
- Examine the implementation in `/src/routes/`, `/src/controllers/`, and `/src/middleware/`
- Run the automated tests to verify system functionality

## Version History

- **v1.0** - Initial separated implementation
- **v1.1** - Added comprehensive documentation and testing
- **v1.2** - Enhanced admin management features