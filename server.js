// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/database');
const sessionConfig = require('./src/config/session');
const { initGridFS } = require('./src/config/gridfs');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

// Import routes
const authRoutes = require('./src/routes/auth');
const songRoutes = require('./src/routes/songs');
const adminRoutes = require('./src/routes/admin');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Initialize GridFS after MongoDB connection
const mongoose = require('mongoose');
mongoose.connection.once('open', () => {
  initGridFS();
});

// ----------------------
// CORS configuration
// ----------------------
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://frontend-aureo.vercel.app';

const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Apply CORS middleware (handles preflight OPTIONS requests automatically)
app.use(cors(corsOptions));

// ❌ REMOVED: app.options('*', cors(corsOptions)); 
// This line causes PathError in Vercel serverless environment

// ----------------------
// Middleware
// ----------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session(sessionConfig));

// ----------------------
// Static files & Favicon
// ----------------------
app.use(express.static('public'));

// Handle favicon (prevent 500 error)
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎵 Music Player API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      songs: '/api/songs',
      admin: '/api/admin'
    },
    timestamp: new Date().toISOString()
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ----------------------
// API Routes
// ----------------------
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/admin', adminRoutes);

// ----------------------
// Error handling
// ----------------------
app.use(notFound);
app.use(errorHandler);

// ----------------------
// Export for Vercel Serverless
// ----------------------
module.exports = app;

// ----------------------
// Start server (for local development only)
// ----------------------
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  
  const server = app.listen(PORT, () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`🎵 Music Player API listening on port ${PORT}`);
    console.log(`📍 Frontend URL: ${FRONTEND_URL}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Available routes:');
    console.log(`  - Auth: /api/auth`);
    console.log(`  - Songs: /api/songs`);
    console.log(`  - Admin: /api/admin`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });

  // ----------------------
  // Graceful shutdown
  // ----------------------
  process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });

  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Process terminated');
    });
  });
}