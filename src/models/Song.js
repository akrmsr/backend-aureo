// src/models/Song.js
const mongoose = require('mongoose');
const { GENRES } = require('../config/constants');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Song title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  artist: {
    type: String,
    required: [true, 'Artist name is required'],
    trim: true,
    maxlength: [100, 'Artist name cannot exceed 100 characters']
  },
  album: {
    type: String,
    trim: true,
    maxlength: [200, 'Album name cannot exceed 200 characters'],
    default: null
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    enum: {
      values: GENRES,
      message: '{VALUE} is not a valid genre'
    }
  },
  duration: {
    type: Number, // in seconds
    default: 0,
    min: [0, 'Duration cannot be negative']
  },
  
  // Audio file references (GridFS)
  audioFileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Audio file is required']
  },
  audioFilename: {
    type: String,
    required: true
  },
  
  // Cover image references (GridFS) - Optional
  coverImageId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  coverImageFilename: {
    type: String,
    default: null
  },
  
  // User who uploaded the song
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Flag for admin-uploaded songs (visible to all users)
  isDefault: {
    type: Boolean,
    default: false
  },
  
  // Play count
  plays: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
songSchema.index({ uploadedBy: 1 });
songSchema.index({ isDefault: 1 });
songSchema.index({ genre: 1 });
songSchema.index({ plays: -1 });
songSchema.index({ createdAt: -1 });

// Text index for search functionality
songSchema.index({ 
  title: 'text', 
  artist: 'text', 
  album: 'text' 
});

// Method to increment play count
songSchema.methods.incrementPlays = async function() {
  this.plays += 1;
  return await this.save();
};

// Virtual for audio stream URL
songSchema.virtual('audioStreamUrl').get(function() {
  return `/api/songs/stream/audio/${this.audioFileId}`;
});

// Virtual for cover image URL
songSchema.virtual('coverImageUrl').get(function() {
  if (this.coverImageId) {
    return `/api/songs/stream/image/${this.coverImageId}`;
  }
  return null; // Return null if no cover image
});

// Ensure virtuals are included in JSON
songSchema.set('toJSON', { virtuals: true });
songSchema.set('toObject', { virtuals: true });

const Song = mongoose.model('Song', songSchema);

module.exports = Song;