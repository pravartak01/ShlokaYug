const jwt = require('jsonwebtoken');
const Guru = require('../models/Guru');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

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

// Guru authentication middleware
const guruAuth = catchAsync(async (req, res, next) => {
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
    
    // Check if token is blacklisted
    const isBlacklisted = await cache.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return next(new AppError('Token has been invalidated', 401));
    }

    // Check if guru still exists and is approved
    const currentGuru = await Guru.findById(decoded.id);
    if (!currentGuru) {
      return next(new AppError('Guru no longer exists', 401));
    }

    // Check if guru is approved
    if (currentGuru.applicationStatus !== 'approved') {
      return next(new AppError('Guru account not approved or suspended', 403));
    }

    // Check if guru is active
    if (!currentGuru.isActive) {
      return next(new AppError('Guru account is inactive', 403));
    }

    // Grant access to protected route
    req.guru = currentGuru;
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

// Optional guru auth - doesn't fail if no token provided
const optionalGuruAuth = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentGuru = await Guru.findById(decoded.id);
      
      if (currentGuru && currentGuru.applicationStatus === 'approved' && currentGuru.isActive) {
        req.guru = currentGuru;
        req.token = token;
      }
    } catch (err) {
      // Silently fail for optional auth
    }
  }

  next();
});

// Require guru verification status
const requireVerification = (req, res, next) => {
  if (!req.guru) {
    return next(new AppError('Authentication required', 401));
  }

  if (!req.guru.verification.isVerified) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Guru verification required',
        code: 'GURU_VERIFICATION_REQUIRED',
        verificationStatus: req.guru.verification
      }
    });
  }

  next();
};

// Require specific expertise
const requireExpertise = (...subjects) => {
  return (req, res, next) => {
    if (!req.guru) {
      return next(new AppError('Authentication required', 401));
    }

    const hasExpertise = subjects.some(subject => 
      req.guru.expertise.subjects.includes(subject)
    );

    if (!hasExpertise) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient expertise for this content',
          code: 'INSUFFICIENT_EXPERTISE',
          requiredExpertise: subjects,
          guruExpertise: req.guru.expertise.subjects
        }
      });
    }

    next();
  };
};

// Check teaching experience requirement
const requireExperience = (minYears) => {
  return (req, res, next) => {
    if (!req.guru) {
      return next(new AppError('Authentication required', 401));
    }

    if (req.guru.expertise.experience < minYears) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Minimum ${minYears} years of teaching experience required`,
          code: 'INSUFFICIENT_EXPERIENCE',
          requiredExperience: minYears,
          guruExperience: req.guru.expertise.experience
        }
      });
    }

    next();
  };
};

// Rate limiting for guru endpoints
const guruRateLimit = (maxRequests = 500, windowMs = 60 * 60 * 1000) => {
  return async (req, res, next) => {
    if (!req.guru) {
      return next();
    }

    const guruId = req.guru._id.toString();
    const key = `guru_rate_limit:${guruId}`;
    
    try {
      // Simple in-memory rate limiting (use Redis in production)
      const current = global.rateLimitCache?.[key] || 0;
      
      if (current >= maxRequests) {
        return res.status(429).json({
          success: false,
          error: {
            message: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil(windowMs / 1000)
          }
        });
      }

      // Increment counter
      if (!global.rateLimitCache) global.rateLimitCache = {};
      global.rateLimitCache[key] = current + 1;

      // Reset after window
      setTimeout(() => {
        delete global.rateLimitCache[key];
      }, windowMs);

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - current - 1),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
      });

      next();
    } catch (error) {
      console.error('Guru rate limiting error:', error);
      next(); // Continue without rate limiting on error
    }
  };
};

// Audit logging for guru actions
const guruAuditLog = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after response
      setImmediate(() => {
        const logData = {
          action,
          guruId: req.guru ? req.guru._id : null,
          guruEmail: req.guru ? req.guru.credentials.email : null,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          timestamp: new Date().toISOString()
        };

        console.log('Guru Audit Log:', JSON.stringify(logData));
      });
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  guruAuth,
  optionalGuruAuth,
  requireVerification,
  requireExpertise,
  requireExperience,
  guruRateLimit,
  guruAuditLog
};