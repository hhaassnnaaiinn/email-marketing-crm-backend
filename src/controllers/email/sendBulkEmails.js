const AwsSettings = require('../../models/aws-settings.model');
const EmailService = require('../../services/email.service');
const Contact = require('../../models/contact.model');
const Unsubscribe = require('../../models/unsubscribe.model');
const { replaceMergeTags, replaceSubjectMergeTags } = require('../../utils/merge-tags');
const logEmail = require('./logEmail');

/**
 * Send bulk emails
 */
const sendBulkEmails = async (req, res) => {
  try {
    const { recipients, subject, html, batchSize = 50 } = req.body;

    // Validate required fields
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        message: 'Recipients must be a non-empty array'
      });
    }
    if (!subject || !html) {
      return res.status(400).json({
        message: 'Subject and html are required'
      });
    }

    // Get AWS settings for the current user
    const awsSettings = await AwsSettings.findOne({ userId: req.user.userId });

    if (!awsSettings || !awsSettings.isVerified) {
      return res.status(400).json({
        message: 'Please configure and verify your AWS SES settings first'
      });
    }

    // Get all contacts for this user
    const contacts = await Contact.find({ 
      email: { $in: recipients },
      createdBy: req.user.userId 
    }).lean();

    // Create a map of email to contact
    const emailToContact = new Map(contacts.map(contact => [contact.email, contact]));

    // Get all unsubscribed contact IDs for this user
    const unsubscribedContacts = await Unsubscribe.find({ 
      contactId: { $in: contacts.map(c => c._id) }
    }).select('contactId').lean();
    const unsubscribedContactIds = new Set(unsubscribedContacts.map(u => u.contactId.toString()));

    // Filter out unsubscribed recipients
    const validRecipients = recipients.filter(recipient => {
      const contact = emailToContact.get(recipient);
      return contact && !unsubscribedContactIds.has(contact._id.toString());
    });
    
    if (validRecipients.length === 0) {
      return res.status(400).json({
        message: 'All recipients have unsubscribed from emails'
      });
    }

    // Process emails in batches
    const results = {
      successful: [],
      failed: [],
      unsubscribed: recipients.length - validRecipients.length
    };

    for (let i = 0; i < validRecipients.length; i += batchSize) {
      const batch = validRecipients.slice(i, i + batchSize);
      const batchPromises = batch.map(async (recipient) => {
        try {
          const contact = emailToContact.get(recipient);
          
          // Replace merge tags in subject and content with contact data
          const personalizedSubject = replaceSubjectMergeTags(subject, contact);

          const personalizedHtml = replaceMergeTags(html, contact);
          
          // Add personalized unsubscribe link for each recipient
          const unsubscribeLink = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/email/unsubscribe?email=${encodeURIComponent(recipient)}&contactId=${contact._id}`;
          const htmlWithUnsubscribe = personalizedHtml + `
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
              <p style="margin: 0; padding: 10px 0;">
                You received this email because you're subscribed to our mailing list.
              </p>
              <p style="margin: 0; padding: 5px 0;">
                <a href="${unsubscribeLink}" style="color: #666; text-decoration: underline;">
                  Unsubscribe from this mailing list
                </a>
              </p>
              <p style="margin: 0; padding: 5px 0; font-size: 11px;">
                If you have any questions, please contact us.
              </p>
            </div>
          `;

          const result = await EmailService.sendEmail({
            to: recipient,
            subject: personalizedSubject,
            html: htmlWithUnsubscribe,
            awsSettings,
          });

          // Log successful email
          await logEmail({
            user: req.user.userId,
            to: recipient,
            subject: personalizedSubject,
            status: 'sent',
            messageId: result.messageId,
            type: 'bulk'
          });

          results.successful.push({
            to: recipient,
            messageId: result.messageId
          });
        } catch (error) {
          // Categorize the error for better user feedback
          let errorType = 'unknown';
          let userMessage = error.message;
          
          if (error.message.includes('Email address is not verified')) {
            errorType = 'verification_required';
            userMessage = 'Email address is not verified in AWS SES';
          } else if (error.message.includes('MessageRejected')) {
            errorType = 'message_rejected';
            userMessage = 'Email was rejected by AWS SES';
          } else if (error.message.includes('InvalidParameterValue')) {
            errorType = 'invalid_parameters';
            userMessage = 'Invalid email parameters';
          } else if (error.message.includes('QuotaExceeded')) {
            errorType = 'quota_exceeded';
            userMessage = 'Email sending quota exceeded';
          }

          // Log failed email
          await logEmail({
            user: req.user.userId,
            to: recipient,
            subject,
            status: 'failed',
            messageId: 'N/A',
            error: error.message,
            type: 'bulk'
          });

          results.failed.push({
            to: recipient,
            error: userMessage,
            errorType: errorType,
            originalError: error.message
          });
        }
      });

      await Promise.all(batchPromises);
    }

    res.json({
      message: `Bulk email processing completed. ${results.unsubscribed} recipients were unsubscribed and filtered out.`,
      results
    });
  } catch (error) {
    console.error('Bulk email sending failed:', error);
    res.status(500).json({
      message: 'Failed to process bulk emails',
      error: error.message
    });
  }
};

module.exports = sendBulkEmails; 