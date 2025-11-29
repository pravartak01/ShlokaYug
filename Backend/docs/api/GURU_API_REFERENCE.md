# API Reference - Separated Guru & User System

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication

### JWT Token Format
```
Authorization: Bearer <token>
```

### Token Types
- **User Token**: For regular user operations
- **Guru Token**: For approved guru operations  
- **Admin Token**: For administrative operations

## Guru Endpoints

### Public Endpoints

#### Apply as Guru
```http
POST /guru/apply
```

**Request Body:**
```json
{
  "username": "string (3-50 chars, alphanumeric + underscore)",
  "email": "string (valid email)",
  "password": "string (min 8 chars, must contain uppercase, lowercase, number, special char)",
  "profile": {
    "firstName": "string (required, max 50 chars)",
    "lastName": "string (required, max 50 chars)", 
    "phoneNumber": "string (optional, valid phone format)",
    "bio": "string (optional, max 1000 chars)",
    "languages": ["string"],
    "timezone": "string"
  },
  "credentials": {
    "teachingExperience": {
      "totalYears": "number (required, >= 0)"
    }
  },
  "expertise": {
    "subjects": ["string (valid subjects)"],
    "experience": "number",
    "qualifications": [
      {
        "degree": "string",
        "institution": "string", 
        "year": "number"
      }
    ]
  }
}
```

**Valid Subjects:**
- `sanskrit-grammar`
- `vedic-chanting`
- `chandas-prosody`
- `shloka-composition`
- `classical-literature`
- `vedic-literature`
- `bhagavad-gita`
- `ramayana`
- `mahabharata`
- `upanishads`
- `puranas`
- `ayurveda`
- `jyotisha`
- `yoga-philosophy`
- `meditation`
- `other`

**Response:**
```json
{
  "success": true,
  "message": "Guru application created successfully",
  "data": {
    "guru": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "applicationStatus": {
        "status": "draft",
        "createdAt": "ISO date"
      }
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "string",
        "message": "string",
        "value": "any"
      }
    ]
  }
}
```

#### Guru Login
```http
POST /guru/login
```

**Request Body:**
```json
{
  "identifier": "string (email or username)",
  "password": "string"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "string (JWT token)",
    "guru": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "profile": {
        "firstName": "string",
        "lastName": "string"
      },
      "applicationStatus": {
        "status": "approved"
      }
    }
  }
}
```

**Error Response (Not Approved):**
```json
{
  "success": false,
  "error": {
    "message": "Guru account not approved or suspended",
    "code": "GURU_NOT_APPROVED"
  }
}
```

#### Forgot Password
```http
POST /guru/forgot-password
```

**Request Body:**
```json
{
  "email": "string (valid email)"
}
```

#### Reset Password
```http
PATCH /guru/reset-password/:token
```

**Request Body:**
```json
{
  "password": "string (min 8 chars with complexity)",
  "passwordConfirm": "string (must match password)"
}
```

### Protected Endpoints (Guru Authentication Required)

#### Get Current Guru Profile
```http
GET /guru/me
Authorization: Bearer <guru_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "guru": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "profile": {
        "firstName": "string",
        "lastName": "string",
        "phoneNumber": "string",
        "bio": "string",
        "languages": ["string"],
        "timezone": "string"
      },
      "expertise": {
        "subjects": ["string"],
        "experience": "number",
        "qualifications": ["object"]
      },
      "applicationStatus": {
        "status": "string",
        "submittedAt": "ISO date",
        "reviewedAt": "ISO date",
        "approvalNotes": "string"
      },
      "verification": {
        "isVerified": "boolean"
      },
      "accountStatus": {
        "isApproved": "boolean",
        "canCreateContent": "boolean",
        "canTeach": "boolean"
      }
    }
  }
}
```

#### Update Guru Profile
```http
PATCH /guru/me
Authorization: Bearer <guru_token>
```

**Request Body:**
```json
{
  "profile": {
    "bio": "string (optional)",
    "languages": ["string (optional)"],
    "timezone": "string (optional)"
  },
  "expertise": {
    "subjects": ["string (optional)"],
    "qualifications": ["object (optional)"]
  }
}
```

#### Submit Application for Review
```http
POST /guru/submit-application
Authorization: Bearer <guru_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted for admin review",
  "data": {
    "applicationStatus": {
      "status": "submitted",
      "submittedAt": "ISO date"
    }
  }
}
```

#### Get Application Status
```http
GET /guru/application-status
Authorization: Bearer <guru_token>
```

#### Update Password
```http
PATCH /guru/update-password
Authorization: Bearer <guru_token>
```

**Request Body:**
```json
{
  "passwordCurrent": "string",
  "password": "string (new password)",
  "passwordConfirm": "string (confirm new password)"
}
```

#### Logout
```http
POST /guru/logout
Authorization: Bearer <guru_token>
```

## Admin Guru Management Endpoints

All admin endpoints require admin authentication.

### Get Guru Statistics
```http
GET /admin/gurus/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalGurus": "number",
      "pendingApplications": "number",
      "approvedGurus": "number",
      "rejectedApplications": "number",
      "activeGurus": "number",
      "suspendedGurus": "number"
    }
  }
}
```

