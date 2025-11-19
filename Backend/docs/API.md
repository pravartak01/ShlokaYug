# Chandas Identifier API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": boolean,
  "message": "string",
  "data": object | null,
  "errors": array | null
}
```

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "isEmailVerified": false
    }
  }
}
```

### Login User
**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isEmailVerified": true,
      "profile": {...}
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

### Refresh Token
**POST** `/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

### Logout
**POST** `/auth/logout`
*Requires Authentication*

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

### Verify Email
**GET** `/auth/verify-email/:token`

Verify email address using token from email.

### Forgot Password
**POST** `/auth/forgot-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### Reset Password
**PUT** `/auth/reset-password/:token`

Reset password using token from email.

**Request Body:**
```json
{
  "password": "NewPassword123"
}
```

### Get Current User
**GET** `/auth/me`
*Requires Authentication*

Get current user information.

## User Management Endpoints

### Update Profile
**PUT** `/user/profile`
*Requires Authentication*

**Request Body:**
```json
{
  "name": "Updated Name",
  "avatar": "https://example.com/avatar.jpg",
  "profile": {
    "level": "intermediate",
    "favoriteMeters": ["anushtup", "gayatri"],
    "preferences": {
      "language": "hindi",
      "notifications": {
        "email": true,
        "push": false
      }
    }
  }
}
```

### Update Learning Progress
**PUT** `/user/progress`
*Requires Authentication*

**Request Body:**
```json
{
  "shlokasCompleted": 25,
  "accuracy": 85.5,
  "streakDays": 7
}
```

### Change Password
**PUT** `/user/change-password`
*Requires Authentication*

**Request Body:**
```json
{
  "currentPassword": "CurrentPassword123",
  "newPassword": "NewPassword123"
}
```

### Get User Statistics
**GET** `/user/stats`
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalShlokasCompleted": 25,
      "currentAccuracy": 85.5,
      "currentStreak": 7,
      "level": "intermediate",
      "favoriteMetersCount": 3,
      "memberSince": "2024-01-01T00:00:00.000Z",
      "lastPractice": "2024-01-15T00:00:00.000Z"
    }
  }
}
```

### Delete Account
**DELETE** `/user/account`
*Requires Authentication*

**Request Body:**
```json
{
  "password": "CurrentPassword123"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 423 | Locked (Account locked) |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Rate Limiting
- 100 requests per 15 minutes per IP address
- Rate limit headers included in response

## CORS
- Configured for frontend URL
- Credentials supported
- Preflight requests handled

## Security Features
- JWT tokens with short expiry
- Refresh token rotation
- Account lockout after failed attempts
- Password complexity requirements
- Input validation and sanitization
- Rate limiting
- CORS protection
- Security headers with Helmet