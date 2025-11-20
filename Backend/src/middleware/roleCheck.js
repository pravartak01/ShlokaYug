/**
 * Role-based Access Control Middleware
 * Provides authorization based on user roles and permissions
 */

/**
 * Check if user has required role(s)
 * @param {string|string[]} allowedRoles - Role(s) that are allowed access
 * @returns {Function} Express middleware function
 */
const checkRole = (allowedRoles) => {
  // Ensure allowedRoles is always an array
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    try {
      // Check if user exists (should be set by auth middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if user has required role
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: roles,
          current: req.user.role
        });
      }

      // For guru role, check if they are verified
      if (req.user.role === 'guru' && !req.user.isVerified) {
        return res.status(403).json({
          success: false,
          message: 'Guru verification required',
          action: 'Please wait for admin verification or complete verification process'
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization check failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  };
};

/**
 * Check if user is admin
 */
const isAdmin = checkRole('admin');

/**
 * Check if user is guru (verified)
 */
const isGuru = checkRole('guru');

/**
 * Check if user is student
 */
const isStudent = checkRole('student');

/**
 * Check if user is guru or admin
 */
const isGuruOrAdmin = checkRole(['guru', 'admin']);

/**
 * Check if user is student or guru
 */
const isStudentOrGuru = checkRole(['student', 'guru']);

/**
 * Check resource ownership (for resources that belong to a user)
 * @param {string} resourceField - Field name in the resource that contains owner ID
 * @param {Function} getResourceId - Function to extract resource ID from request
 * @returns {Function} Express middleware function
 */
const checkOwnership = (resourceField = 'userId', getResourceId = (req) => req.params.id) => {
  return async (req, res, next) => {
    try {
      const resourceId = getResourceId(req);
      
      // This middleware should be used with a model finder
      // For now, we'll assume the resource is attached to req.resource
      // Individual controllers should implement ownership checks
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Admin can access everything
      if (req.user.role === 'admin') {
        return next();
      }

      // Store ownership check data for controller to use
      req.ownershipCheck = {
        resourceField,
        resourceId,
        userId: req.user.id
      };

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        message: 'Ownership check failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  };
};

/**
 * Check if user has specific permission
 * @param {string} permission - Permission to check
 * @returns {Function} Express middleware function
 */
const hasPermission = (permission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Admin has all permissions
      if (req.user.role === 'admin') {
        return next();
      }

      // Define role-based permissions
      const permissions = {
        guru: [
          'create_course',
          'edit_own_course',
          'publish_course',
          'view_analytics',
          'manage_enrollments',
          'create_assessments'
        ],
        student: [
          'enroll_course',
          'submit_assignment',
          'take_assessment',
          'view_progress'
        ]
      };

      const userPermissions = permissions[req.user.role] || [];

      if (!userPermissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          message: `Permission '${permission}' required`,
          userRole: req.user.role,
          userPermissions
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  };
};

module.exports = {
  checkRole,
  isAdmin,
  isGuru,
  isStudent,
  isGuruOrAdmin,
  isStudentOrGuru,
  checkOwnership,
  hasPermission
};