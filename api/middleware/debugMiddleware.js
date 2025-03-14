
const debug = (req, res, next) => {
  console.log('Request:', {
    method: req.method,
    path: req.path,
    token: req.headers.authorization?.substring(0, 20) + '...',
    env: process.env.NODE_ENV,
    isServerless: !!process.env.NETLIFY
  });
  next();
};

module.exports = debug;