### Get Pending Applications
```http
GET /admin/gurus/pending
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `sortBy` (optional): Sort field (`submittedAt`, `createdAt`)
- `order` (optional): Sort order (`asc`, `desc`)

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "_id": "string",
        "username": "string", 
        "email": "string",
        "profile": {
          "firstName": "string",
          "lastName": "string"
        },
        "applicationStatus": {
          "status": "submitted",
          "submittedAt": "ISO date"
        },
        "expertise": {
          "subjects": ["string"],
          "experience": "number"
        }
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number", 
      "total": "number",
      "pages": "number"
    }
  }
}
```

### Get Approved Gurus
```http
GET /admin/gurus/approved
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `search`: Search by username, email, or name

### Get Application Details
```http
GET /admin/gurus/application/:id
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "guru": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "profile": {
        "firstName": "string",
        "lastName": "string",
        "phoneNumber": "string",
        "bio": "string"
      },
      "credentials": {
        "teachingExperience": {
          "totalYears": "number"
        }
      },
      "expertise": {
        "subjects": ["string"],
        "experience": "number",
        "qualifications": [
          {
            "degree": "string",
            "institution": "string", 
            "year": "number"
          }
        ]
      },
      "applicationStatus": {
        "status": "string",
        "submittedAt": "ISO date"
      }
    }
  }
}
```

### Approve Guru Application
```http
POST /admin/gurus/:id/approve
Authorization: Bearer <admin_token>
```

**Request Body (Optional):**
```json
{
  "approvalNotes": "string (max 500 chars)",
  "permissions": ["string array"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Guru approved successfully",
  "data": {
    "guru": {
      "_id": "string",
      "applicationStatus": {
        "status": "approved",
        "reviewedAt": "ISO date",
        "reviewedBy": "admin_id",
        "approvalNotes": "string"
      },
      "accountStatus": {
        "isApproved": true,
        "canCreateContent": true,
        "canTeach": true
      }
    }
  }
}
```

### Reject Guru Application
```http
POST /admin/gurus/:id/reject
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "rejectionReason": "string (required, 10-500 chars)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Guru application rejected",
  "data": {
    "guru": {
      "_id": "string",
      "applicationStatus": {
        "status": "rejected",
        "reviewedAt": "ISO date",
        "reviewedBy": "admin_id",
        "rejectionReason": "string"
      }
    }
  }
}
```

### Update Guru Status
```http
PATCH /admin/gurus/:id/status
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "action": "string (suspend | activate)",
  "reason": "string (required for suspend, 10-500 chars)"
}
```

### Add Admin Note
```http
POST /admin/gurus/:id/notes
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "note": "string (5-1000 chars)"
}
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "message": "string",
    "code": "string",
    "timestamp": "ISO date"
  }
}
```

### Common Error Codes

#### Authentication Errors
- `AUTHENTICATION_REQUIRED`: No token provided
- `INVALID_TOKEN`: Malformed or invalid token
- `TOKEN_EXPIRED`: Token has expired
- `TOKEN_INVALIDATED`: Token has been blacklisted

#### Authorization Errors  
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `GURU_NOT_APPROVED`: Guru account not approved
- `GURU_VERIFICATION_REQUIRED`: Email/phone verification needed
- `INSUFFICIENT_EXPERTISE`: Missing required expertise

#### Validation Errors
- `VALIDATION_ERROR`: Request validation failed
- `DUPLICATE_RESOURCE`: Resource already exists (email/username)
- `RESOURCE_NOT_FOUND`: Requested resource not found

#### Rate Limiting
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `IP_RATE_LIMIT_EXCEEDED`: Too many requests from IP

#### Server Errors
- `INTERNAL_SERVER_ERROR`: Unexpected server error
- `DATABASE_ERROR`: Database operation failed

## Rate Limits

### Guru Endpoints
- **Authentication**: 5 requests per 15 minutes per IP
- **Application**: 3 submissions per hour per IP  
- **General**: 500 requests per hour per authenticated guru
- **Password Operations**: 3 attempts per 15 minutes

### Admin Endpoints
- **General**: 1000 requests per hour per admin
- **Bulk Operations**: 100 requests per hour per admin

### User Endpoints
- **Authentication**: 5 requests per 15 minutes per IP
- **General**: 1000 requests per hour per authenticated user

## Status Codes

- `200`: Success
- `201`: Created successfully
- `400`: Bad request/validation error
- `401`: Unauthorized 
- `403`: Forbidden
- `404`: Not found
- `409`: Conflict (duplicate resource)
- `422`: Unprocessable entity (validation failed)
- `429`: Too many requests
- `500`: Internal server error

## Testing

### Test Guru Application Flow
```bash
# 1. Apply as guru
curl -X POST http://localhost:5000/api/v1/guru/apply \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_guru",
    "email": "test@example.com",
    "password": "TestPass123!",
    "profile": {
      "firstName": "Test",
      "lastName": "Guru"
    },
    "credentials": {
      "teachingExperience": {
        "totalYears": 3
      }
    },
    "expertise": {
      "subjects": ["sanskrit-grammar"],
      "experience": 3
    }
  }'

# 2. Submit application (after login)
curl -X POST http://localhost:5000/api/v1/guru/submit-application \
  -H "Authorization: Bearer <guru_token>"

# 3. Admin approve (after admin login)  
curl -X POST http://localhost:5000/api/v1/admin/gurus/:id/approve \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"approvalNotes": "Approved for testing"}'

# 4. Guru login (should now work)
curl -X POST http://localhost:5000/api/v1/guru/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "TestPass123!"
  }'
```