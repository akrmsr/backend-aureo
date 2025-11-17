// src/utils/imageHelper.js
import { API_URL, ENDPOINTS } from './constants';

/**
 * Get full audio stream URL from file ID
 */
export const getAudioStreamUrl = (fileId) => {
  if (!fileId) return null;
  return `${API_URL}${ENDPOINTS.STREAM_AUDIO(fileId)}`;
};

/**
 * Get full cover image URL from file ID
 */
export const getCoverImageUrl = (fileId) => {
  if (!fileId) return null;
  return `${API_URL}${ENDPOINTS.STREAM_IMAGE(fileId)}`;
};

/**
 * Format a single song object with full URLs
 */
export const formatSongUrls = (song) => {
  if (!song) return null;
  
  return {
    ...song,
    audioStreamUrl: song.audioFileId 
      ? getAudioStreamUrl(song.audioFileId)
      : song.audioStreamUrl || null,
    coverImageUrl: song.coverImageId
      ? getCoverImageUrl(song.coverImageId)
      : song.coverImageUrl || null
  };
};

/**
 * Format array of songs with full URLs
 */
export const formatSongsUrls = (songs) => {
  if (!Array.isArray(songs)) return [];
  return songs.map(song => formatSongUrls(song));
};

/**
 * Get default/placeholder image URL
 */
export const getDefaultCoverImage = () => {
  return '/default-cover.png'; // Add a default cover image to your public folder
};

/**
 * Validate if URL is a valid image URL
 */
export const isValidImageUrl = (url) => {
  if (!url) return false;
  try {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    return validExtensions.some(ext => pathname.endsWith(ext));
  } catch (error) {
    return false;
  }
};

/**
 * Validate if URL is a valid audio URL
 */
export const isValidAudioUrl = (url) => {
  if (!url) return false;
  try {
    const validExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    return validExtensions.some(ext => pathname.endsWith(ext)) || 
           pathname.includes('/stream/audio/');
  } catch (error) {
    return false;
  }
};

/**
 * Format file size in bytes to human readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format duration in seconds to MM:SS format
 */
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Validate image file before upload
 */
export const validateImageFile = (file, maxSizeMB = 5) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file selected');
    return { valid: false, errors };
  }
  
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    errors.push('Invalid file type. Only JPG, PNG, and WEBP are allowed.');
  }
  
  // Check file size
  const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
  if (file.size > maxSize) {
    errors.push(`File too large. Maximum size is ${maxSizeMB}MB.`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate audio file before upload
 */
export const validateAudioFile = (file, maxSizeMB = 50) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file selected');
    return { valid: false, errors };
  }
  
  // Check file type
  const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'];
  if (!validTypes.includes(file.type)) {
    errors.push('Invalid file type. Only MP3, WAV, OGG, and M4A are allowed.');
  }
  
  // Check file size
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push(`File too large. Maximum size is ${maxSizeMB}MB.`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Create object URL for file preview
 */
export const createFilePreviewUrl = (file) => {
  if (!file) return null;
  try {
    return URL.createObjectURL(file);
  } catch (error) {
    console.error('Error creating preview URL:', error);
    return null;
  }
};

/**
 * Revoke object URL to free memory
 */
export const revokeFilePreviewUrl = (url) => {
  if (url) {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error revoking preview URL:', error);
    }
  }
};

export default {
  getAudioStreamUrl,
  getCoverImageUrl,
  formatSongUrls,
  formatSongsUrls,
  getDefaultCoverImage,
  isValidImageUrl,
  isValidAudioUrl,
  formatFileSize,
  formatDuration,
  validateImageFile,
  validateAudioFile,
  createFilePreviewUrl,
  revokeFilePreviewUrl
};