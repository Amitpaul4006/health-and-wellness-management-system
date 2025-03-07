const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No auth token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Set both userId and user for backward compatibility
    req.userId = decoded.userId;
    req.user = { _id: decoded.userId };

    console.log('Auth middleware - User ID:', decoded.userId);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = auth;
