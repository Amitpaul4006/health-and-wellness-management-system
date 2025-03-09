const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');

// Validation middleware
const validateLogin = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required')
];

const validateRegister = [
  body('name')
    .notEmpty()
    .trim()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number')
];

// Routes with logging
router.post('/login', validateLogin, (req, res, next) => {
    console.log('Login attempt:', req.body.email);
    authController.login(req, res, next);
});

router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt for:', req.body.email);
    
    // Set timeout for database operations
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database operation timed out')), 5000)
    );

    const registrationPromise = (async () => {
      // Check connection state
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database not connected');
      }

      const { email, username } = req.body;
      
      // Use lean() for faster queries
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      }).lean().maxTimeMS(5000);
      
      if (existingUser) {
        return res.status(400).json({
          message: 'User already exists',
          field: existingUser.email === email ? 'email' : 'username'
        });
      }

      const user = new User(req.body);
      await user.save({ timeout: 5000 });
      
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      
      return res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username
        }
      });
    })();

    // Race between timeout and registration
    await Promise.race([registrationPromise, timeoutPromise]);
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
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

module.exports = router;