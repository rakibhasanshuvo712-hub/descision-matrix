const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'decision_matrix_super_secure_jwt_secret_2026';

// Middleware to protect routes that require authentication
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      // Check if User exists in DB, or fallback user in memory
      try {
        req.user = await User.findById(decoded.id).select('-password');
      } catch (err) {
        // In-memory fallback if Mongo is offline
        req.user = req.app.locals.fallbackUsers?.get(decoded.id) || {
          _id: decoded.id,
          name: decoded.name || 'User',
          email: decoded.email,
          role: 'user',
        };
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists or session expired.',
        });
      }

      return next();
    } catch (error) {
      console.error('[Auth Middleware] Invalid token:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token validation failed.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is required for this action.',
    });
  }
};

// Optional auth: sets req.user if valid token exists, otherwise allows guest through
const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      try {
        req.user = await User.findById(decoded.id).select('-password');
      } catch (e) {
        req.user = req.app.locals.fallbackUsers?.get(decoded.id) || {
          _id: decoded.id,
          name: decoded.name || 'User',
          email: decoded.email,
        };
      }
    } catch (err) {
      // Ignore token error for optional auth
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

module.exports = {
  protect,
  optionalAuth,
  generateToken,
};
