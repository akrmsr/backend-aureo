// src/utils/validation.js
const { body, param, query, validationResult } = require('express-validator');
const { GENRES } = require('../config/constants');

// Validation middleware to check results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: errors.array()[0].msg,
        statusCode: 400,
        errors: errors.array()
      }
    });
  }
  next();
};

// User validation rules
const signupValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  validate
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validate
];

// Song validation rules
const songUploadValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Song title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('artist')
    .trim()
    .notEmpty()
    .withMessage('Artist name is required')
    .isLength({ max: 100 })
    .withMessage('Artist name cannot exceed 100 characters'),
  
  body('album')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Album name cannot exceed 200 characters'),
  
  body('genre')
    .notEmpty()
    .withMessage('Genre is required')
    .isIn(GENRES)
    .withMessage('Invalid genre selected'),
  
  validate
];

const songUpdateValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('artist')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Artist name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Artist name cannot exceed 100 characters'),
  
  body('album')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Album name cannot exceed 200 characters'),
  
  body('genre')
    .optional()
    .isIn(GENRES)
    .withMessage('Invalid genre selected'),
  
  validate
];

// Search validation
const searchValidation = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query cannot be empty'),
  
  query('genre')
    .optional()
    .isIn(GENRES)
    .withMessage('Invalid genre'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'plays', 'title', 'artist'])
    .withMessage('Invalid sort field'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  validate
];

// ID validation
const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  validate
];

module.exports = {
  signupValidation,
  loginValidation,
  songUploadValidation,
  songUpdateValidation,
  searchValidation,
  idValidation
};