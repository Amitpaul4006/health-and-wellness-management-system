const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const moment = require('moment');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const medicationsRoutes = require('./routes/medications');
const reportsRoutes = require('./routes/reports');

// Initialize express
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medications', medicationsRoutes);
app.use('/api/reports', reportsRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB in Vercel'))
  .catch(err => console.error('MongoDB connection error:', err));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: 'vercel' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke in Vercel function!' });
});

// Export for Vercel
module.exports = app;