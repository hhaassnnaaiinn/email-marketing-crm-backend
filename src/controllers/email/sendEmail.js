const AwsSettings = require('../../models/aws-settings.model');
const EmailService = require('../../services/email.service');
const Contact = require('../../models/contact.model');
const Unsubscribe = require('../../models/unsubscribe.model');
const replaceMergeTags = require('../../utils/merge-tags/replaceMergeTags');
const replaceSubjectMergeTags = require('../../utils/merge-tags/replaceSubjectMergeTags');
const logEmail = require('./logEmail');

/**
 * Send a single email
 */
const sendEmail = async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    // Validate required fields
    if (!to || !subject || !html) {
      return res.status(400).json({
        message: 'Missing required fields: to, subject, and html are required'
      });
    }

    // Find the contact to get their ID
    const contact = await Contact.findOne({ 
      email: to,
      createdBy: req.user.userId 
    });

    if (!contact) {
      return res.status(400).json({
        message: 'Contact not found for this email address'
      });
    }

    // Check if contact is unsubscribed
    const isUnsubscribed = await Unsubscribe.findOne({ 
      contactId: contact._id
    });

    if (isUnsubscribed) {
      return res.status(400).json({
        message: 'Recipient has unsubscribed from emails'
      });
    }

    // Get AWS settings for the current user
    const awsSettings = await AwsSettings.findOne({ userId: req.user.userId });

    if (!awsSettings || !awsSettings.isVerified) {
      return res.status(400).json({
        message: 'Please configure and verify your AWS SES settings first'
      });
    }

    // Replace merge tags in subject and content with contact data
    const personalizedSubject = replaceSubjectMergeTags(subject, contact);

    const personalizedHtml = replaceMergeTags(html, contact);

    // Add unsubscribe link to email HTML with contact ID
    const unsubscribeLink = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/email/unsubscribe?email=${encodeURIComponent(to)}&contactId=${contact._id}`;
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

    // Send the email
    const result = await EmailService.sendEmail({
      to,
      subject: personalizedSubject,
      html: htmlWithUnsubscribe,
      awsSettings,
    });

    // Log successful email
    const log = await logEmail({
      user: req.user.userId,
      to,
      subject: personalizedSubject,
      status: 'sent',
      messageId: result.messageId,
      type: 'single'
    });

    res.json({
      message: 'Email sent successfully',
      messageId: result.messageId,
      logId: log._id
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({
      message: 'Failed to send email',
      error: error.message
    });
  }
};

module.exports = sendEmail; 