// src/config/constants.js

// Genre List
const GENRES = [
  'Pop',
  'Rock',
  'Hip-Hop',
  'Rap',
  'Jazz',
  'Classical',
  'Electronic',
  'EDM',
  'Dance',
  'Country',
  'R&B',
  'Soul',
  'Reggae',
  'Metal',
  'Blues',
  'Folk',
  'Indie',
  'Alternative',
  'Punk',
  'K-Pop',
  'Latin',
  'Bollywood',
  'Instrumental',
  'Other'
];

// File size limits (in bytes)
const MAX_AUDIO_SIZE = (process.env.MAX_AUDIO_SIZE || 50) * 1024 * 1024; // 50MB default
const MAX_IMAGE_SIZE = (process.env.MAX_IMAGE_SIZE || 5) * 1024 * 1024;  // 5MB default

// Allowed file types
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Allowed file extensions
const ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a'];
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Pagination defaults
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// User roles
const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Session configuration
const SESSION_CONFIG = {
  MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  COOKIE_NAME: 'connect.sid'
};

module.exports = {
  GENRES,
  MAX_AUDIO_SIZE,
  MAX_IMAGE_SIZE,
  ALLOWED_AUDIO_TYPES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_AUDIO_EXTENSIONS,
  ALLOWED_IMAGE_EXTENSIONS,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  USER_ROLES,
  SESSION_CONFIG
};