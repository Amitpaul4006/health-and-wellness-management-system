require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const medicationRoutes = require('./routes/medications');
const reportRoutes = require('./routes/report');
const { processJob } = require('./services/jobScheduler');

const app = express();

// Middleware
app.use(cors());
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
app.use('/api/auth', authRoutes);  // Mount auth routes
app.use('/api/medications', medicationRoutes);
app.use('/api/reports', reportRoutes);

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

// Connect to MongoDB with additional options
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  processJob().then(() => {
    console.log('Job processor worker initialized');
  }).catch(err => {
    console.error('Failed to initialize job processor worker:', err);
  });
});