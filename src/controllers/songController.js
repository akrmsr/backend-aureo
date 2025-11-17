// src/controllers/songController.js (Example upload handler)
const Song = require('../models/Song');
const { saveToGridFS } = require('../middleware/upload');
const crypto = require('crypto');
const path = require('path');

// Upload a new song
const uploadSong = async (req, res) => {
  try {
    console.log('📤 Upload song request received');
    
    // Check if files were uploaded
    if (!req.files || !req.files.audioFile) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Audio file is required',
          statusCode: 400
        }
      });
    }

    // Get files from request
    const audioFile = req.files.audioFile[0];
    const coverImage = req.files.coverImage ? req.files.coverImage[0] : null;

    // Get song metadata from request body
    const { title, artist, album, genre, duration } = req.body;

    // Validate required fields
    if (!title || !artist || !genre) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Title, artist, and genre are required',
          statusCode: 400
        }
      });
    }

    console.log('📁 Saving audio file to GridFS...');
    
    // Save audio file to GridFS
    const audioFilename = crypto.randomBytes(16).toString('hex') + path.extname(audioFile.originalname);
    const audioGridFS = await saveToGridFS(
      audioFile.buffer,
      audioFilename,
      'songs',
      {
        originalName: audioFile.originalname,
        mimetype: audioFile.mimetype,
        size: audioFile.size,
        uploadedBy: req.user._id,
        uploadDate: new Date()
      }
    );

    let coverImageId = null;
    let coverImageFilename = null;

    // Save cover image to GridFS if provided
    if (coverImage) {
      console.log('🖼️  Saving cover image to GridFS...');
      
      const imageFilename = crypto.randomBytes(16).toString('hex') + path.extname(coverImage.originalname);
      const imageGridFS = await saveToGridFS(
        coverImage.buffer,
        imageFilename,
        'images',
        {
          originalName: coverImage.originalname,
          mimetype: coverImage.mimetype,
          size: coverImage.size,
          uploadedBy: req.user._id,
          uploadDate: new Date()
        }
      );
      
      coverImageId = imageGridFS.id;
      coverImageFilename = imageFilename;
    }

    console.log('💾 Creating song document...');

    // Create song document
    const song = new Song({
      title: title.trim(),
      artist: artist.trim(),
      album: album ? album.trim() : null,
      genre,
      duration: parseInt(duration) || 0,
      audioFileId: audioGridFS.id,
      audioFilename: audioFilename,
      coverImageId,
      coverImageFilename,
      uploadedBy: req.user._id,
      isDefault: req.user.role === 'admin' // Admin uploads are default
    });

    await song.save();

    console.log('✅ Song uploaded successfully:', song._id);

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
        audioStreamUrl: song.audioStreamUrl,
        coverImageUrl: song.coverImageUrl,
        uploadedBy: song.uploadedBy,
        isDefault: song.isDefault,
        createdAt: song.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Upload song error:', error);
    
    // Clean up uploaded files if song creation fails
    // TODO: Implement GridFS cleanup if needed
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to upload song',
        statusCode: 500,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

// Stream audio file
const streamAudio = async (req, res) => {
  try {
    const { fileId } = req.params;
    const mongoose = require('mongoose');

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid file ID',
          statusCode: 400
        }
      });
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'songs'
    });

    // Find file
    const files = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Audio file not found',
          statusCode: 404
        }
      });
    }

    const file = files[0];

    // Set headers
    res.set({
      'Content-Type': file.metadata?.mimetype || 'audio/mpeg',
      'Content-Length': file.length,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000'
    });

    // Handle range requests for audio seeking
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;
      const chunksize = (end - start) + 1;

      res.status(206);
      res.set({
        'Content-Range': `bytes ${start}-${end}/${file.length}`,
        'Content-Length': chunksize
      });

      const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId), {
        start,
        end: end + 1
      });

      downloadStream.pipe(res);
    } else {
      // Stream entire file
      const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
      downloadStream.pipe(res);
    }

  } catch (error) {
    console.error('❌ Stream audio error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to stream audio',
        statusCode: 500
      }
    });
  }
};

// Stream cover image
const streamImage = async (req, res) => {
  try {
    const { fileId } = req.params;
    const mongoose = require('mongoose');

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid file ID',
          statusCode: 400
        }
      });
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'images'
    });

    // Find file
    const files = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Image file not found',
          statusCode: 404
        }
      });
    }

    const file = files[0];

    // Set headers
    res.set({
      'Content-Type': file.metadata?.mimetype || 'image/jpeg',
      'Content-Length': file.length,
      'Cache-Control': 'public, max-age=31536000'
    });

    // Stream image
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    downloadStream.pipe(res);

  } catch (error) {
    console.error('❌ Stream image error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to stream image',
        statusCode: 500
      }
    });
  }
};

module.exports = {
  uploadSong,
  streamAudio,
  streamImage
};