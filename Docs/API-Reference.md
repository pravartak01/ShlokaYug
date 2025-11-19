# ShlokaYug API Reference

## 🚀 Quick Start

### **Base URL**
```
Development: http://localhost:5000/api/v1
Production: https://api.shlokayug.com/v1
```

### **Authentication**
```http
Authorization: Bearer <jwt_access_token>
```

### **Content Type**
```http
Content-Type: application/json
```

---

## 📋 Authentication Endpoints

### **POST /auth/register**
Register a new user account.

**Rate Limit:** 10 requests per 15 minutes per IP

**Request Body:**
```json
{
  "email": "string (required, valid email)",
  "username": "string (required, 3-20 chars, alphanumeric + underscore)",
  "password": "string (required, min 8 chars, 1 upper, 1 lower, 1 number)",
  "firstName": "string (required, 1-50 chars, letters only)",
  "lastName": "string (required, 1-50 chars, letters only)",
  "preferredScript": "string (optional, devanagari|iast|itrans)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "data": {
    "user": {
      "id": "string",
      "email": "string",
      "username": "string",
      "profile": {
        "firstName": "string",
        "lastName": "string",
        "preferredScript": "string",
        "avatar": null,
        "fullName": "string"
      },
      "role": "student",
      "subscription": {
        "plan": "free",
        "status": "active",
        "startDate": "ISO_DATE"
      },
      "isEmailVerified": false
    },
    "tokens": {
      "access": "JWT_STRING",
      "refresh": "JWT_STRING",
      "expiresIn": "7d"
    }
  }
}
```

**Error Responses:**
```json
// 409 - User already exists
{
  "success": false,
  "error": {
    "message": "Email is already registered",
    "code": "USER_EXISTS",
    "field": "email"
  }
}

// 422 - Validation error
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "password",
        "message": "Password must be at least 8 characters long",
        "value": "123",
        "location": "body"
      }
    ],
    "timestamp": "ISO_DATE"
  }
}

// 429 - Rate limit exceeded
{
  "success": false,
  "error": {
    "message": "Too many registration attempts, please try again later",
    "code": "RATE_LIMIT_REGISTRATION"
  }
}
```

---

### **POST /auth/login**
Login with email/username and password.

**Rate Limit:** 20 requests per 15 minutes per IP

**Request Body:**
```json
{
  "identifier": "string (required, email or username)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "string",
      "email": "string",
      "username": "string",
      "profile": {
        "firstName": "string",
        "lastName": "string",
        "preferredScript": "string",
        "avatar": "string|null",
        "fullName": "string"
      },
      "role": "student|guru|admin",
      "subscription": {
        "plan": "free|premium|enterprise",
        "status": "active|inactive|expired",
        "startDate": "ISO_DATE",
        "endDate": "ISO_DATE|null"
      },
      "gamification": {
        "level": "number",
        "totalXP": "number",
        "currentXP": "number",
        "xpToNextLevel": "number",
        "streaks": {
          "current": "number",
          "longest": "number",
          "lastActivity": "ISO_DATE"
        }
      },
      "isEmailVerified": "boolean"
    },
    "tokens": {
      "access": "JWT_STRING",
      "refresh": "JWT_STRING",
      "expiresIn": "7d"
    }
  }
}
```

**Error Responses:**
```json
// 401 - Invalid credentials
{
  "success": false,
  "error": {
    "message": "Invalid credentials",
    "code": "INVALID_CREDENTIALS"
  }
}

// 403 - Account suspended
{
  "success": false,
  "error": {
    "message": "Account is suspended",
    "code": "ACCOUNT_SUSPENDED",
    "bannedUntil": "ISO_DATE",
    "reason": "string"
  }
}
```

---

### **POST /auth/logout**
Logout and invalidate current token.

**Authentication:** Required

**Request Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### **POST /auth/refresh-token**
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "tokens": {
      "access": "JWT_STRING",
      "refresh": "JWT_STRING",
      "expiresIn": "7d"
    }
  }
}
```

**Error Responses:**
```json
// 401 - Invalid refresh token
{
  "success": false,
  "error": {
    "message": "Invalid refresh token",
    "code": "INVALID_REFRESH_TOKEN"
  }
}
```

---

### **POST /auth/forgot-password**
Request password reset email.

**Rate Limit:** 5 requests per hour per IP

**Request Body:**
```json
{
  "email": "string (required, valid email)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### **POST /auth/reset-password**
Reset password using token from email.

**Request Body:**
```json
{
  "token": "string (required, reset token from email)",
  "password": "string (required, min 8 chars, 1 upper, 1 lower, 1 number)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": {
    "tokens": {
      "access": "JWT_STRING",
      "refresh": "JWT_STRING",
      "expiresIn": "7d"
    }
  }
}
```

**Error Responses:**
```json
// 400 - Invalid or expired token
{
  "success": false,
  "error": {
    "message": "Invalid or expired reset token",
    "code": "INVALID_RESET_TOKEN"
  }
}
```

---

### **POST /auth/verify-email**
Verify email address using token from email.

**Request Body:**
```json
{
  "token": "string (required, verification token from email)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "xpEarned": 50
  }
}
```

**Error Responses:**
```json
// 400 - Invalid or expired token
{
  "success": false,
  "error": {
    "message": "Invalid or expired verification token",
    "code": "INVALID_VERIFICATION_TOKEN"
  }
}
```

---

### **POST /auth/resend-verification**
Resend email verification.

**Authentication:** Required

**Request Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

**Error Responses:**
```json
// 400 - Email already verified
{
  "success": false,
  "error": {
    "message": "Email is already verified",
    "code": "EMAIL_ALREADY_VERIFIED"
  }
}
```

---

### **POST /auth/google**
Login/register with Google OAuth.

**Request Body:**
```json
{
  "tokenId": "string (required, Google ID token)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "user": {
      // Same structure as login response
    },
    "tokens": {
      "access": "JWT_STRING",
      "refresh": "JWT_STRING",
      "expiresIn": "7d"
    }
  }
}
```

**Error Responses:**
```json
// 401 - Invalid Google token
{
  "success": false,
  "error": {
    "message": "Invalid Google token",
    "code": "INVALID_GOOGLE_TOKEN"
  }
}
```

---

### **POST /auth/change-password**
Change password for authenticated user.

**Authentication:** Required

**Request Body:**
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 8 chars, 1 upper, 1 lower, 1 number)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully. Please login again."
}
```

**Error Responses:**
```json
// 401 - Incorrect current password
{
  "success": false,
  "error": {
    "message": "Current password is incorrect",
    "code": "INVALID_CURRENT_PASSWORD"
  }
}
```

---

### **GET /auth/profile**
Get current user profile.

**Authentication:** Required

**Request Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      // Complete user profile object
    }
  }
}
```

