// src/controllers/authController.js
const User = require('../models/User');
const { createError } = require('../utils/helpers');

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return next(createError('Email already registered', 400));
      }
      if (existingUser.username === username) {
        return next(createError('Username already taken', 400));
      }
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password
    });

    // Create session
    req.session.userId = user._id;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(createError('Invalid email or password', 401));
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return next(createError('Invalid email or password', 401));
    }

    // Create session
    req.session.userId = user._id;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return next(createError('Logout failed', 500));
      }

      res.clearCookie('connect.sid');
      
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get current user info
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return next(createError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  getMe
};