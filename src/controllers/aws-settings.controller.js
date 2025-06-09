const AwsSettings = require('../models/aws-settings.model');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

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
      isVerified: settings.isVerified,
      updatedAt: settings.updatedAt,
    };

    return res.json(safeSettings);
  } catch (err) {
    console.error('Get AWS settings error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update AWS settings for the current user
 */
const updateAwsSettings = async (req, res) => {
  try {
    const { accessKeyId, secretAccessKey, region, fromEmail } = req.body;

    if (!accessKeyId || !secretAccessKey || !region || !fromEmail) {
      return res.status(400).json({ message: 'All fields are required' });
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
        isVerified: true,
      },
      { upsert: true, new: true }
    );

    // Don't send sensitive data back
    const safeSettings = {
      region: settings.region,
      fromEmail: settings.fromEmail,
      isVerified: settings.isVerified,
      updatedAt: settings.updatedAt,
    };

    return res.json(safeSettings);
  } catch (err) {
    console.error('Update AWS settings error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Send a test email using current AWS settings
 */
const sendTestEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Test email address is required' });
    }

    const settings = await AwsSettings.findOne({ userId: req.user.userId });
    if (!settings) {
      return res.status(404).json({ message: 'AWS settings not found' });
    }

    const sesClient = new SESClient({
      region: settings.region,
      credentials: {
        accessKeyId: settings.accessKeyId,
        secretAccessKey: settings.secretAccessKey,
      },
    });

    const command = new SendEmailCommand({
      Source: settings.fromEmail,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: 'Test Email from CRM',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: `
              <h1>Test Email</h1>
              <p>This is a test email from your CRM system.</p>
              <p>If you received this email, your AWS SES setup is working correctly!</p>
            `,
            Charset: 'UTF-8',
          },
        },
      },
    });

    await sesClient.send(command);
    return res.json({ message: 'Test email sent successfully' });
  } catch (err) {
    console.error('Test email error:', err);
    return res.status(500).json({
      message: 'Failed to send test email',
      error: err.message,
    });
  }
};

module.exports = {
  getAwsSettings,
  updateAwsSettings,
  sendTestEmail
}; 