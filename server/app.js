const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
// ...existing imports...
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/report');

const app = express();

// Add cookie parser
app.use(cookieParser());

// Add session middleware before routes
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// ...existing middleware setup...

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

// ...rest of the code...

module.exports = app;