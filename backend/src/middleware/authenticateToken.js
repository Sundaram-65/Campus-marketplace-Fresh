const jwt = require('jsonwebtoken');

module.exports = function authenticateToken(req, res, next) {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    // ✅ FIX: For upload, allow if no token (or require it based on your needs)
    if (req.path === '/upload') {
      // Allow upload without auth (remove this if you want to require auth)
      return next();
    }
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    req.user = user;
    next();
  });
};
