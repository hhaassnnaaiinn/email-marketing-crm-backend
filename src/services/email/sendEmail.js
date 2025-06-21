const getSESClient = require('./getSESClient');

/**
 * Send a single email
 * @param {Object} params Email parameters
 * @param {string} params.to Recipient email
 * @param {string} params.subject Email subject
 * @param {string} params.html HTML content
 * @param {Object} params.awsSettings AWS settings from database
 * @returns {Promise} AWS SES sendEmail promise
 */
async function sendEmail({ to, subject, html, awsSettings }) {
  const ses = getSESClient(awsSettings);

  // Format the source with name if available
  const source = awsSettings.fromName && awsSettings.fromName.trim() 
    ? `"${awsSettings.fromName}" <${awsSettings.fromEmail}>`
    : awsSettings.fromEmail;

  const params = {
    Source: source,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: html,
          Charset: 'UTF-8',
        },
      },
    },
  };

  // Add ReplyToAddresses if replyToEmail is set
  if (awsSettings.replyToEmail && awsSettings.replyToEmail.trim()) {
    params.ReplyToAddresses = [awsSettings.replyToEmail.trim()];
  }

  try {
    const result = await ses.sendEmail(params).promise();
    return {
      success: true,
      messageId: result.MessageId,
    };
  } catch (error) {
    console.error('AWS SES Error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

module.exports = sendEmail; 