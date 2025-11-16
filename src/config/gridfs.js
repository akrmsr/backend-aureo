// src/config/gridfs.js
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

let gfs, gridfsBucket;
let imageGfs, imageGridfsBucket;

const initGridFS = () => {
  const conn = mongoose.connection;
  
  // Initialize GridFS for audio files
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('songs');
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'songs'
  });

  // Initialize GridFS for images
  imageGfs = Grid(conn.db, mongoose.mongo);
  imageGfs.collection('images');
  imageGridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'images'
  });

  console.log('✅ GridFS initialized for songs and images');
};

const getGFS = () => {
  if (!gfs) {
    throw new Error('GridFS not initialized');
  }
  return { gfs, gridfsBucket };
};

const getImageGFS = () => {
  if (!imageGfs) {
    throw new Error('Image GridFS not initialized');
  }
  return { gfs: imageGfs, gridfsBucket: imageGridfsBucket };
};

module.exports = {
  initGridFS,
  getGFS,
  getImageGFS
};