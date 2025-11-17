// src/middleware/upload.js
const multer = require('multer');
const path = require('path');
const {
  MAX_AUDIO_SIZE,
  MAX_IMAGE_SIZE,
  ALLOWED_AUDIO_TYPES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_AUDIO_EXTENSIONS,
  ALLOWED_IMAGE_EXTENSIONS
} = require('../config/constants');

// ⚠️ IMPORTANT: Vercel serverless functions don't support GridFS storage directly in multer
// We use memory storage and then manually save to GridFS in the controller

// File filter for audio files
const audioFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  console.log('📁 Audio file check:', {
    originalname: file.originalname,
    ext: ext,
    mimetype: mimetype
  });

  if (ALLOWED_AUDIO_TYPES.includes(mimetype) && ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Only audio files are allowed! Supported formats: ${ALLOWED_AUDIO_EXTENSIONS.join(', ')}`), false);
  }
};

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  console.log('🖼️  Image file check:', {
    originalname: file.originalname,
    ext: ext,
    mimetype: mimetype
  });

  if (ALLOWED_IMAGE_TYPES.includes(mimetype) && ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Only image files are allowed! Supported formats: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`), false);
  }
};

// Combined file filter for audio + image
const songFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  // Check if it's an audio file
  if (file.fieldname === 'audioFile') {
    if (ALLOWED_AUDIO_TYPES.includes(mimetype) && ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
      return cb(null, true);
    }
    return cb(new Error(`Invalid audio file. Supported formats: ${ALLOWED_AUDIO_EXTENSIONS.join(', ')}`), false);
  }

  // Check if it's an image file
  if (file.fieldname === 'coverImage') {
    if (ALLOWED_IMAGE_TYPES.includes(mimetype) && ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      return cb(null, true);
    }
    return cb(new Error(`Invalid image file. Supported formats: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`), false);
  }

  cb(new Error('Unexpected field name'), false);
};

// Memory storage for all uploads (required for Vercel)
const storage = multer.memoryStorage();

// Multer upload for audio only
const uploadAudio = multer({
  storage: storage,
  limits: { fileSize: MAX_AUDIO_SIZE },
  fileFilter: audioFileFilter
}).single('audioFile');

// Multer upload for images only
const uploadImage = multer({
  storage: storage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: imageFileFilter
}).single('coverImage');

// Combined upload for song (audio + optional cover image)
const uploadSong = multer({
  storage: storage,
  limits: { 
    fileSize: MAX_AUDIO_SIZE, // Max for any single file
    files: 2 // Max 2 files (audio + image)
  },
  fileFilter: songFileFilter
}).fields([
  { name: 'audioFile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]);

// Validation middleware (runs after multer)
const validateFiles = (req, res, next) => {
  try {
    if (!req.files && !req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No files uploaded',
          statusCode: 400
        }
      });
    }

    // Validate audio file (for combined upload)
    if (req.files && req.files.audioFile) {
      const audioFile = req.files.audioFile[0];
      
      if (audioFile.size > MAX_AUDIO_SIZE) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Audio file too large. Maximum size: ${MAX_AUDIO_SIZE / 1024 / 1024}MB`,
            statusCode: 400
          }
        });
      }
    }

    // Validate cover image (for combined upload)
    if (req.files && req.files.coverImage) {
      const imageFile = req.files.coverImage[0];
      
      if (imageFile.size > MAX_IMAGE_SIZE) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Image file too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
            statusCode: 400
          }
        });
      }
    }

    // Validate single audio file
    if (req.file && req.file.fieldname === 'audioFile') {
      if (req.file.size > MAX_AUDIO_SIZE) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Audio file too large. Maximum size: ${MAX_AUDIO_SIZE / 1024 / 1024}MB`,
            statusCode: 400
          }
        });
      }
    }

    // Validate single image file
    if (req.file && req.file.fieldname === 'coverImage') {
      if (req.file.size > MAX_IMAGE_SIZE) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Image file too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
            statusCode: 400
          }
        });
      }
    }

    console.log('✅ File validation passed');
    next();
    
  } catch (error) {
    console.error('❌ File validation error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'File validation failed',
        statusCode: 500
      }
    });
  }
};

// Helper function to save buffer to GridFS
// This should be called in your controller after multer processes the file
const saveToGridFS = async (buffer, filename, bucketName, metadata) => {
  const mongoose = require('mongoose');
  const { Readable } = require('stream');
  
  return new Promise((resolve, reject) => {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: bucketName
    });

    const uploadStream = bucket.openUploadStream(filename, {
      metadata: metadata
    });

    // Create readable stream from buffer
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    readableStream.pipe(uploadStream);

    uploadStream.on('error', (error) => {
      console.error('GridFS upload error:', error);
      reject(error);
    });

    uploadStream.on('finish', () => {
      console.log('✅ File saved to GridFS:', filename);
      resolve({
        id: uploadStream.id,
        filename: filename
      });
    });
  });
};

module.exports = {
  uploadAudio,
  uploadImage,
  uploadSong,
  validateFiles,
  saveToGridFS
};