const AWS = require('aws-sdk');

/**
 * Initialize SES client with AWS settings
 * @param {Object} awsSettings - AWS settings from database
 * @returns {AWS.SES} Configured SES client
 */
function getSESClient(awsSettings) {
  if (!awsSettings || !awsSettings.isVerified) {
    throw new Error('AWS SES settings not configured or not verified');
  }

  return new AWS.SES({
    accessKeyId: awsSettings.accessKeyId,
    secretAccessKey: awsSettings.secretAccessKey,
    region: awsSettings.region,
    fromEmail: awsSettings.fromEmail,
  });
}

module.exports = getSESClient; 