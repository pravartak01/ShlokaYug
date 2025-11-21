# Phase 2: Enrollment & Payment System Architecture

## 🎯 Overview
Phase 2 builds upon Phase 1's Course Management System to create a comprehensive enrollment and payment infrastructure. This system handles course enrollments, subscription management, device tracking, and revenue sharing.

---

## 📋 Core Requirements

### **Functional Requirements**
- ✅ Course enrollment with payment processing
- ✅ Device-based access control (max 3 devices per user)
- ✅ Subscription management (monthly/yearly cycles)  
- ✅ One-time purchase support
- ✅ 80/20 revenue sharing (Student/Guru)
- ✅ Payment webhook handling
- ✅ Access expiration management
- ✅ Enrollment analytics and reporting

### **Non-Functional Requirements**
- ✅ Secure payment processing (Razorpay integration)
- ✅ High availability for payment operations
- ✅ Audit trails for all transactions
- ✅ Real-time access validation
- ✅ Scalable architecture for growth

---

## 🏗️ System Architecture

### **Enhanced Data Models**

#### **1. Enhanced Enrollment Model**
```javascript
{
  // Core enrollment information
  userId: ObjectId,           // Reference to User (student)
  courseId: ObjectId,         // Reference to Course  
  guruId: ObjectId,          // Reference to Course instructor
  enrollmentType: String,     // 'subscription' | 'one_time'
  enrollmentDate: Date,
  
  // Payment information
  payment: {
    paymentId: String,        // Razorpay payment_id
    orderId: String,          // Razorpay order_id
    amount: Number,           // Amount paid
    currency: String,         // 'INR' | 'USD'
    status: String,           // 'pending' | 'completed' | 'failed' | 'refunded'
    paymentMethod: String,    // 'card' | 'upi' | 'netbanking' | 'wallet'
    razorpaySignature: String,
    paymentDate: Date,
    
    // Revenue sharing
    revenueShare: {
      studentAmount: Number,   // 80% to platform/student
      guruAmount: Number,      // 20% to guru
      platformFee: Number,    // Platform fee calculation
      processingFee: Number   // Payment gateway fee
    }
  },
  
  // Subscription management  
  subscription: {
    startDate: Date,
    endDate: Date,
    status: String,          // 'active' | 'expired' | 'cancelled' | 'paused'
    renewalDate: Date,
    autoRenew: Boolean,
    billingCycle: String     // 'monthly' | 'yearly'
  },
  
  // Device access control
  access: {
    deviceLimit: Number,     // Max devices (default: 3)
    currentDevices: [{
      deviceId: String,      // Unique device identifier
      deviceInfo: {
        platform: String,   // 'web' | 'mobile' | 'tablet'
        browser: String,
        os: String,
        lastAccess: Date
      },
      registeredAt: Date,
      isActive: Boolean
    }],
    expiresAt: Date,        // Access expiration
    isActive: Boolean
  },
  
  // Enrollment tracking
  progress: {
    overallProgress: Number, // 0-100%
    completedLectures: [ObjectId],
    timeSpent: Number,       // Total minutes
    lastAccessed: Date,
    certificateEligible: Boolean
  },
  
  // Audit and status
  status: String,           // 'active' | 'suspended' | 'expired' | 'cancelled'
  metadata: {
    source: String,         // 'web' | 'mobile' | 'referral'
    referralCode: String,
    discountApplied: Number,
    notes: String
  }
}
```

#### **2. Payment Transaction Model**
```javascript
{
  transactionId: String,     // Unique transaction ID
  enrollmentId: ObjectId,    // Reference to enrollment
  userId: ObjectId,          // Student making payment
  courseId: ObjectId,        // Course being purchased
  guruId: ObjectId,         // Instructor receiving payment
  
  // Razorpay integration
  razorpay: {
    orderId: String,
    paymentId: String,
    signature: String
  },
  
  // Transaction details
  amount: {
    total: Number,          // Total amount paid
    coursePrice: Number,    // Original course price
    discount: Number,       // Discount applied
    tax: Number,           // Tax amount
    processingFee: Number  // Gateway fee
  },
  
  // Revenue distribution
  revenue: {
    guruShare: Number,     // 80% to guru
    platformShare: Number, // 20% to platform
    currency: String
  },
  
  // Transaction status
  status: String,          // 'pending' | 'success' | 'failed' | 'refunded'
  paymentMethod: String,
  transactionDate: Date,
  
  // Audit trail
  events: [{
    event: String,         // 'created' | 'payment_captured' | 'refunded'
    timestamp: Date,
    details: Object
  }]
}
```

---

## 🔄 Core Workflows

### **1. Enrollment Workflow**
```
Student selects course → 
Payment initialization (Razorpay) → 
Device registration → 
Payment capture → 
Enrollment creation → 
Access activation → 
Revenue distribution
```

### **2. Device Management Workflow**
```
Device login attempt → 
Device validation → 
Check device limit → 
Register/Update device → 
Grant/Deny access
```

### **3. Subscription Management**
```
Subscription creation → 
Auto-renewal check → 
Payment processing → 
Access renewal → 
Notification system
```

---

## 🛠️ Implementation Plan

### **Phase 2A: Core Enrollment System**
1. **Enhanced Enrollment Model** - Comprehensive enrollment tracking
2. **Payment Transaction Model** - Transaction management
3. **Enrollment Controllers** - CRUD operations and business logic
4. **Device Management** - Access control and device tracking