---

### **GET /auth/status**
Check authentication status.

**Authentication:** Required

**Request Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "isAuthenticated": true,
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "string",
      "subscription": "object",
      "isEmailVerified": "boolean"
    }
  }
}
```

---

### **GET /auth/health**
Health check for authentication service.

**Request Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "message": "Authentication service is healthy",
  "timestamp": "ISO_DATE"
}
```

---

## 🔐 JWT Token Structure

### **Access Token Payload:**
```json
{
  "id": "user_id",
  "email": "user_email",
  "username": "username",
  "role": "student|guru|admin",
  "iat": 1632150000,
  "exp": 1632754800
}
```

### **Refresh Token Payload:**
```json
{
  "id": "user_id",
  "type": "refresh",
  "iat": 1632150000,
  "exp": 1634742000
}
```

---

## 📈 Rate Limiting

| Endpoint | Limit | Window |
|----------|--------|---------|
| `/auth/register` | 10 requests | 15 minutes |
| `/auth/login` | 20 requests | 15 minutes |
| `/auth/forgot-password` | 5 requests | 1 hour |
| Other endpoints | 100 requests | 15 minutes |

---

## ❌ Error Codes

| Code | Description |
|------|-------------|
| `USER_EXISTS` | Email or username already registered |
| `INVALID_CREDENTIALS` | Incorrect email/username or password |
| `INVALID_TOKEN` | JWT token is invalid or expired |
| `INVALID_REFRESH_TOKEN` | Refresh token is invalid or expired |
| `INVALID_RESET_TOKEN` | Password reset token is invalid or expired |
| `INVALID_VERIFICATION_TOKEN` | Email verification token is invalid or expired |
| `INVALID_GOOGLE_TOKEN` | Google OAuth token is invalid |
| `EMAIL_ALREADY_VERIFIED` | Email is already verified |
| `ACCOUNT_SUSPENDED` | User account is suspended |
| `VALIDATION_ERROR` | Request body validation failed |
| `RATE_LIMIT_*` | Rate limit exceeded for specific endpoint |

---

## 🧪 Example Requests

### **cURL Examples**

**Register User:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "username": "johndoe",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Login User:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

**Get Profile:**
```bash
curl -X GET http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **JavaScript Fetch Examples**

**Register User:**
```javascript
const response = await fetch('http://localhost:5000/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john.doe@example.com',
    username: 'johndoe',
    password: 'SecurePass123!',
    firstName: 'John',
    lastName: 'Doe'
  })
});

const data = await response.json();
console.log(data);
```

**Login User:**
```javascript
const response = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    identifier: 'john.doe@example.com',
    password: 'SecurePass123!'
  })
});

const data = await response.json();
const { access, refresh } = data.data.tokens;

// Store tokens for future requests
localStorage.setItem('accessToken', access);
localStorage.setItem('refreshToken', refresh);
```

**Authenticated Request:**
```javascript
const token = localStorage.getItem('accessToken');

const response = await fetch('http://localhost:5000/api/v1/auth/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data);
```

---

## 📱 Frontend Integration

### **Token Management**
```javascript
class AuthService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api/v1';
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  async makeAuthenticatedRequest(url, options = {}) {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      await this.refreshAccessToken();
      return this.makeAuthenticatedRequest(url, options);
    }

    return response;
  }

  async refreshAccessToken() {
    const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refreshToken: this.refreshToken
      })
    });

    if (response.ok) {
      const data = await response.json();
      this.accessToken = data.data.tokens.access;
      this.refreshToken = data.data.tokens.refresh;
      
      localStorage.setItem('accessToken', this.accessToken);
      localStorage.setItem('refreshToken', this.refreshToken);
    } else {
      // Refresh failed, redirect to login
      this.logout();
      window.location.href = '/login';
    }
  }

  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
```

---

*API Documentation - ShlokaYug Backend v1.0*  
*Last updated: November 19, 2025*