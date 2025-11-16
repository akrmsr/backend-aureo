// src/utils/gridfsUpload.js
// Helper functions to store and read files from MongoDB GridFS.
// Uses mongoose connection to access the underlying mongodb driver.

const mongoose = require('mongoose');
const { GridFSBucket, ObjectId } = require('mongodb');
const stream = require('stream');

function getBucket() {
  const db = mongoose.connection && mongoose.connection.db;
  if (!db) throw new Error('MongoDB connection not ready - cannot access GridFS bucket');
  return new GridFSBucket(db, { bucketName: 'uploads' });
}

function storeFileToGridFS(readableStream, filename, contentType) {
  return new Promise((resolve, reject) => {
    try {
      const bucket = getBucket();
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: contentType || 'application/octet-stream',
        metadata: {}
      });

      readableStream.pipe(uploadStream)
        .on('error', (err) => reject(err))
        .on('finish', (file) => {
          resolve({
            fileId: file._id,
            filename: file.filename,
            length: file.length,
            uploadDate: file.uploadDate,
            contentType: file.contentType
          });
        });
    } catch (err) {
      reject(err);
    }
  });
}

async function getFileInfo(fileId) {
  const bucket = getBucket();
  const _id = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
  const filesColl = bucket.s.db.collection(bucket.s.options.bucketName + '.files');
  const fileDoc = await filesColl.findOne({ _id });
  return fileDoc;
}

function openDownloadStream(fileId, options = {}) {
  const bucket = getBucket();
  const _id = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
  const streamOptions = {};
  if (typeof options.start === 'number') streamOptions.start = options.start;
  return bucket.openDownloadStream(_id, streamOptions);
}

async function streamExists(fileId) {
  const file = await getFileInfo(fileId);
  return !!file;
}

module.exports = {
  getBucket,
  storeFileToGridFS,
  getFileInfo,
  openDownloadStream,
  streamExists
};