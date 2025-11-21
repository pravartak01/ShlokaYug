# ShlokaYug API Testing Guide

## Overview
This guide provides comprehensive API testing examples using Postman, curl, and PowerShell's Invoke-WebRequest for the ShlokaYug LMS Platform Phase 2 features.

## Server Information
- **Base URL**: `http://localhost:5000`
- **API Version**: `v1`
- **Base API URL**: `http://localhost:5000/api/v1`

## Prerequisites

### 1. Start the Server
```bash
cd Backend
npm run dev
```
Server should start on `http://localhost:5000`

### 2. Environment Setup
Ensure `.env` file has proper configuration:
- MongoDB connection
- JWT secrets
- Razorpay test credentials

## Authentication Flow

### 1. Register a New User
**Endpoint**: `POST /api/v1/auth/register`

#### curl
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "username": "teststudent123",
    "password": "Test123!@#",
    "confirmPassword": "Test123!@#",
    "firstName": "Test",
    "lastName": "Student",
    "phone": "9876543210",
    "role": "student"
  }'
```

#### PowerShell Invoke-WebRequest
```powershell
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    email = "student@test.com"
    username = "teststudent123"
    password = "Test123!@#"
    confirmPassword = "Test123!@#"
    firstName = "Test"
    lastName = "Student"
    phone = "9876543210"
    role = "student"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/v1/auth/register" -Method POST -Headers $headers -Body $body
```

#### Postman
```json
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "email": "student@test.com",
  "username": "teststudent123",
  "password": "Test123!@#",
  "confirmPassword": "Test123!@#",
  "firstName": "Test",
  "lastName": "Student",
  "phone": "9876543210",
  "role": "student"
}
```

### 2. Login to Get JWT Token
**Endpoint**: `POST /api/v1/auth/login`

#### curl
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "Test123!@#"
  }'
```

#### PowerShell
```powershell
$loginBody = @{
    email = "student@test.com"
    password = "Test123!@#"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/v1/auth/login" -Method POST -Headers $headers -Body $loginBody
$loginData = $response.Content | ConvertFrom-Json
$token = $loginData.data.token

Write-Host "Token: $token"
```

**Save the JWT token from response for subsequent requests!**

## Enrollment Management APIs

### 1. Create a Test Course First
**Endpoint**: `POST /api/v1/courses`

#### curl
```bash
curl -X POST http://localhost:5000/api/v1/courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Vedic Mathematics Course",
    "description": "Learn ancient Indian mathematical techniques",
    "pricing": {
      "amount": 999,
      "currency": "INR",
      "type": "one_time"
    },
    "metadata": {
      "category": "Mathematics",
      "difficulty": "intermediate",
      "duration": 30
    }
  }'
```

### 2. Initiate Enrollment
**Endpoint**: `POST /api/v1/enrollments/initiate`

#### curl
```bash
curl -X POST http://localhost:5000/api/v1/enrollments/initiate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE_ID_FROM_PREVIOUS_STEP",
    "enrollmentType": "one_time",
    "deviceInfo": {
      "platform": "web",
      "userAgent": "Mozilla/5.0 Test Browser"
    }
  }'
```

#### PowerShell
```powershell
$authHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$enrollmentBody = @{
    courseId = "COURSE_ID_HERE"
    enrollmentType = "one_time"
    deviceInfo = @{
        platform = "web"
        userAgent = "Mozilla/5.0 Test Browser"
    }
} | ConvertTo-Json

$enrollResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/v1/enrollments/initiate" -Method POST -Headers $authHeaders -Body $enrollmentBody
$enrollData = $enrollResponse.Content | ConvertFrom-Json
Write-Host "Razorpay Order ID: $($enrollData.data.razorpay.orderId)"
```

### 3. Confirm Enrollment (Simulate Payment Success)
**Endpoint**: `POST /api/v1/enrollments/confirm`

#### curl
```bash
curl -X POST http://localhost:5000/api/v1/enrollments/confirm \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_from_initiate_response",
    "razorpay_payment_id": "pay_test_123456789",
    "razorpay_signature": "test_signature_abc123",
    "deviceInfo": {
      "platform": "web",
      "browser": "Chrome",
      "os": "Windows"
    }
  }'
```

### 4. Get User Enrollments
**Endpoint**: `GET /api/v1/enrollments/my-enrollments`

#### curl
```bash
curl -X GET "http://localhost:5000/api/v1/enrollments/my-enrollments?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### PowerShell
```powershell
$getEnrollments = Invoke-WebRequest -Uri "http://localhost:5000/api/v1/enrollments/my-enrollments" -Method GET -Headers $authHeaders
$enrollments = $getEnrollments.Content | ConvertFrom-Json
Write-Host "Total Enrollments: $($enrollments.data.pagination.totalEnrollments)"
```

### 5. Get Enrollment Details
**Endpoint**: `GET /api/v1/enrollments/:id`

#### curl
```bash
curl -X GET http://localhost:5000/api/v1/enrollments/ENROLLMENT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Update Learning Progress
**Endpoint**: `PATCH /api/v1/enrollments/:id/progress`

#### curl
```bash
curl -X PATCH http://localhost:5000/api/v1/enrollments/ENROLLMENT_ID/progress \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lectureId": "lecture_001",
    "timeSpent": 1800,
    "completed": true,
    "progress": 25
  }'
```

## Payment APIs

### 1. Create Payment Order
**Endpoint**: `POST /api/v1/payments/create-order`

#### curl
```bash
curl -X POST http://localhost:5000/api/v1/payments/create-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE_ID",
    "amount": 999,
    "currency": "INR"
  }'
```

