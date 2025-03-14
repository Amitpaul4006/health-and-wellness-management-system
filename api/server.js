require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const auth = require('./middleware/auth');  // Add auth import
const authRoutes = require('./routes/auth');
const medicationRoutes = require('./routes/medications');
const reportRoutes = require('./routes/report');
const debugRoutes = require('./routes/debug');

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

// Unprotected Routes (No auth required)
app.post('/auth/login', authRoutes.handlers.login);
app.post('/auth/register', authRoutes.handlers.register);
app.post('/auth/logout', authRoutes.handlers.logout);

// Serverless Unprotected Routes
app.post('/.netlify/functions/api/auth/login', authRoutes.handlers.login);
app.post('/.netlify/functions/api/auth/register', authRoutes.handlers.register);
app.post('/.netlify/functions/api/auth/logout', authRoutes.handlers.logout);

// Protected Routes (Auth required)
const protectedPaths = {
  debug: ['/debug', '/.netlify/functions/api/debug'],
  medications: ['/medications', '/.netlify/functions/api/medications'],
  reports: ['/reports', '/.netlify/functions/api/reports']
};

// Mount protected routes
Object.entries(protectedPaths).forEach(([key, paths]) => {
  const route = key === 'debug' ? debugRoutes : 
                key === 'medications' ? medicationRoutes : 
                reportRoutes;
                
  paths.forEach(path => app.use(path, auth, route));
});

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