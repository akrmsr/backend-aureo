// src/controllers/songController.js
const mongoose = require('mongoose');
const Song = require('../models/Song');
const { getGFS, getImageGFS } = require('../config/gridfs');
const { 
  getPagination, 
  formatPaginationResponse, 
  createError,
  formatSongsResponse 
} = require('../utils/helpers');
const { GENRES } = require('../config/constants');

// @desc    Upload new song
// @route   POST /api/songs/upload
// @access  Private
const uploadSong = async (req, res, next) => {
  try {
    const { title, artist, album, genre } = req.body;

    // Check if audio file exists
    if (!req.files || !req.files.audioFile) {
      return next(createError('Audio file is required', 400));
    }

    const audioFile = req.files.audioFile[0];
    const coverImage = req.files.coverImage ? req.files.coverImage[0] : null;

    // Upload audio to GridFS
    const { gridfsBucket } = getGFS();
    const audioUploadStream = gridfsBucket.openUploadStream(audioFile.originalname, {
      metadata: {
        originalName: audioFile.originalname,
        uploadedBy: req.user._id,
        uploadDate: new Date()
      }
    });

    audioUploadStream.end(audioFile.buffer);

    await new Promise((resolve, reject) => {
      audioUploadStream.on('finish', resolve);
      audioUploadStream.on('error', reject);
    });

    const audioFileId = audioUploadStream.id;
    const audioFilename = audioFile.originalname;

    // Upload cover image to GridFS (if provided)
    let coverImageId = null;
    let coverImageFilename = null;

    if (coverImage) {
      const { gridfsBucket: imageGridfsBucket } = getImageGFS();
      const imageUploadStream = imageGridfsBucket.openUploadStream(coverImage.originalname, {
        metadata: {
          originalName: coverImage.originalname,
          uploadedBy: req.user._id,
          uploadDate: new Date()
        }
      });

      imageUploadStream.end(coverImage.buffer);

      await new Promise((resolve, reject) => {
        imageUploadStream.on('finish', resolve);
        imageUploadStream.on('error', reject);
      });

      coverImageId = imageUploadStream.id;
      coverImageFilename = coverImage.originalname;
    }

    // Create song document
    const song = await Song.create({
      title,
      artist,
      album: album || null,
      genre,
      audioFileId,
      audioFilename,
      coverImageId,
      coverImageFilename,
      uploadedBy: req.user._id,
      isDefault: false
    });

    res.status(201).json({
      success: true,
      message: 'Song uploaded successfully',
      song: {
        _id: song._id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        genre: song.genre,
        duration: song.duration,
        audioFileId: song.audioFileId,
        coverImageId: song.coverImageId,
        audioStreamUrl: `/api/songs/stream/audio/${song.audioFileId}`,
        coverImageUrl: song.coverImageId ? `/api/songs/stream/image/${song.coverImageId}` : null,
        uploadedBy: song.uploadedBy,
        isDefault: song.isDefault,
        plays: song.plays,
        createdAt: song.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all songs (user's songs + default songs)
// @route   GET /api/songs
// @access  Private
const getAllSongs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

    // Get songs that are either default or uploaded by current user
    const songs = await Song.find({
      $or: [
        { isDefault: true },
        { uploadedBy: req.user._id }
      ]
    })
    .populate('uploadedBy', 'username')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Song.countDocuments({
      $or: [
        { isDefault: true },
        { uploadedBy: req.user._id }
      ]
    });

    const formattedSongs = formatSongsResponse(songs);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(formattedSongs, total, page, limit)
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get only current user's uploaded songs
// @route   GET /api/songs/my-songs
// @access  Private
const getMySongs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

    const songs = await Song.find({ uploadedBy: req.user._id })
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Song.countDocuments({ uploadedBy: req.user._id });

    const formattedSongs = formatSongsResponse(songs);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(formattedSongs, total, page, limit)
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get single song by ID
// @route   GET /api/songs/:id
// @access  Private
const getSongById = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('uploadedBy', 'username email');

    if (!song) {
      return next(createError('Song not found', 404));
    }

    // Check if user has access to this song
    if (!song.isDefault && song.uploadedBy._id.toString() !== req.user._id.toString()) {
      return next(createError('Access denied', 403));
    }

    res.status(200).json({
      success: true,
      song: {
        _id: song._id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        genre: song.genre,
        duration: song.duration,
        audioFileId: song.audioFileId,
        coverImageId: song.coverImageId,
        audioStreamUrl: `/api/songs/stream/audio/${song.audioFileId}`,
        coverImageUrl: song.coverImageId ? `/api/songs/stream/image/${song.coverImageId}` : null,
        uploadedBy: song.uploadedBy,
        isDefault: song.isDefault,
        plays: song.plays,
        createdAt: song.createdAt,
        updatedAt: song.updatedAt
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update song metadata
// @route   PUT /api/songs/:id
// @access  Private
const updateSong = async (req, res, next) => {
  try {
    const { title, artist, album, genre } = req.body;

    const song = await Song.findById(req.params.id);

    if (!song) {
      return next(createError('Song not found', 404));
    }

    // Check if user owns this song
    if (song.uploadedBy.toString() !== req.user._id.toString()) {
      return next(createError('You can only update your own songs', 403));
    }

    // Update fields if provided
    if (title) song.title = title;
    if (artist) song.artist = artist;
    if (album !== undefined) song.album = album;
    if (genre) song.genre = genre;

    // Handle cover image replacement
    if (req.files && req.files.coverImage) {
      const coverImage = req.files.coverImage[0];

      // Delete old cover image if exists
      if (song.coverImageId) {
        const { gridfsBucket: imageGridfsBucket } = getImageGFS();
        await imageGridfsBucket.delete(song.coverImageId);
      }

      // Upload new cover image
      const { gridfsBucket: imageGridfsBucket } = getImageGFS();
      const imageUploadStream = imageGridfsBucket.openUploadStream(coverImage.originalname, {
        metadata: {
          originalName: coverImage.originalname,
          uploadedBy: req.user._id,
          uploadDate: new Date()
        }
      });

      imageUploadStream.end(coverImage.buffer);

      await new Promise((resolve, reject) => {
        imageUploadStream.on('finish', resolve);
        imageUploadStream.on('error', reject);
      });

      song.coverImageId = imageUploadStream.id;
      song.coverImageFilename = coverImage.originalname;
    }

    await song.save();

    res.status(200).json({
      success: true,
      message: 'Song updated successfully',
      song: {
        _id: song._id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        genre: song.genre,
        duration: song.duration,
        audioStreamUrl: `/api/songs/stream/audio/${song.audioFileId}`,
        coverImageUrl: song.coverImageId ? `/api/songs/stream/image/${song.coverImageId}` : null,
        plays: song.plays,
        updatedAt: song.updatedAt
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete song
// @route   DELETE /api/songs/:id
// @access  Private
const deleteSong = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return next(createError('Song not found', 404));
    }

    // Check if user owns this song
    if (song.uploadedBy.toString() !== req.user._id.toString()) {
      return next(createError('You can only delete your own songs', 403));
    }

    // Delete audio file from GridFS
    const { gridfsBucket } = getGFS();
    await gridfsBucket.delete(song.audioFileId);

    // Delete cover image from GridFS if exists
    if (song.coverImageId) {
      const { gridfsBucket: imageGridfsBucket } = getImageGFS();
      await imageGridfsBucket.delete(song.coverImageId);
    }

    // Delete song document
    await Song.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Song deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Stream audio file
// @route   GET /api/songs/stream/audio/:id
// @access  Private
const streamAudio = async (req, res, next) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    // Find song by audioFileId
    const song = await Song.findOne({ audioFileId: fileId });

    if (!song) {
      return next(createError('Audio file not found', 404));
    }

    // Check access
    if (!song.isDefault && song.uploadedBy.toString() !== req.user._id.toString()) {
      return next(createError('Access denied', 403));
    }

    // Increment play count
    song.plays += 1;
    await song.save();

    const { gridfsBucket } = getGFS();

    // Get file info
    const files = await gridfsBucket.find({ _id: fileId }).toArray();

    if (!files || files.length === 0) {
      return next(createError('Audio file not found', 404));
    }

    const file = files[0];

    // Set headers
    res.set({
      'Content-Type': file.contentType || 'audio/mpeg',
      'Content-Length': file.length,
      'Accept-Ranges': 'bytes'
    });

    // Stream the file
    const downloadStream = gridfsBucket.openDownloadStream(fileId);
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      next(error);
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get cover image
// @route   GET /api/songs/stream/image/:id
// @access  Private
const getCoverImage = async (req, res, next) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);

    // Find song by coverImageId
    const song = await Song.findOne({ coverImageId: fileId });

    if (!song) {
      return next(createError('Image not found', 404));
    }

    // Check access
    if (!song.isDefault && song.uploadedBy.toString() !== req.user._id.toString()) {
      return next(createError('Access denied', 403));
    }

    const { gridfsBucket: imageGridfsBucket } = getImageGFS();

    // Get file info
    const files = await imageGridfsBucket.find({ _id: fileId }).toArray();

    if (!files || files.length === 0) {
      return next(createError('Image not found', 404));
    }

    const file = files[0];

    // Set headers
    res.set({
      'Content-Type': file.contentType || 'image/jpeg',
      'Content-Length': file.length
    });

    // Stream the image
    const downloadStream = imageGridfsBucket.openDownloadStream(fileId);
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      next(error);
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Search songs
// @route   GET /api/songs/search
// @access  Private
const searchSongs = async (req, res, next) => {
  try {
    const { q, genre, sortBy = 'createdAt', order = 'desc' } = req.query;
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

    let query = {
      $or: [
        { isDefault: true },
        { uploadedBy: req.user._id }
      ]
    };

    // Add text search
    if (q) {
      query.$text = { $search: q };
    }

    // Add genre filter
    if (genre) {
      query.genre = genre;
    }

    // Build sort object
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const songs = await Song.find(query)
      .populate('uploadedBy', 'username')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await Song.countDocuments(query);

    const formattedSongs = formatSongsResponse(songs);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(formattedSongs, total, page, limit)
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all genres
// @route   GET /api/songs/genres
// @access  Public
const getGenres = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      genres: GENRES
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};