### 2. Verify Payment
**Endpoint**: `POST /api/v1/payments/verify`

#### curl
```bash
curl -X POST http://localhost:5000/api/v1/payments/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_test_123",
    "razorpay_payment_id": "pay_test_456",
    "razorpay_signature": "signature_test_789"
  }'
```

### 3. Get Payment History
**Endpoint**: `GET /api/v1/payments/history`

#### curl
```bash
curl -X GET "http://localhost:5000/api/v1/payments/history?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Subscription Management APIs

### 1. Pause Subscription
**Endpoint**: `POST /api/v1/subscriptions/:enrollmentId/pause`

#### curl
```bash
curl -X POST http://localhost:5000/api/v1/subscriptions/ENROLLMENT_ID/pause \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Temporary break",
    "effectiveDate": "2025-12-01T00:00:00.000Z"
  }'
```

### 2. Resume Subscription
**Endpoint**: `POST /api/v1/subscriptions/:enrollmentId/resume`

#### curl
```bash
curl -X POST http://localhost:5000/api/v1/subscriptions/ENROLLMENT_ID/resume \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Cancel Subscription
**Endpoint**: `POST /api/v1/subscriptions/:enrollmentId/cancel`

#### curl
```bash
curl -X POST http://localhost:5000/api/v1/subscriptions/ENROLLMENT_ID/cancel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Not satisfied with course",
    "cancelAtPeriodEnd": true
  }'
```

## Device Management APIs

### 1. Get Registered Devices
**Endpoint**: `GET /api/v1/enrollments/:id/devices`

#### curl
```bash
curl -X GET http://localhost:5000/api/v1/enrollments/ENROLLMENT_ID/devices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Add New Device
**Endpoint**: `POST /api/v1/enrollments/:id/devices`

#### curl
```bash
curl -X POST http://localhost:5000/api/v1/enrollments/ENROLLMENT_ID/devices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceInfo": {
      "platform": "mobile",
      "browser": "Safari",
      "os": "iOS",
      "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"
    }
  }'
```

### 3. Remove Device
**Endpoint**: `DELETE /api/v1/enrollments/:id/devices/:deviceId`

#### curl
```bash
curl -X DELETE http://localhost:5000/api/v1/enrollments/ENROLLMENT_ID/devices/DEVICE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Analytics APIs

### 1. Get Enrollment Analytics
**Endpoint**: `GET /api/v1/enrollments/analytics`

#### curl
```bash
curl -X GET "http://localhost:5000/api/v1/enrollments/analytics?period=month&startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Get Subscription Analytics
**Endpoint**: `GET /api/v1/subscriptions/analytics`

#### curl
```bash
curl -X GET "http://localhost:5000/api/v1/subscriptions/analytics?period=month" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Testing Workflow

### Complete End-to-End Test Sequence

#### PowerShell Script
```powershell
# 1. Set base URL
$baseUrl = "http://localhost:5000/api/v1"

# 2. Register user
$registerBody = @{
    email = "test$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
    password = "Test123!@#"
    confirmPassword = "Test123!@#"
    profile = @{
        firstName = "Test"
        lastName = "User"
        phone = "9876543210"
    }
    role = "student"
} | ConvertTo-Json

$headers = @{ "Content-Type" = "application/json" }
$registerResponse = Invoke-WebRequest -Uri "$baseUrl/auth/register" -Method POST -Headers $headers -Body $registerBody
Write-Host "Registration: $($registerResponse.StatusCode)"

# 3. Login to get token
$loginBody = @{
    email = ($registerBody | ConvertFrom-Json).email
    password = "Test123!@#"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Headers $headers -Body $loginBody
$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.data.token
Write-Host "Login successful. Token obtained."

# 4. Set auth headers for subsequent requests
$authHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 5. Test enrollment endpoints
$enrollmentsResponse = Invoke-WebRequest -Uri "$baseUrl/enrollments/my-enrollments" -Method GET -Headers $authHeaders
Write-Host "Get Enrollments: $($enrollmentsResponse.StatusCode)"

# 6. Test payment endpoints
$paymentsResponse = Invoke-WebRequest -Uri "$baseUrl/payments/history" -Method GET -Headers $authHeaders
Write-Host "Get Payment History: $($paymentsResponse.StatusCode)"

Write-Host "API Testing Complete!"
```

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "timestamp": "2025-11-21T14:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "timestamp": "2025-11-21T14:30:00.000Z"
}
```

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required",
      "value": ""
    }
  ]
}
```

## Environment Variables for Testing

```env
# Test Environment Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://your-connection-string

# JWT
JWT_SECRET=your-jwt-secret-for-testing
JWT_EXPIRE=7d

# Razorpay Test Credentials
RAZORPAY_KEY_ID=rzp_test_1234567890
RAZORPAY_KEY_SECRET=test_secret_key_1234567890abcdef
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check JWT token is included in Authorization header
2. **403 Forbidden**: Verify user role has permission for the endpoint
3. **404 Not Found**: Ensure endpoint URL is correct and server is running
4. **500 Internal Server Error**: Check server logs for detailed error information
5. **Payment Gateway Error**: Verify Razorpay credentials are configured correctly

### Debug Tips

1. **Check Server Status**: `GET http://localhost:5000/health`
2. **Validate JWT Token**: Use online JWT decoder to check token contents
3. **Monitor Server Logs**: Watch console output for detailed error messages
4. **Test Database Connection**: Verify MongoDB connection in server startup logs
5. **Verify Environment Variables**: Check `.env` file configuration

---

*Note: Replace placeholder values like `YOUR_JWT_TOKEN`, `COURSE_ID`, `ENROLLMENT_ID` with actual values from your API responses.*