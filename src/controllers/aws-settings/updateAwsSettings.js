const AwsSettings = require('../../models/aws-settings.model');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

/**
 * Update AWS settings for the current user
 */
const updateAwsSettings = async (req, res) => {
  try {
    const { accessKeyId, secretAccessKey, region, fromEmail, fromName, replyToEmail } = req.body;

    if (!accessKeyId || !secretAccessKey || !region || !fromEmail) {
      return res.status(400).json({ message: 'All fields are required except fromName and replyToEmail' });
    }

    // Create SES client to verify credentials
    const sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    // Try to send a test email to verify credentials
    try {
      const command = new SendEmailCommand({
        Source: fromEmail,
        Destination: {
          ToAddresses: [fromEmail], // Send to self for verification
        },
        Message: {
          Subject: {
            Data: 'AWS SES Verification',
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: '<p>This email verifies your AWS SES configuration.</p>',
              Charset: 'UTF-8',
            },
          },
        },
      });

      await sesClient.send(command);
    } catch (err) {
      console.error('AWS SES verification failed:', err);
      return res.status(400).json({
        message: 'Failed to verify AWS credentials',
        error: err.message,
      });
    }

    // Update or create settings
    const settings = await AwsSettings.findOneAndUpdate(
      { userId: req.user.userId },
      {
        accessKeyId,
        secretAccessKey,
        region,
        fromEmail,
        fromName: fromName || '',
        replyToEmail: replyToEmail || '',
        isVerified: true,
      },
      { upsert: true, new: true }
    );

    // Don't send sensitive data back
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
    console.error('Update AWS settings error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = updateAwsSettings; 