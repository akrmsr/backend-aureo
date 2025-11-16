// src/middleware/upload.js
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');
const {
  MAX_AUDIO_SIZE,
  MAX_IMAGE_SIZE,
  ALLOWED_AUDIO_TYPES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_AUDIO_EXTENSIONS,
  ALLOWED_IMAGE_EXTENSIONS
} = require('../config/constants');

// GridFS Storage for Audio Files
const audioStorage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  options: { useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'songs',
          metadata: {
            originalName: file.originalname,
            uploadedBy: req.session?.userId || 'anonymous',
            uploadDate: new Date()
          }
        };
        resolve(fileInfo);
      });
    });
  }
});

// GridFS Storage for Images
const imageStorage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  options: { useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'images',
          metadata: {
            originalName: file.originalname,
            uploadedBy: req.session?.userId || 'anonymous',
            uploadDate: new Date()
          }
        };
        resolve(fileInfo);
      });
    });
  }
});

// File filter for audio files
const audioFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

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

  if (ALLOWED_IMAGE_TYPES.includes(mimetype) && ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Only image files are allowed! Supported formats: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`), false);
  }
};

// Multer upload for audio
const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: MAX_AUDIO_SIZE },
  fileFilter: audioFileFilter
});

// Multer upload for images
const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: imageFileFilter
});

// Combined upload for song (audio + optional cover image)
const uploadSong = multer({
  storage: multer.memoryStorage(), // Temporary storage
  limits: { 
    fileSize: MAX_AUDIO_SIZE, // Max for any single file
    files: 2 // Max 2 files (audio + image)
  }
}).fields([
  { name: 'audioFile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]);

// Custom middleware to handle GridFS upload after multer
const processFiles = async (req, res, next) => {
  try {
    if (!req.files) {
      return next();
    }

    const uploadPromises = [];

    // Process audio file
    if (req.files.audioFile) {
      const audioFile = req.files.audioFile[0];
      
      // Validate audio file
      const audioExt = path.extname(audioFile.originalname).toLowerCase();
      if (!ALLOWED_AUDIO_EXTENSIONS.includes(audioExt) || !ALLOWED_AUDIO_TYPES.includes(audioFile.mimetype)) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Invalid audio file. Supported formats: ${ALLOWED_AUDIO_EXTENSIONS.join(', ')}`,
            statusCode: 400
          }
        });
      }

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

    // Process cover image
    if (req.files.coverImage) {
      const imageFile = req.files.coverImage[0];
      
      // Validate image file
      const imageExt = path.extname(imageFile.originalname).toLowerCase();
      if (!ALLOWED_IMAGE_EXTENSIONS.includes(imageExt) || !ALLOWED_IMAGE_TYPES.includes(imageFile.mimetype)) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Invalid image file. Supported formats: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
            statusCode: 400
          }
        });
      }

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

    next();
  } catch (error) {
    console.error('File processing error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'File processing failed',
        statusCode: 500
      }
    });
  }
};

module.exports = {
  uploadAudio,
  uploadImage,
  uploadSong,
  processFiles
};