// src/controllers/adminController.js
const mongoose = require('mongoose');
const Song = require('../models/Song');
const User = require('../models/User');
const { getGFS, getImageGFS } = require('../config/gridfs');
const { 
  getPagination, 
  formatPaginationResponse, 
  createError,
  formatSongsResponse 
} = require('../utils/helpers');

// @desc    Upload default song (visible to all users)
// @route   POST /api/admin/songs/upload
// @access  Private/Admin
const uploadDefaultSong = async (req, res, next) => {
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
        uploadDate: new Date(),
        isDefault: true
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
          uploadDate: new Date(),
          isDefault: true
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

    // Create song document with isDefault: true
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
      isDefault: true // This makes it visible to all users
    });

    res.status(201).json({
      success: true,
      message: 'Default song uploaded successfully',
      song: {
        _id: song._id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        genre: song.genre,
        audioStreamUrl: `/api/songs/stream/audio/${song.audioFileId}`,
        coverImageUrl: song.coverImageId ? `/api/songs/stream/image/${song.coverImageId}` : null,
        isDefault: song.isDefault,
        plays: song.plays,
        createdAt: song.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all default songs
// @route   GET /api/admin/songs
// @access  Private/Admin
const getAllDefaultSongs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

    const songs = await Song.find({ isDefault: true })
      .populate('uploadedBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Song.countDocuments({ isDefault: true });

    const formattedSongs = formatSongsResponse(songs);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(formattedSongs, total, page, limit)
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update default song
// @route   PUT /api/admin/songs/:id
// @access  Private/Admin
const updateDefaultSong = async (req, res, next) => {
  try {
    const { title, artist, album, genre } = req.body;

    const song = await Song.findById(req.params.id);

    if (!song) {
      return next(createError('Song not found', 404));
    }

    // Check if it's a default song
    if (!song.isDefault) {
      return next(createError('This is not a default song', 400));
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
          uploadDate: new Date(),
          isDefault: true
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
      message: 'Default song updated successfully',
      song: {
        _id: song._id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        genre: song.genre,
        audioStreamUrl: `/api/songs/stream/audio/${song.audioFileId}`,
        coverImageUrl: song.coverImageId ? `/api/songs/stream/image/${song.coverImageId}` : null,
        updatedAt: song.updatedAt
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete default song
// @route   DELETE /api/admin/songs/:id
// @access  Private/Admin
const deleteDefaultSong = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return next(createError('Song not found', 404));
    }

    // Check if it's a default song
    if (!song.isDefault) {
      return next(createError('This is not a default song', 400));
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
      message: 'Default song deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { role } = req.query;

    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    // Add song count for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const songsCount = await Song.countDocuments({ 
          uploadedBy: user._id,
          isDefault: false 
        });
        return {
          ...user.toObject(),
          songsCount
        };
      })
    );

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(usersWithStats, total, page, limit)
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(createError('User not found', 404));
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return next(createError('Cannot delete admin users', 403));
    }

    // Get all songs uploaded by this user
    const userSongs = await Song.find({ 
      uploadedBy: user._id,
      isDefault: false 
    });

    // Delete all user's songs and their files
    const { gridfsBucket } = getGFS();
    const { gridfsBucket: imageGridfsBucket } = getImageGFS();

    for (const song of userSongs) {
      // Delete audio file
      await gridfsBucket.delete(song.audioFileId);

      // Delete cover image if exists
      if (song.coverImageId) {
        await imageGridfsBucket.delete(song.coverImageId);
      }

      // Delete song document
      await Song.findByIdAndDelete(song._id);
    }

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User and all their songs deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDefaultSong,
  getAllDefaultSongs,
  updateDefaultSong,
  deleteDefaultSong,
  getAllUsers,
  deleteUser
};