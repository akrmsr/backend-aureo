// src/routes/admin.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadDefaultSong,
  getAllDefaultSongs,
  updateDefaultSong,
  deleteDefaultSong,
  getAllUsers,
  deleteUser
} = require('../controllers/adminController');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');
const {
  songUploadValidation,
  songUpdateValidation,
  idValidation
} = require('../utils/validation');

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 2
  }
}).fields([
  { name: 'audioFile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]);

// All admin routes require authentication + admin role
router.use(isAuthenticated, isAdmin);

// Song Management Routes
// @route   POST /api/admin/songs/upload
// @desc    Upload default song (visible to all users)
// @access  Private/Admin
router.post('/songs/upload', upload, songUploadValidation, uploadDefaultSong);

// @route   GET /api/admin/songs
// @desc    Get all default songs
// @access  Private/Admin
router.get('/songs', getAllDefaultSongs);

// @route   PUT /api/admin/songs/:id
// @desc    Update default song
// @access  Private/Admin
router.put('/songs/:id', upload, idValidation, songUpdateValidation, updateDefaultSong);

// @route   DELETE /api/admin/songs/:id
// @desc    Delete default song
// @access  Private/Admin
router.delete('/songs/:id', idValidation, deleteDefaultSong);

// User Management Routes
// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', getAllUsers);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user and their songs
// @access  Private/Admin
router.delete('/users/:id', idValidation, deleteUser);

module.exports = router;