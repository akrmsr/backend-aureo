// src/config/session.js
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { SESSION_CONFIG } = require('./constants');

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600, // Update session once per 24 hours
    crypto: {
      secret: process.env.SESSION_SECRET || 'your-secret-key'
    }
  }),
  cookie: {
    maxAge: SESSION_CONFIG.MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict'
  },
  name: SESSION_CONFIG.COOKIE_NAME
};

module.exports = sessionConfig;