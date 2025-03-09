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
  console.log('Server received:', {
    path: req.path,
    method: req.method,
    body: req.body
  });
  next();
});

// CORS for Netlify
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

// Start the worker when server starts
initializeWorker();

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (worker) {
    await worker.close();
  }
  // ...existing shutdown logic...
});

// Test route to verify API
app.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Mount routes directly (no /api prefix)
app.use('/auth', authRoutes);
app.use('/medications', medicationRoutes);
app.use('/reports', reportRoutes);

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

// Environment-aware database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
})
.then(() => console.log('MongoDB connected:', 
  process.env.NODE_ENV === 'production' ? 'Production DB' : 'Development DB'))
.catch(err => console.error('MongoDB connection error:', err));

// Export handler for Netlify Functions
module.exports = app;