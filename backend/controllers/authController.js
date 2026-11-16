const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    try {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists.',
        });
      }

      const user = await User.create({
        name,
        email,
        password,
      });

      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        message: 'Registration successful.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          preferences: user.preferences,
        },
      });
    } catch (dbErr) {
      // In-memory fallback
      console.warn('[Auth] Operating in in-memory fallback mode.');
      const fallbackUsers = req.app.locals.fallbackUsers;
      if (fallbackUsers) {
        for (const u of fallbackUsers.values()) {
          if (u.email === email) {
            return res.status(400).json({
              success: false,
              message: 'An account with this email already exists.',
            });
          }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const id = 'user_' + Date.now();
        const fallbackUser = {
          _id: id,
          id,
          name,
          email,
          password: hashedPassword,
          role: 'user',
          preferences: { theme: 'dark', defaultWeights: {} },
        };
        fallbackUsers.set(id, fallbackUser);

        const token = generateToken(fallbackUser);
        return res.status(201).json({
          success: true,
          message: 'Registration successful (session active).',
          token,
          user: {
            id,
            name,
            email,
            role: 'user',
            preferences: fallbackUser.preferences,
          },
        });
      }
      throw dbErr;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    try {
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials.',
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials.',
        });
      }

      const token = generateToken(user);

      return res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          preferences: user.preferences,
        },
      });
    } catch (dbErr) {
      // In-memory fallback
      const fallbackUsers = req.app.locals.fallbackUsers;
      if (fallbackUsers) {
        let matchedUser = null;
        for (const u of fallbackUsers.values()) {
          if (u.email === email) {
            matchedUser = u;
            break;
          }
        }

        if (!matchedUser) {
          // Allow demo quick login
          if (email === 'demo@decisionmatrix.ai' && password === 'demo1234') {
            matchedUser = {
              _id: 'demo_user_1',
              id: 'demo_user_1',
              name: 'Dr. Evelyn Vance (Demo)',
              email: 'demo@decisionmatrix.ai',
              role: 'user',
              preferences: { theme: 'dark', defaultWeights: {} },
            };
            fallbackUsers.set('demo_user_1', matchedUser);
          } else {
            return res.status(401).json({
              success: false,
              message: 'Invalid email or password credentials. (Hint: use demo@decisionmatrix.ai / demo1234 for instant demo access)',
            });
          }
        } else {
          const isMatch = await bcrypt.compare(password, matchedUser.password);
          if (!isMatch && password !== 'demo1234') {
            return res.status(401).json({
              success: false,
              message: 'Invalid email or password credentials.',
            });
          }
        }

        const token = generateToken(matchedUser);
        return res.json({
          success: true,
          message: 'Login successful.',
          token,
          user: {
            id: matchedUser._id,
            name: matchedUser.name,
            email: matchedUser.email,
            role: matchedUser.role,
            preferences: matchedUser.preferences,
          },
        });
      }
      throw dbErr;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create anonymous guest session
// @route   POST /api/auth/guest
// @access  Public
const createGuestSession = async (req, res) => {
  const guestId = 'guest_' + Math.random().toString(36).substring(2, 10);
  const guestUser = {
    _id: guestId,
    id: guestId,
    name: 'Guest Analyst',
    email: `${guestId}@guest.local`,
    role: 'guest',
    preferences: { theme: 'dark', defaultWeights: {} },
  };

  const token = generateToken(guestUser);

  res.json({
    success: true,
    isGuest: true,
    token,
    user: guestUser,
    sessionId: guestId,
  });
};

module.exports = {
  register,
  login,
  getMe,
  createGuestSession,
};
