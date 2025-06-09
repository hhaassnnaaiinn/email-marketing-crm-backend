const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

/**
 * Get current user profile
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const update = {};
    
    if (name) update.name = name;
    if (password) update.password = await bcrypt.hash(password, 10);
    
    const user = await User.findByIdAndUpdate(
      req.user.userId, 
      update, 
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * List all users (admin only, for demo)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCurrentUser,
  updateProfile,
  getAllUsers
}; 