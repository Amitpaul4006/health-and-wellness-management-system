const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);
    
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, userId: user._id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt for:', req.body.email);
    
    // MongoDB operations with timeout
    const executeWithTimeout = async (operation) => {
      return Promise.race([
        operation(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Operation timed out')), 5000)
        )
      ]);
    };

    const { email, username } = req.body;
    
    const result = await executeWithTimeout(async () => {
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      }).lean();
      
      if (existingUser) {
        return res.status(400).json({
          message: 'User already exists',
          field: existingUser.email === email ? 'email' : 'username'
        });
      }

      const user = new User(req.body);
      await user.save();
      
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      return res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username
        }
      });
    });

    return result;
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      message: 'Registration failed',
      error: error.message
    });
  }
});

router.post('/logout', async (req, res) => {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ message: 'Could not log out' });
        }
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: 'Logged out successfully' });
      });
    } else {
      // If no session exists, just clear the cookie and return success
      res.clearCookie('connect.sid');
      return res.status(200).json({ message: 'Logged out successfully' });
    }
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

module.exports = router;  // Export router instead of functions