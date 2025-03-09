require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const medicationRoutes = require('./routes/medications');
const reportRoutes = require('./routes/report');
const { processJob } = require('./services/jobScheduler');

const app = express();

// Environment-aware CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://managehealthandwellness.netlify.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
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

// Routes
app.use('/auth', authRoutes);  // Note: removed /api prefix
app.use('/medications', medicationRoutes);
app.use('/reports', reportRoutes);

// More detailed error handling
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    path: req.path
  });
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
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

// Export for both environments
if (process.env.NODE_ENV === 'production') {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}