const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getCurrentUser, updateProfile, getAllUsers } = require('../controllers/user.controller');

// Get current user profile
router.get('/me', auth, getCurrentUser);

// Update user profile
router.put('/me', auth, updateProfile);

// List all users (admin only, for demo)
router.get('/', auth, getAllUsers);

module.exports = router; 