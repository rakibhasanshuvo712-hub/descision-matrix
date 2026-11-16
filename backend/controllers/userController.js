const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & preferences
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const { name, preferences } = req.body;
    const userId = req.user._id || req.user.id;

    try {
      const user = await User.findById(userId);
      if (user) {
        if (name) user.name = name;
        if (preferences) {
          if (preferences.theme) user.preferences.theme = preferences.theme;
          if (preferences.defaultWeights) user.preferences.defaultWeights = preferences.defaultWeights;
        }
        await user.save();
        return res.json({
          success: true,
          message: 'Profile updated successfully.',
          user,
        });
      }
    } catch (e) {
      // fallback
    }

    if (req.app.locals.fallbackUsers?.has(userId)) {
      const u = req.app.locals.fallbackUsers.get(userId);
      if (name) u.name = name;
      if (preferences) {
        if (preferences.theme) u.preferences.theme = preferences.theme;
        if (preferences.defaultWeights) u.preferences.defaultWeights = preferences.defaultWeights;
      }
      req.app.locals.fallbackUsers.set(userId, u);
      return res.json({
        success: true,
        message: 'Profile updated successfully.',
        user: u,
      });
    }

    res.status(404).json({
      success: false,
      message: 'User not found.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
