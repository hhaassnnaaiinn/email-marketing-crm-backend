const EmailLog = require('../../models/email-log.model');

/**
 * Helper function to log email
 */
const logEmail = async ({ user, to, subject, status, messageId, error, type, campaignId = null }) => {
  try {
    // Validate user ID
    if (!user) {
      console.error('No user ID provided for email log');
      throw new Error('User ID is required for email logging');
    }

    const log = await EmailLog.create({
      user: user, // This will be the userId
      to,
      subject,
      status,
      messageId,
      error,
      type,
      campaignId
    });
    return log;
  } catch (error) {
    console.error('Failed to log email:', error);
    throw error;
  }
};

module.exports = logEmail; 