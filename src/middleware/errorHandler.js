// src/middleware/errorHandler.js

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: {
        message: errors.join(', '),
        statusCode: 400
      }
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      error: {
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
        statusCode: 400
      }
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid ID format',
        statusCode: 400
      }
    });
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'File too large',
          statusCode: 400
        }
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Too many files',
          statusCode: 400
        }
      });
    }
    return res.status(400).json({
      success: false,
      error: {
        message: err.message,
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
        statusCode: err.statusCode
      }
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
      statusCode: 500
    }
  });
};

// Not found handler
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      statusCode: 404
    }
  });
};

module.exports = {
  errorHandler,
  notFound
};