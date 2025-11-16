// src/routes/auth.js
const express = require('express');
const router = express.Router();
const { signup, login, logout, getMe } = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');
const { signupValidation, loginValidation } = require('../utils/validation');

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', signupValidation, signup);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, login);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', isAuthenticated, logout);

// @route   GET /api/auth/me
// @desc    Get current logged-in user info
// @access  Private
router.get('/me', isAuthenticated, getMe);

module.exports = router;