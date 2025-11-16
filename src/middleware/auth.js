// src/middleware/auth.js
const User = require('../models/User');

// Check if user is authenticated (logged in)
const isAuthenticated = async (req, res, next) => {
  try {
    // Check if session exists and has userId
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Not authenticated. Please login.',
          statusCode: 401
        }
      });
    }

    // Get user from database
    const user = await User.findById(req.session.userId);
    
    if (!user) {
      // User not found - destroy invalid session
      req.session.destroy();
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not found. Please login again.',
          statusCode: 401
        }
      });
    }

    // Attach user to request object
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Authentication failed',
        statusCode: 500
      }
    });
  }
};

module.exports = { isAuthenticated };