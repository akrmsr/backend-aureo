// src/routes/songs.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadSong,
  getAllSongs,
  getMySongs,
  getSongById,
  updateSong,
  deleteSong,
  streamAudio,
  getCoverImage,
  searchSongs,
  getGenres
} = require('../controllers/songController');
const { isAuthenticated } = require('../middleware/auth');
const {
  songUploadValidation,
  songUpdateValidation,
  searchValidation,
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

// @route   GET /api/songs/genres
// @desc    Get all available genres
// @access  Public
router.get('/genres', getGenres);

// @route   GET /api/songs/search
// @desc    Search songs
// @access  Private
router.get('/search', isAuthenticated, searchValidation, searchSongs);

// @route   GET /api/songs/my-songs
// @desc    Get current user's uploaded songs
// @access  Private
router.get('/my-songs', isAuthenticated, getMySongs);

// @route   GET /api/songs/stream/audio/:id
// @desc    Stream audio file
// @access  Private
router.get('/stream/audio/:id', isAuthenticated, streamAudio);

// @route   GET /api/songs/stream/image/:id
// @desc    Get cover image
// @access  Private
router.get('/stream/image/:id', isAuthenticated, getCoverImage);

// @route   POST /api/songs/upload
// @desc    Upload new song
// @access  Private
router.post('/upload', isAuthenticated, upload, songUploadValidation, uploadSong);

// @route   GET /api/songs
// @desc    Get all songs (user's + default)
// @access  Private
router.get('/', isAuthenticated, getAllSongs);

// @route   GET /api/songs/:id
// @desc    Get single song by ID
// @access  Private
router.get('/:id', isAuthenticated, idValidation, getSongById);

// @route   PUT /api/songs/:id
// @desc    Update song metadata
// @access  Private
router.put('/:id', isAuthenticated, upload, idValidation, songUpdateValidation, updateSong);

// @route   DELETE /api/songs/:id
// @desc    Delete song
// @access  Private
router.delete('/:id', isAuthenticated, idValidation, deleteSong);

module.exports = router;