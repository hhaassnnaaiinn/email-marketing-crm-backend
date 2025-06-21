const AwsSettings = require('../../models/aws-settings.model');
const EmailService = require('../../services/email.service');
const logEmail = require('./logEmail');

/**
 * Send test email
 */
const sendTestEmail = async (req, res) => {
  try {
    
    // Get AWS settings for the current user
    const awsSettings = await AwsSettings.findOne({ userId: req.user.userId });

    if (!awsSettings) {
      return res.status(400).json({
        message: 'AWS settings not found. Please configure your AWS SES settings first.'
      });
    }

    if (!awsSettings.isVerified) {
      return res.status(400).json({
        message: 'AWS settings not verified. Please verify your AWS SES settings first.'
      });
    }

    // Send test email
    const result = await EmailService.sendTestEmail(awsSettings);

    // Log successful test email
    const log = await logEmail({
      user: req.user.userId,
      to: awsSettings.fromEmail,
      subject: 'Test Email',
      status: 'sent',
      messageId: result.messageId,
      type: 'test'
    });

    res.json({
      message: 'Test email sent successfully',
      messageId: result.messageId,
      logId: log._id
    });
  } catch (error) {
    console.error('Test email sending failed:', error);
    res.status(500).json({
      message: 'Failed to send test email',
      error: error.message
    });
  }
};

module.exports = sendTestEmail; 