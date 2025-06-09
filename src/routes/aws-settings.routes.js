const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  getAwsSettings, 
  updateAwsSettings, 
  sendTestEmail 
} = require('../controllers/aws-settings.controller');

/**
 * GET /api/aws-settings
 * Get AWS settings for the current user
 */
router.get('/', auth, getAwsSettings);

/**
 * PUT /api/aws-settings
 * Update AWS settings for the current user
 */
router.put('/', auth, updateAwsSettings);

/**
 * POST /api/aws-settings/test
 * Send a test email using current AWS settings
 */
router.post('/test', auth, sendTestEmail);

module.exports = router; 