### **Phase 2B: Payment Integration**
1. **Razorpay Integration** - Payment gateway setup
2. **Webhook Handling** - Payment event processing
3. **Revenue Sharing** - Automatic distribution calculations
4. **Payment Security** - Signature verification and fraud prevention

### **Phase 2C: Advanced Features**
1. **Subscription Management** - Auto-renewal and lifecycle management
2. **Access Control** - Real-time validation and expiration handling
3. **Analytics & Reporting** - Enrollment and payment insights
4. **Testing & Validation** - Comprehensive test coverage

---

## 🔧 Technical Specifications

### **API Endpoints Design**

#### **Enrollment Management**
```javascript
// Core enrollment operations
POST   /api/enrollments/initiate         // Initiate enrollment process
POST   /api/enrollments/confirm          // Confirm payment and create enrollment
GET    /api/enrollments/my-enrollments   // Student's enrollments
GET    /api/enrollments/:id             // Specific enrollment details
PATCH  /api/enrollments/:id/cancel      // Cancel enrollment
DELETE /api/enrollments/:id             // Remove enrollment (admin)

// Access management
POST   /api/enrollments/:id/devices     // Register new device
GET    /api/enrollments/:id/devices     // List registered devices  
DELETE /api/enrollments/:id/devices/:deviceId // Remove device
POST   /api/enrollments/:id/validate    // Validate access from device
```

#### **Payment Processing**
```javascript
// Payment operations
POST   /api/payments/create-order       // Create Razorpay order
POST   /api/payments/verify             // Verify payment signature
POST   /api/payments/webhook            // Handle Razorpay webhooks
GET    /api/payments/:id/status         // Check payment status
POST   /api/payments/:id/refund         // Process refund
```

#### **Subscription Management**
```javascript
// Subscription operations
GET    /api/subscriptions/my-subscriptions    // User's subscriptions
PATCH  /api/subscriptions/:id/pause          // Pause subscription
PATCH  /api/subscriptions/:id/resume         // Resume subscription
PATCH  /api/subscriptions/:id/cancel         // Cancel subscription
POST   /api/subscriptions/:id/renew          // Manual renewal
```

### **Database Indexing Strategy**
```javascript
// Enrollment indexes
enrollments.createIndex({ userId: 1, courseId: 1 }, { unique: true })
enrollments.createIndex({ "subscription.status": 1 })
enrollments.createIndex({ "subscription.renewalDate": 1 })
enrollments.createIndex({ "access.expiresAt": 1 })

// Payment indexes  
payments.createIndex({ "razorpay.paymentId": 1 }, { unique: true })
payments.createIndex({ transactionDate: -1 })
payments.createIndex({ status: 1 })
payments.createIndex({ userId: 1, transactionDate: -1 })
```

---

## 🔒 Security Considerations

### **Payment Security**
- ✅ Razorpay signature verification for all webhooks
- ✅ HTTPS enforcement for all payment endpoints
- ✅ Payment data encryption at rest
- ✅ PCI DSS compliance guidelines
- ✅ Rate limiting on payment endpoints

### **Access Control**
- ✅ Device fingerprinting for unique identification
- ✅ JWT token validation for API access
- ✅ Real-time access validation
- ✅ Audit logging for all access attempts
- ✅ Automated fraud detection patterns

### **Data Protection**
- ✅ Personal data encryption (GDPR compliance)
- ✅ Secure session management
- ✅ API key protection and rotation
- ✅ Database connection security
- ✅ Input validation and sanitization

---

## 📊 Integration Points

### **Phase 1 Integration**
- ✅ **User Model**: Extended for payment preferences
- ✅ **Course Model**: Integration with pricing and enrollment stats
- ✅ **Progress Model**: Enhanced with enrollment tracking
- ✅ **Authentication**: Role-based access for enrollment operations

### **External Integrations**
- ✅ **Razorpay Gateway**: Payment processing and webhooks
- ✅ **Device Detection**: Browser/mobile device identification
- ✅ **Notification Service**: Email/SMS for enrollment confirmments
- ✅ **Analytics Platform**: Enrollment and payment tracking

---

## 🎯 Success Metrics

### **Phase 2A Completion Criteria**
- [ ] Enrollment model with all fields implemented
- [ ] CRUD operations for enrollments working
- [ ] Device management functional
- [ ] Basic access control operational

### **Phase 2B Completion Criteria**
- [ ] Razorpay integration fully functional
- [ ] Webhook processing working
- [ ] Revenue sharing calculations accurate
- [ ] Payment security implemented

### **Phase 2C Completion Criteria**
- [ ] Subscription lifecycle management
- [ ] Real-time access validation
- [ ] Comprehensive test coverage (>95%)
- [ ] Performance benchmarks met

---

## 🚀 Next Steps

1. **Start with Enhanced Enrollment Model** - Foundation for all enrollment operations
2. **Build Core Controllers** - Business logic implementation
3. **Integrate Payment Processing** - Razorpay setup and testing
4. **Implement Device Management** - Access control system
5. **Add Subscription Features** - Lifecycle management
6. **Comprehensive Testing** - Ensure reliability and security

This architecture provides a scalable, secure, and feature-rich enrollment system that integrates seamlessly with Phase 1's course management infrastructure.

---

*Architecture Document - Phase 2: Enrollment & Payment System*  
*Created: November 21, 2025 | Status: Planning Complete*