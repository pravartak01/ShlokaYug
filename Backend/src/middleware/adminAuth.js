const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Admin authentication middleware
const adminAuth = catchAsync(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new AppError('Access token is required', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    const currentUser = await User.findById(decoded.id);
    if (!currentUser || !currentUser.metadata.isActive) {
      return next(new AppError('User no longer exists or is inactive', 401));
    }

    // Check if user has admin role
    if (currentUser.role !== 'admin') {
      return next(new AppError('Admin access required', 403));
    }

    // Grant access to protected route
    req.admin = currentUser;
    req.token = token;
    next();

  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    } else if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    } else {
      throw err;
    }
  }
});

// Super admin check (for sensitive operations)
const requireSuperAdmin = (req, res, next) => {
  if (!req.admin) {
    return next(new AppError('Authentication required', 401));
  }

  // Assuming super admin is identified by a specific email or additional field
  if (req.admin.role !== 'admin' || !req.admin.isSuperAdmin) {
    return next(new AppError('Super admin access required', 403));
  }

  next();
};

// Permission-based authorization for admin actions
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if admin has specific permission
    if (!req.admin.permissions || !req.admin.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredPermission: permission,
          adminPermissions: req.admin.permissions || []
        }
      });
    }

    next();
  };
};

// Audit logging for admin actions
const adminAuditLog = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after response
      setImmediate(() => {
        const logData = {
          action,
          adminId: req.admin ? req.admin._id : null,
          adminEmail: req.admin ? req.admin.email : null,
          targetResource: req.params,
          requestBody: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          timestamp: new Date().toISOString()
        };

        console.log('Admin Audit Log:', JSON.stringify(logData));
        
        // In production, you might want to store this in a separate audit collection
        // await AuditLog.create(logData);
      });
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  adminAuth,
  requireSuperAdmin,
  requirePermission,
  adminAuditLog
};