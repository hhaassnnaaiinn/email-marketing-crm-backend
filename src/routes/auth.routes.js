const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, changePassword } = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

// Register
router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], register);

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').exists()
], login);

// Change Password (requires authentication)
router.post('/change-password', [
  auth, // Require authentication
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], changePassword);

module.exports = router; 