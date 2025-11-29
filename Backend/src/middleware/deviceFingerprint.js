const crypto = require('crypto');
const { UAParser } = require('ua-parser-js');

/**
 * Device Fingerprinting Middleware
 * Generates unique device signatures based on browser characteristics
 * and tracks device-specific access for enrollment management
 */

/**
 * Generates a device fingerprint based on request headers and client info
 * @param {Object} req - Express request object
 * @returns {Object} Device fingerprint data
 */
const generateDeviceFingerprint = (req) => {
  try {
    // Parse user agent
    const parser = new UAParser(req.headers['user-agent']);
    const result = parser.getResult();

    // Collect device characteristics
    const deviceData = {
      userAgent: req.headers['user-agent'] || '',
      acceptLanguage: req.headers['accept-language'] || '',
      acceptEncoding: req.headers['accept-encoding'] || '',
      acceptCharset: req.headers['accept-charset'] || '',
      dnt: req.headers['dnt'] || '',
      browserName: result.browser.name || '',
      browserVersion: result.browser.version || '',
      osName: result.os.name || '',
      osVersion: result.os.version || '',
      deviceType: result.device.type || 'desktop',
      deviceVendor: result.device.vendor || '',
      deviceModel: result.device.model || '',
      engineName: result.engine.name || '',
      engineVersion: result.engine.version || '',
      // Client IP (consider proxy headers)
      ipAddress: req.ip || req.connection.remoteAddress || '',
      xForwardedFor: req.headers['x-forwarded-for'] || '',
      xRealIp: req.headers['x-real-ip'] || '',
      // Additional headers
      secChUa: req.headers['sec-ch-ua'] || '',
      secChUaPlatform: req.headers['sec-ch-ua-platform'] || '',
      secChUaMobile: req.headers['sec-ch-ua-mobile'] || '',
      // Timezone from request (if available)
      timezone: req.headers['timezone'] || req.body?.timezone || req.query?.timezone || ''
    };

    // Create a combined string for hashing
    const fingerprintString = [
      deviceData.userAgent,
      deviceData.acceptLanguage,
      deviceData.browserName,
      deviceData.browserVersion,
      deviceData.osName,
      deviceData.osVersion,
      deviceData.deviceType,
      deviceData.secChUa,
      deviceData.secChUaPlatform,
      deviceData.timezone
    ].join('|');

    // Generate primary fingerprint hash
    const primaryFingerprint = crypto
      .createHash('sha256')
      .update(fingerprintString)
      .digest('hex');

    // Generate secondary fingerprint (without version info for broader matching)
    const secondaryFingerprintString = [
      deviceData.browserName,
      deviceData.osName,
      deviceData.deviceType,
      deviceData.acceptLanguage.split(',')[0], // Primary language only
      deviceData.timezone
    ].join('|');

    const secondaryFingerprint = crypto
      .createHash('sha256')
      .update(secondaryFingerprintString)
      .digest('hex');

    return {
      primaryFingerprint,
      secondaryFingerprint,
      deviceInfo: {
        browser: `${result.browser.name} ${result.browser.version}`,
        os: `${result.os.name} ${result.os.version}`,
        device: result.device.type || 'desktop',
        platform: deviceData.secChUaPlatform.replace(/"/g, '') || result.os.name,
        mobile: deviceData.secChUaMobile === '?1' || result.device.type === 'mobile',
        timezone: deviceData.timezone
      },
      rawData: deviceData,
      createdAt: new Date()
    };

  } catch (error) {
    console.error('Device fingerprinting error:', error);
    
    // Fallback fingerprint
    const fallbackString = req.headers['user-agent'] + req.ip;
    const fallbackFingerprint = crypto
      .createHash('sha256')
      .update(fallbackString)
      .digest('hex');

    return {
      primaryFingerprint: fallbackFingerprint,
      secondaryFingerprint: fallbackFingerprint,
      deviceInfo: {
        browser: 'Unknown',
        os: 'Unknown',
        device: 'unknown',
        platform: 'Unknown',
        mobile: false,
        timezone: ''
      },
      rawData: {},
      createdAt: new Date(),
      error: error.message
    };
  }
};

/**
 * Middleware to add device fingerprint to request object
 */
const deviceFingerprint = (req, res, next) => {
  try {
    const fingerprint = generateDeviceFingerprint(req);
    req.deviceFingerprint = fingerprint;
    next();
  } catch (error) {
    console.error('Device fingerprint middleware error:', error);
    // Continue without fingerprint rather than blocking request
    req.deviceFingerprint = null;
    next();
  }
};

/**
 * Enhanced device validation middleware
 * Checks device fingerprint against enrollment limits
 */
const validateDeviceAccess = async (req, res, next) => {
  try {
    if (!req.deviceFingerprint) {
      return res.status(400).json({
        success: false,
        message: 'Device fingerprint required for enrollment access'
      });
    }

    // Get user and enrollment info
    const userId = req.user?.id;
    const enrollmentId = req.params.enrollmentId || req.body.enrollmentId;

    if (!userId || !enrollmentId) {
      return next(); // Let other validation handle missing params
    }

    const Enrollment = require('../models/Enrollment');
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('courseId', 'title');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if user owns this enrollment
    if (enrollment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this enrollment'
      });
    }

    // Check if device is registered for this enrollment
    const deviceId = req.deviceFingerprint.primaryFingerprint;
    const isDeviceRegistered = enrollment.devices.some(device => 
      device.deviceId === deviceId && device.isActive
    );

    if (!isDeviceRegistered) {
      // Check if enrollment has reached device limit
      const activeDevices = enrollment.devices.filter(d => d.isActive).length;
      const deviceLimit = enrollment.subscription?.deviceLimit || 3;

      return res.status(403).json({
        success: false,
        message: 'Device not registered for this enrollment',
        data: {
          deviceId,
          deviceLimit,
          activeDevices,
          canRegisterDevice: activeDevices < deviceLimit,
          enrollmentId: enrollment._id,
          courseName: enrollment.courseId.title
        }
      });
    }

    // Update last access time for this device
    const deviceIndex = enrollment.devices.findIndex(d => 
      d.deviceId === deviceId && d.isActive
    );
    
    if (deviceIndex !== -1) {
      enrollment.devices[deviceIndex].lastAccessedAt = new Date();
      enrollment.devices[deviceIndex].accessCount += 1;
      
      // Update device info if it has changed
      const currentDeviceInfo = req.deviceFingerprint.deviceInfo;
      if (JSON.stringify(enrollment.devices[deviceIndex].deviceInfo) !== JSON.stringify(currentDeviceInfo)) {
        enrollment.devices[deviceIndex].deviceInfo = currentDeviceInfo;
      }
      
      await enrollment.save();
    }

    // Add device info to request for use in controllers
    req.enrollmentDevice = {
      deviceId,
      deviceInfo: req.deviceFingerprint.deviceInfo,
      enrollment
    };

    next();

  } catch (error) {
    console.error('Device validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating device access',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware for enrollment device registration
 * Used during device registration process
 */
const prepareDeviceRegistration = (req, res, next) => {
  try {
    if (!req.deviceFingerprint) {
      return res.status(400).json({
        success: false,
        message: 'Device fingerprint required for registration'
      });
    }

    // Add device registration data to request
    req.deviceRegistration = {
      deviceId: req.deviceFingerprint.primaryFingerprint,
      deviceInfo: req.deviceFingerprint.deviceInfo,
      registrationData: {
        userAgent: req.deviceFingerprint.rawData.userAgent,
        ipAddress: req.ip,
        registeredAt: new Date()
      }
    };

    next();

  } catch (error) {
    console.error('Device registration preparation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error preparing device registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Utility function to check device compatibility
 * @param {Object} deviceInfo - Device information object
 * @returns {Object} Compatibility assessment
 */
const checkDeviceCompatibility = (deviceInfo) => {
  const compatibility = {
    isCompatible: true,
    warnings: [],
    recommendations: []
  };

  try {
    // Check for old browsers
    if (deviceInfo.browser.includes('Internet Explorer')) {
      compatibility.isCompatible = false;
      compatibility.warnings.push('Internet Explorer is not supported');
      compatibility.recommendations.push('Please use Chrome, Firefox, Safari, or Edge');
    }

    // Check for very old browser versions
    if (deviceInfo.browser.includes('Chrome')) {
      const versionMatch = deviceInfo.browser.match(/Chrome (\d+)/);
      if (versionMatch && parseInt(versionMatch[1]) < 70) {
        compatibility.warnings.push('Chrome version is outdated');
        compatibility.recommendations.push('Please update to Chrome 70 or later');
      }
    }

    // Check for mobile device considerations
    if (deviceInfo.mobile) {
      compatibility.recommendations.push('For better video experience, consider using desktop or tablet');
    }

    return compatibility;

  } catch (error) {
    console.error('Device compatibility check error:', error);
    return {
      isCompatible: true,
      warnings: ['Unable to determine device compatibility'],
      recommendations: []
    };
  }
};

/**
 * Rate limiting for device registration attempts
 * Prevents rapid device registration abuse
 */
const deviceRegistrationRateLimit = (() => {
  const attempts = new Map(); // userId -> { count, lastAttempt }
  const RATE_LIMIT = 5; // Max attempts per hour
  const TIME_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

  return (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) return next();

      const now = Date.now();
      const userAttempts = attempts.get(userId);

      if (!userAttempts) {
        attempts.set(userId, { count: 1, lastAttempt: now });
        return next();
      }

      // Reset counter if time window has passed
      if (now - userAttempts.lastAttempt > TIME_WINDOW) {
        attempts.set(userId, { count: 1, lastAttempt: now });
        return next();
      }

      // Check rate limit
      if (userAttempts.count >= RATE_LIMIT) {
        const timeRemaining = Math.ceil((TIME_WINDOW - (now - userAttempts.lastAttempt)) / 1000 / 60);
        return res.status(429).json({
          success: false,
          message: 'Too many device registration attempts',
          data: {
            timeRemainingMinutes: timeRemaining,
            maxAttempts: RATE_LIMIT,
            currentAttempts: userAttempts.count
          }
        });
      }

      // Increment counter
      userAttempts.count += 1;
      userAttempts.lastAttempt = now;
      next();

    } catch (error) {
      console.error('Device registration rate limit error:', error);
      next(); // Continue without rate limiting on error
    }
  };
})();

module.exports = {
  deviceFingerprint,
  validateDeviceAccess,
  prepareDeviceRegistration,
  generateDeviceFingerprint,
  checkDeviceCompatibility,
  deviceRegistrationRateLimit
};
