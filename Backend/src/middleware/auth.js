const jwt = require('jsonwebtoken');
const User = require('../models/User');

// In-memory token storage (replace with Redis in production)
const blacklistedTokens = new Set();

// Helper function to simulate Redis cache
const cache = {
  get: async (key) => {
    if (key.startsWith('blacklist:')) {
      return blacklistedTokens.has(key.replace('blacklist:', '')) ? true : null;
    }
    return null;
  }
};

const auth = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Access token is required',
          code: 'AUTHENTICATION_REQUIRED'
        }
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is blacklisted (for logout functionality)
      const isBlacklisted = await cache.get(`blacklist:${token}`);
      if (isBlacklisted) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Token has been invalidated',
            code: 'TOKEN_INVALIDATED'
          }
        });
      }

      // Check if user still exists and is active
      const currentUser = await User.findById(decoded.id);
      if (!currentUser || !currentUser.metadata.isActive) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'User no longer exists or is inactive',
            code: 'USER_NOT_FOUND'
          }
        });
      }

      // Check if user is banned
      if (currentUser.metadata.bannedUntil && currentUser.metadata.bannedUntil > new Date()) {
        return res.status(403).json({
          success: false,
          error: {
            message: `Account suspended until ${currentUser.metadata.bannedUntil.toDateString()}`,
            code: 'ACCOUNT_SUSPENDED',
            bannedUntil: currentUser.metadata.bannedUntil
          }
        });
      }

      // Grant access to protected route
      req.user = currentUser;
      req.token = token;
      next();

    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid token',
            code: 'INVALID_TOKEN'
          }
        });
      } else if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Token expired',
            code: 'TOKEN_EXPIRED'
          }
        });
      } else {
        throw err;
      }
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Authentication failed',
        code: 'AUTHENTICATION_ERROR'
      }
    });
  }
};

// Optional auth middleware - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.id);
        
        if (currentUser && currentUser.metadata.isActive) {
          req.user = currentUser;
          req.token = token;
        }
      } catch (err) {
        // Silently fail for optional auth
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: roles,
          userRole: req.user.role
        }
      });
    }

    next();
  };
};

// Subscription-based authorization
const requireSubscription = (...plans) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        }
      });
    }

    if (!plans.includes(req.user.subscription.plan)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Subscription upgrade required',
          code: 'SUBSCRIPTION_REQUIRED',
          requiredPlans: plans,
          currentPlan: req.user.subscription.plan,
          upgradeUrl: '/api/v1/payments/plans'
        }
      });
    }

    // Check if subscription is active
    if (!req.user.isSubscriptionActive) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Subscription expired',
          code: 'SUBSCRIPTION_EXPIRED',
          renewUrl: '/api/v1/payments/renew'
        }
      });
    }

    next();
  };
};

// Feature-based authorization
const requireFeature = (feature) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED'
        }
      });
    }

    if (!req.user.canAccessFeature(feature)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Feature access denied',
          code: 'FEATURE_ACCESS_DENIED',
          feature,
          upgradeRequired: true
        }
      });
    }

    next();
  };
};

// Email verification requirement
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      }
    });
  }

  if (!req.user.verification.isEmailVerified) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Email verification required',
        code: 'EMAIL_VERIFICATION_REQUIRED',
        resendUrl: '/api/v1/auth/resend-verification'
      }
    });
  }

  next();
};

// Rate limiting for authenticated users
const authRateLimit = (maxRequests = 1000, windowMs = 60 * 60 * 1000) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user._id.toString();
    const key = `auth_rate_limit:${userId}`;
    
    try {
      const current = await cache.incr(key);
      
      if (current === 1) {
        await cache.expire(key, Math.ceil(windowMs / 1000));
      }
      
      if (current > maxRequests) {
        return res.status(429).json({
          success: false,
          error: {
            message: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil(windowMs / 1000)
          }
        });
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - current),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
      });

      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      next(); // Continue without rate limiting on error
    }
  };
};

// IP-based rate limiting for sensitive endpoints
const ipRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `ip_rate_limit:${ip}`;
    
    try {
      const current = await cache.incr(key);
      
      if (current === 1) {
        await cache.expire(key, Math.ceil(windowMs / 1000));
      }
      
      if (current > maxRequests) {
        return res.status(429).json({
          success: false,
          error: {
            message: 'Too many requests from this IP',
            code: 'IP_RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil(windowMs / 1000)
          }
        });
      }

      next();
    } catch (error) {
      console.error('IP rate limiting error:', error);
      next();
    }
  };
};

// Audit logging middleware
const auditLog = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after response
      setImmediate(() => {
        const logData = {
          action,
          userId: req.user ? req.user._id : null,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          timestamp: new Date().toISOString(),
          requestId: req.id // If you have request ID middleware
        };

        // Store audit log (in practice, you might use a separate audit collection)
        console.log('Audit Log:', JSON.stringify(logData));
      });
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  protect: auth,
  auth,
  optionalAuth,
  authorize,
  requireRole: authorize,
  requireSubscription,
  requireFeature,
  requireEmailVerification,
  authRateLimit,
  ipRateLimit,
  auditLog
};