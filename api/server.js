const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const medicationsRoutes = require('./routes/medications');
const reportsRoutes = require('./routes/reports');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/medications', medicationsRoutes);
app.use('/api/reports', reportsRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Export for Netlify Functions
module.exports = app;
