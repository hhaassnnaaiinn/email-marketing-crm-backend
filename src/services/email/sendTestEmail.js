const sendEmail = require('./sendEmail');

/**
 * Send a test email to verify AWS settings
 * @param {Object} awsSettings AWS settings from database
 * @returns {Promise} Test email result
 */
async function sendTestEmail(awsSettings) {
  return sendEmail({
    to: awsSettings.fromEmail,
    subject: 'AWS SES Test Email',
    html: `
      <h1>AWS SES Test Email</h1>
      <p>This is a test email to verify your AWS SES configuration.</p>
      <p>If you received this email, your AWS SES settings are working correctly!</p>
      <p>Configuration details:</p>
      <ul>
        <li>Region: ${awsSettings.region}</li>
        <li>From Email: ${awsSettings.fromEmail}</li>
        <li>From Name: ${awsSettings.fromName || 'Not set'}</li>
        <li>Verified: ${awsSettings.isVerified ? 'Yes' : 'No'}</li>
      </ul>
    `,
    awsSettings,
  });
}

module.exports = sendTestEmail; 