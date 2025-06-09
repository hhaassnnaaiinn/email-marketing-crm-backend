const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  getEmailHistory, 
  unsubscribe, 
  directUnsubscribe,
  checkUnsubscribeStatus, 
  sendEmail, 
  sendBulkEmails, 
  sendTestEmail,
  unsubscribePage
} = require('../controllers/email.controller');

// Get email history
router.get('/history', auth, getEmailHistory);

// Unsubscribe page for email recipients (public, no auth required)
router.get('/unsubscribe', unsubscribePage);

// Unsubscribe endpoint (public, no auth required)
router.post('/unsubscribe', unsubscribe);

// Direct unsubscribe for email recipients (public, no auth required)
router.post('/direct-unsubscribe', directUnsubscribe);

// Check unsubscribe status (public, no auth required)
router.get('/unsubscribe/status', checkUnsubscribeStatus);

// Send a single email
router.post('/send', auth, sendEmail);

// Send bulk emails
router.post('/send-bulk', auth, sendBulkEmails);

// Send test email
router.post('/test', auth, sendTestEmail);

module.exports = router; 