const AwsSettings = require('../../models/aws-settings.model');

/**
 * Get AWS settings for the current user
 */
const getAwsSettings = async (req, res) => {
  try {
    const settings = await AwsSettings.findOne({ userId: req.user.userId });
    if (!settings) {
      return res.status(404).json({ message: 'AWS settings not found' });
    }

    // Don't send sensitive data to the client
    const safeSettings = {
      region: settings.region,
      fromEmail: settings.fromEmail,
      fromName: settings.fromName,
      replyToEmail: settings.replyToEmail,
      isVerified: settings.isVerified,
      updatedAt: settings.updatedAt,
    };

    return res.json(safeSettings);
  } catch (err) {
    console.error('Get AWS settings error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = getAwsSettings; 