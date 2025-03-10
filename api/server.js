require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const medicationRoutes = require('./routes/medications');
const reportRoutes = require('./routes/report');
const { processJob } = require('./services/jobScheduler');

const app = express();

// Debug middleware
app.use((req, res, next) => {
  console.log('Express Request:', {
    path: req.path,
    method: req.method
  });
  next();
});

// CORS middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log('API Request:', req.method, req.path);
  next();
});

// Initialize the job processor worker
let worker;
async function initializeWorker() {
  try {
    worker = await processJob();
    console.log('Job processor worker initialized');
    
    worker.on('completed', job => {
      console.log(`Job ${job.id} completed`);
    });

    worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed:`, err);
    });
  } catch (error) {
    console.error('Failed to initialize worker:', error);
  }
}

// Check for serverless environment
const isServerless = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_VERSION;

// Skip worker initialization in serverless
if (!isServerless) {
  initializeWorker();
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (worker) {
    await worker.close();
  }
  // ...existing shutdown logic...
});

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log('Request received:', {
    url: req.url,
    path: req.path,
    method: req.method,
    body: req.body
  });
  next();
});

// MongoDB connection with updated options
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState) {
      return true;
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      // Remove deprecated options
      bufferCommands: false
    });
    
    console.log('MongoDB connected in', process.env.NODE_ENV, 'mode');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    return false;
  }
};

// Add connection middleware before routes
app.use(async (req, res, next) => {
  try {
    if (!mongoose.connection.readyState) {
      const connected = await connectDB();
      if (!connected) {
        return res.status(503).json({
          message: 'Service temporarily unavailable',
          error: 'Database connection failed'
        });
      }
    }
    next();
  } catch (err) {
    console.error('Middleware connection error:', err);
    return res.status(503).json({
      message: 'Service temporarily unavailable',
      error: err.message
    });
  }
});

// Mount routes at root level
app.use('/auth', authRoutes);
app.use('/medications', medicationRoutes);
app.use('/reports', reportRoutes);

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