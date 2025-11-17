// src/middleware/errorHandler.js

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('❌ Error occurred:');
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: {
        message: errors.join(', '),
        type: 'ValidationError',
        statusCode: 400
      }
    });
  }

  // Mongoose duplicate key error (unique constraint violation)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const value = err.keyValue[field];
    return res.status(400).json({
      success: false,
      error: {
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`,
        type: 'DuplicateError',
        field: field,
        statusCode: 400
      }
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        message: `Invalid ${err.path}: ${err.value}`,
        type: 'CastError',
        statusCode: 400
      }
    });
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    let message = err.message;
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Please check the file size limits.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files uploaded.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = `Unexpected file field: ${err.field}`;
    }
    
    return res.status(400).json({
      success: false,
      error: {
        message: message,
        type: 'FileUploadError',
        statusCode: 400
      }
    });
  }

  // Custom error with status code
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        type: err.name || 'CustomError',
        statusCode: err.statusCode,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      }
    });
  }

  // JWT errors (if you add JWT later)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token',
        type: 'AuthenticationError',
        statusCode: 401
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token expired',
        type: 'AuthenticationError',
        statusCode: 401
      }
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : (err.message || 'Internal server error'),
      type: 'ServerError',
      statusCode: 500,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

// Not found handler (404)
const notFound = (req, res, next) => {
  const message = `Route ${req.method} ${req.originalUrl} not found`;
  
  console.log('⚠️  404 Not Found:', {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip
  });

  res.status(404).json({
    success: false,
    error: {
      message: message,
      type: 'NotFoundError',
      statusCode: 404,
      availableRoutes: {
        auth: '/api/auth/*',
        songs: '/api/songs/*',
        admin: '/api/admin/*'
      }
    }
  });
};

// Async error wrapper (utility function)
// Wrap async route handlers to catch errors automatically
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};