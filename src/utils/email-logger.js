const EmailLog = require('../models/email-log.model');

/**
 * Log an email event to the database
 * @param {Object} params Email log parameters
 * @param {string} params.user User ID
 * @param {string} params.to Recipient email
 * @param {string} params.subject Email subject
 * @param {string} params.status Email status ('sent' or 'failed')
 * @param {string} params.messageId Message ID from email service
 * @param {string} [params.error] Error message if status is 'failed'
 * @param {string} params.type Email type ('single', 'bulk', 'test')
 * @param {string} [params.campaignId] Campaign ID if part of a campaign
 * @returns {Promise<Object>} Created email log
 */
async function logEmail({ user, to, subject, status, messageId, error, type, campaignId = null }) {
  try {
    // Validate user ID
    if (!user) {
      console.error('No user ID provided for email log');
      throw new Error('User ID is required for email logging');
    }

    console.log('Logging email for user:', user);
    const log = await EmailLog.create({
      user, // This will be the userId
      to,
      subject,
      status,
      messageId,
      error,
      type,
      campaignId
    });
    console.log('Email logged successfully:', log._id);
    return log;
  } catch (error) {
    console.error('Failed to log email:', error);
    throw error;
  }
}

module.exports = {
  logEmail
}; 