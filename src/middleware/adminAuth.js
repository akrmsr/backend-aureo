// src/middleware/adminAuth.js
const { USER_ROLES } = require('../config/constants');

// Check if user is admin
const isAdmin = (req, res, next) => {
  try {
    // Check if user exists (should be set by isAuthenticated middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          statusCode: 401
        }
      });
    }

    // Check if user has admin role
    if (req.user.role !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied. Admin privileges required.',
          statusCode: 403
        }
      });
    }

    next();
    
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Authorization failed',
        statusCode: 500
      }
    });
  }
};

module.exports = { isAdmin };