// src/utils/helpers.js
const mongoose = require('mongoose');
const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('../config/constants');

// Pagination helper
const getPagination = (page, limit) => {
  const currentPage = Math.max(1, parseInt(page) || DEFAULT_PAGE);
  const currentLimit = Math.min(
    Math.max(1, parseInt(limit) || DEFAULT_LIMIT),
    MAX_LIMIT
  );
  const skip = (currentPage - 1) * currentLimit;

  return {
    page: currentPage,
    limit: currentLimit,
    skip
  };
};

// Format pagination response
const formatPaginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

// Check if ID is valid MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Format song response (add stream URLs)
const formatSongResponse = (song) => {
  const songObj = song.toObject ? song.toObject() : song;
  
  return {
    ...songObj,
    audioStreamUrl: `/api/songs/stream/audio/${songObj.audioFileId}`,
    coverImageUrl: songObj.coverImageId 
      ? `/api/songs/stream/image/${songObj.coverImageId}` 
      : null
  };
};

// Format multiple songs response
const formatSongsResponse = (songs) => {
  return songs.map(song => formatSongResponse(song));
};

// Create custom error
const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Format duration (seconds to mm:ss)
const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, ''); // Remove potential HTML tags
};

module.exports = {
  getPagination,
  formatPaginationResponse,
  isValidObjectId,
  formatSongResponse,
  formatSongsResponse,
  createError,
  formatDuration,
  sanitizeInput
};