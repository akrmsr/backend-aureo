// src/utils/fileValidation.js
const path = require('path');
const {
  ALLOWED_AUDIO_TYPES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_AUDIO_EXTENSIONS,
  ALLOWED_IMAGE_EXTENSIONS,
  MAX_AUDIO_SIZE,
  MAX_IMAGE_SIZE
} = require('../config/constants');

// Validate audio file
const validateAudioFile = (file) => {
  const errors = [];

  if (!file) {
    errors.push('Audio file is required');
    return { isValid: false, errors };
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
    errors.push(`Invalid audio format. Allowed formats: ${ALLOWED_AUDIO_EXTENSIONS.join(', ')}`);
  }

  // Check MIME type
  if (!ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
    errors.push(`Invalid audio MIME type. File appears to be: ${file.mimetype}`);
  }

  // Check file size
  if (file.size > MAX_AUDIO_SIZE) {
    errors.push(`Audio file too large. Maximum size: ${MAX_AUDIO_SIZE / 1024 / 1024}MB`);
  }

  // Check if file has content
  if (file.size === 0) {
    errors.push('Audio file is empty');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate image file
const validateImageFile = (file) => {
  const errors = [];

  if (!file) {
    // Image is optional, so no file is valid
    return { isValid: true, errors: [] };
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    errors.push(`Invalid image format. Allowed formats: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`);
  }

  // Check MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    errors.push(`Invalid image MIME type. File appears to be: ${file.mimetype}`);
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    errors.push(`Image file too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
  }

  // Check if file has content
  if (file.size === 0) {
    errors.push('Image file is empty');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate both audio and image files
const validateUploadFiles = (files) => {
  const allErrors = [];

  // Validate audio file
  const audioFile = files.audioFile ? files.audioFile[0] : null;
  const audioValidation = validateAudioFile(audioFile);
  if (!audioValidation.isValid) {
    allErrors.push(...audioValidation.errors);
  }

  // Validate image file (optional)
  const imageFile = files.coverImage ? files.coverImage[0] : null;
  const imageValidation = validateImageFile(imageFile);
  if (!imageValidation.isValid) {
    allErrors.push(...imageValidation.errors);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    audioFile,
    imageFile
  };
};

// Check if file is audio
const isAudioFile = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_AUDIO_EXTENSIONS.includes(ext);
};

// Check if file is image
const isImageFile = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_IMAGE_EXTENSIONS.includes(ext);
};

// Get file extension
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

// Get file size in human-readable format
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Validate file exists in request
const checkFileExists = (req, fieldName) => {
  if (!req.files || !req.files[fieldName] || req.files[fieldName].length === 0) {
    return {
      exists: false,
      error: `${fieldName} is required`
    };
  }

  return {
    exists: true,
    file: req.files[fieldName][0]
  };
};

module.exports = {
  validateAudioFile,
  validateImageFile,
  validateUploadFiles,
  isAudioFile,
  isImageFile,
  getFileExtension,
  formatFileSize,
  checkFileExists
};