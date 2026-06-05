/**
 * Authorization Middleware Factory
 * Restricts access to specific user roles.
 * Must be used AFTER the 'protect' middleware.
 * 
 * @param {...string} roles - Allowed user roles (e.g. 'Admin', 'Premium_User', 'Free_User')
 * @returns {Function} Express middleware
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // 1. Ensure user is authenticated (req.user must be set by 'protect' middleware)
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication required. Please log in first.'
      });
    }

    // 2. Check if user's role is authorized for this route
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: `Access Denied: Your role (${req.user.role}) is unauthorized to access this resource.`
      });
    }

    // 3. Authorized - proceed to route handler
    next();
  };
};

module.exports = { restrictTo };
