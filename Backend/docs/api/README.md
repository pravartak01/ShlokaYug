# API Documentation

This directory contains comprehensive API documentation for the ShlokaYug Learning Management System.

## 📁 Documentation Structure

```
api/
├── README.md                    # This overview
├── authentication.md            # Authentication & authorization
├── course-management.md         # Course API endpoints  
├── payment-gateway.md          # Payment system API
├── user-management.md          # User profile management
└── response-formats.md         # Standard API responses
```

## 🔗 Quick Reference

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
```
Authorization: Bearer <JWT_TOKEN>
```

### Core Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/health` - Service health check

#### Courses
- `GET /courses` - List all courses
- `POST /courses` - Create new course (guru only)
- `GET /courses/:id` - Get course details
- `PUT /courses/:id` - Update course (instructor only)

#### Payments
- `GET /payments/methods` - Get payment options
- `POST /payments/create-order` - Create payment order
- `POST /payments/verify` - Verify payment signature

## 📊 API Status

### Current Implementation Status
- ✅ Authentication API (100%)
- ✅ Course Management API (95%)
- ✅ Payment Gateway API (73%)
- 🚧 User Management API (In Progress)
- 📋 Enrollment API (Planned)

### Response Format
All APIs follow consistent response structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

## 🧪 Testing

API endpoints are comprehensively tested. See:
- [Payment Gateway Testing Guide](../testing/PAYMENT_GATEWAY_TESTING_GUIDE.md)
- [Test Scripts](../tests/)

---

For detailed API specifications, see individual documentation files in this directory.