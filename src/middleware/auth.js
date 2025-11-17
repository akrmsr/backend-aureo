// src/middleware/auth.js

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  console.log('🔐 Auth Check:', {
    sessionID: req.sessionID,
    hasSession: !!req.session,
    hasUser: !!req.session?.userId,
    cookies: req.headers.cookie ? 'Present' : 'Missing'
  });

  if (req.session && req.session.userId) {
    return next();
  }
  
  return res.status(401).json({
    success: false,
    message: 'Not authenticated. Please log in.',
    debug: {
      hasSession: !!req.session,
      hasCookie: !!req.headers.cookie,
      sessionId: req.sessionID ? 'Present' : 'Missing'
    }
  });
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.userRole === 'admin') {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin privileges required.'
  });
};

// Optional: Middleware to attach user to request
const attachUser = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.session.userId).select('-password');
      
      if (user) {
        req.user = user;
      }
    } catch (error) {
      console.error('Error attaching user:', error);
    }
  }
  
  next();
};

module.exports = {
  isAuthenticated,
  isAdmin,
  attachUser
};