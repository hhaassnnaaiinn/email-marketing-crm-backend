const AwsSettings = require('../../models/aws-settings.model');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

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

    // Format the source with name if available
    const source = settings.fromName && settings.fromName.trim() 
      ? `"${settings.fromName}" <${settings.fromEmail}>`
      : settings.fromEmail;

    const command = new SendEmailCommand({
      Source: source,
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
              <p>Sender: ${settings.fromName || 'No name set'} (${settings.fromEmail})</p>
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

module.exports = sendTestEmail; 