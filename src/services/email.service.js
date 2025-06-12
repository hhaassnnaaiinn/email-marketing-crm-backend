const AWS = require('aws-sdk');

class EmailService {
  /**
   * Initialize SES client with AWS settings
   * @param {Object} awsSettings - AWS settings from database
   * @returns {AWS.SES} Configured SES client
   */
  static getSESClient(awsSettings) {
    if (!awsSettings || !awsSettings.isVerified) {
      throw new Error('AWS SES settings not configured or not verified');
    }

    return new AWS.SES({
      accessKeyId: awsSettings.accessKeyId,
      secretAccessKey: awsSettings.secretAccessKey,
      region: awsSettings.region,
      fromEmail:awsSettings.fromEmail,
    });
  }

  /**
   * Send a single email
   * @param {Object} params Email parameters
   * @param {string} params.to Recipient email
   * @param {string} params.subject Email subject
   * @param {string} params.html HTML content
   * @param {Object} params.awsSettings AWS settings from database
   * @returns {Promise} AWS SES sendEmail promise
   */
  static async sendEmail({ to, subject, html, awsSettings }) {
    const ses = this.getSESClient(awsSettings);

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

  /**
   * Send bulk emails with rate limiting
   * @param {Object} params Bulk email parameters
   * @param {Array} params.recipients Array of recipient objects with email
   * @param {string} params.subject Email subject
   * @param {string} params.html HTML content
   * @param {Object} params.awsSettings AWS settings from database
   * @param {number} params.batchSize Number of emails to send in parallel (default: 10)
   * @returns {Promise} Results of bulk send operation
   */
  static async sendBulkEmails({ recipients, subject, html, awsSettings, batchSize = 10 }) {
    const ses = this.getSESClient(awsSettings);
    const results = {
      successful: [],
      failed: [],
      total: recipients.length,
    };

    // Format the source with name if available
    const source = awsSettings.fromName && awsSettings.fromName.trim() 
      ? `"${awsSettings.fromName}" <${awsSettings.fromEmail}>`
      : awsSettings.fromEmail;

    // Process recipients in batches
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchPromises = batch.map(async (recipient) => {
        try {
          const params = {
            Source: source,
            Destination: {
              ToAddresses: [recipient.email],
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

          const result = await ses.sendEmail(params).promise();
          results.successful.push({
            email: recipient.email,
            messageId: result.MessageId,
          });
        } catch (error) {
          results.failed.push({
            email: recipient.email,
            error: error.message,
          });
        }
      });

      // Wait for current batch to complete
      await Promise.all(batchPromises);
      
      // Add a small delay between batches to respect AWS SES rate limits
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Send a test email to verify AWS settings
   * @param {Object} awsSettings AWS settings from database
   * @returns {Promise} Test email result
   */
  static async sendTestEmail(awsSettings) {
    return this.sendEmail({
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
}

module.exports = EmailService; 