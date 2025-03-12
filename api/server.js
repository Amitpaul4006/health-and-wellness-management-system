require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');  // Import the whole module
const medicationRoutes = require('./routes/medications');
const reportRoutes = require('./routes/report');
const auth = require('./middleware/auth');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    env: process.env.NODE_ENV,
    isServerless: !!process.env.NETLIFY
  });
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 5000,
  connectTimeoutMS: 5000
}).then(() => {
  console.log('MongoDB connected in', process.env.NODE_ENV);
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Mount routes for both environments
const { handlers: authHandlers } = authRoutes;

// Auth routes
app.post('/auth/login', authHandlers.login);
app.post('/auth/register', authHandlers.register);
app.post('/auth/logout', authHandlers.logout);

// Full paths for serverless
app.post('/.netlify/functions/api/auth/login', authHandlers.login);
app.post('/.netlify/functions/api/auth/register', authHandlers.register);
app.post('/.netlify/functions/api/auth/logout', authHandlers.logout);

// Mount routes with auth middleware first
app.use(['/medications', '/.netlify/functions/api/medications'], auth, (req, res, next) => {
  if (!req.user?.id) {
    console.error('No user ID in request');
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}, medicationRoutes);

// Mount report routes with auth
app.use(['/reports', '/.netlify/functions/api/reports'], auth, (req, res, next) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}, require('./routes/report'));

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// More detailed error handling
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

// Route not found handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// More aggressive error handling
mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
  mongoose.disconnect();
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Export handler for Netlify Functions
module.exports = app;