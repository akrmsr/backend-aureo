// src/utils/constants.js

// API Base URL - Make sure this matches your backend
export const API_URL = process.env.REACT_APP_API_URL || 'https://backend-aureo.vercel.app';

// API Endpoints
export const ENDPOINTS = {
  // Authentication
  SIGNUP: '/api/auth/register',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  
  // Songs
  SONGS: '/api/songs',
  MY_SONGS: '/api/songs/my-songs',
  SONG_BY_ID: (id) => `/api/songs/${id}`,
  UPLOAD_SONG: '/api/songs/upload',
  UPDATE_SONG: (id) => `/api/songs/${id}`,
  DELETE_SONG: (id) => `/api/songs/${id}`,
  SEARCH_SONGS: '/api/songs/search',
  GENRES: '/api/songs/genres',
  INCREMENT_PLAY: (id) => `/api/songs/${id}/play`,
  
  // Streaming
  STREAM_AUDIO: (fileId) => `/api/songs/stream/audio/${fileId}`,
  STREAM_IMAGE: (fileId) => `/api/songs/stream/image/${fileId}`,
  
  // Admin
  ADMIN_USERS: '/api/admin/users',
  ADMIN_USER_BY_ID: (id) => `/api/admin/users/${id}`,
  ADMIN_DELETE_USER: (id) => `/api/admin/users/${id}`,
  ADMIN_SONGS: '/api/admin/songs',
  ADMIN_UPLOAD: '/api/admin/songs/upload',
  ADMIN_UPDATE_SONG: (id) => `/api/admin/songs/${id}`,
  ADMIN_DELETE_SONG: (id) => `/api/admin/songs/${id}`,
  ADMIN_MAKE_DEFAULT: (id) => `/api/admin/songs/${id}/default`,
  ADMIN_STATISTICS: '/api/admin/statistics',
  ADMIN_LOGS: '/api/admin/logs'
};

// Genres (matches backend)
export const GENRES = [
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

// File size limits (in MB)
export const FILE_LIMITS = {
  MAX_AUDIO_SIZE: 50, // 50MB
  MAX_IMAGE_SIZE: 5   // 5MB
};

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'],
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
};

// Allowed file extensions
export const ALLOWED_EXTENSIONS = {
  AUDIO: ['.mp3', '.wav', '.ogg', '.m4a'],
  IMAGE: ['.jpg', '.jpeg', '.png', '.webp']
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// User roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PROFILE: '/profile',
  MY_SONGS: '/my-songs',
  UPLOAD: '/upload',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_SONGS: '/admin/songs',
  ADMIN_UPLOAD: '/admin/upload'
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  VOLUME: 'volume',
  REPEAT_MODE: 'repeatMode',
  SHUFFLE: 'shuffle',
  LAST_PLAYLIST: 'lastPlaylist'
};

// Toast/Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Audio player states
export const PLAYER_STATES = {
  PLAYING: 'playing',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  LOADING: 'loading',
  ERROR: 'error'
};

// Repeat modes
export const REPEAT_MODES = {
  OFF: 'off',
  ALL: 'all',
  ONE: 'one'
};

export default {
  API_URL,
  ENDPOINTS,
  GENRES,
  FILE_LIMITS,
  ALLOWED_FILE_TYPES,
  ALLOWED_EXTENSIONS,
  PAGINATION,
  USER_ROLES,
  ROUTES,
  STORAGE_KEYS,
  NOTIFICATION_TYPES,
  PLAYER_STATES,
  REPEAT_MODES
};