const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login } = require('../controllers/auth.controller');

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

module.exports = router; 