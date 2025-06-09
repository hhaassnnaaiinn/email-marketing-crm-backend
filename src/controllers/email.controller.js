const AwsSettings = require('../models/aws-settings.model');
const EmailService = require('../services/email.service');
const EmailLog = require('../models/email-log.model');
const Unsubscribe = require('../models/unsubscribe.model');
const { 
  getUnsubscribeErrorPage, 
  getUnsubscribeConfirmationPage, 
  getAlreadyUnsubscribedPage, 
  getUnsubscribeSuccessPage, 
  getServerErrorPage 
} = require('../utils/html-templates');

/**
 * Helper function to log email
 */
const logEmail = async ({ user, to, subject, status, messageId, error, type, campaignId = null }) => {
  try {
    // Validate user ID
    if (!user) {
      console.error('No user ID provided for email log');
      throw new Error('User ID is required for email logging');
    }

    console.log('Logging email for user:', user);
    const log = await EmailLog.create({
      user: user, // This will be the userId
      to,
      subject,
      status,
      messageId,
      error,
      type,
      campaignId
    });
    console.log('Email logged successfully:', log._id);
    return log;
  } catch (error) {
    console.error('Failed to log email:', error);
    throw error;
  }
};

/**
 * Get email history for the authenticated user
 */
const getEmailHistory = async (req, res) => {
  try {
    console.log("=== Email History Request ===");
    console.log("Full user object:", req.user);
    
    // Get user ID from either _id or userId field
    const userId = req.user._id || req.user.userId || req.user.id;
    
    if (!userId) {
      console.error("No valid user ID found in user object:", req.user);
      return res.status(401).json({ error: "Invalid user session" });
    }

    console.log("User ID from token:", userId);
    console.log("User ID type:", typeof userId);
    console.log("Query params:", req.query);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query using the user ID from token
    const query = { user: userId };  // MongoDB will handle the type conversion
    console.log("Initial query:", JSON.stringify(query));

    // Add filters
    if (req.query.status && req.query.status !== "all") {
      query.status = req.query.status;
    }
    if (req.query.type && req.query.type !== "all") {
      query.type = req.query.type;
    }
    if (req.query.search) {
      query.$or = [
        { to: { $regex: req.query.search, $options: "i" } },
        { subject: { $regex: req.query.search, $options: "i" } },
      ];
    }
    if (req.query.startDate || req.query.endDate) {
      query.sentAt = {};
      if (req.query.startDate) {
        query.sentAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.sentAt.$lte = new Date(req.query.endDate);
      }
    }

    console.log("Final query:", JSON.stringify(query));

    // Get total count
    const total = await EmailLog.countDocuments(query);
    console.log("Total documents found:", total);

    // Get logs
    const logs = await EmailLog.find(query)
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log("Logs retrieved:", logs.length);
    if (logs.length > 0) {
      console.log("Sample log:", JSON.stringify(logs[0], null, 2));
    }

    // Get stats
    const stats = await EmailLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          sent: {
            $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
        },
      },
    ]);

    console.log("Stats:", JSON.stringify(stats, null, 2));

    const response = {
      emails: logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };

    console.log("Final response:", JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error("Error in email history:", error);
    res.status(500).json({ error: "Failed to fetch email history" });
  }
};

/**
 * Unsubscribe from emails (public endpoint, no auth required)
 */
const unsubscribe = async (req, res) => {
  try {
    const { email, userId, reason } = req.body;
    
    if (!email || !userId) {
      return res.status(400).json({
        message: 'Email and userId are required'
      });
    }

    // Add to unsubscribe list
    await Unsubscribe.findOneAndUpdate(
      { email, userId },
      { 
        email,
        userId,
        reason,
        unsubscribedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Successfully unsubscribed from emails'
    });
  } catch (error) {
    console.error('Unsubscribe failed:', error);
    res.status(500).json({
      message: 'Failed to process unsubscribe request',
      error: error.message
    });
  }
};

/**
 * Direct unsubscribe for email recipients (public endpoint, no auth required)
 * This is the link that goes in email footers
 */
const directUnsubscribe = async (req, res) => {
  try {
    const { email, userId, reason } = req.body;
    
    if (!email || !userId) {
      return res.status(400).send(getUnsubscribeErrorPage('Email and userId are required.'));
    }

    // Add to unsubscribe list
    await Unsubscribe.findOneAndUpdate(
      { email, userId },
      { 
        email,
        userId,
        reason: reason || 'Direct unsubscribe from email',
        unsubscribedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Return HTML success page
    res.send(getUnsubscribeSuccessPage(email));
  } catch (error) {
    console.error('Direct unsubscribe failed:', error);
    res.status(500).send(getServerErrorPage());
  }
};

/**
 * Check unsubscribe status (public endpoint, no auth required)
 */
const checkUnsubscribeStatus = async (req, res) => {
  try {
    const { email, userId } = req.query;
    
    if (!email || !userId) {
      return res.status(400).json({
        message: 'Email and userId are required'
      });
    }

    const unsubscribe = await Unsubscribe.findOne({ email, userId });
    
    res.json({
      isUnsubscribed: !!unsubscribe,
      unsubscribedAt: unsubscribe?.unsubscribedAt
    });
  } catch (error) {
    console.error('Unsubscribe status check failed:', error);
    res.status(500).json({
      message: 'Failed to check unsubscribe status',
      error: error.message
    });
  }
};

/**
 * Send a single email
 */
const sendEmail = async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    console.log('Send email request from user:', req.user.userId);

    // Validate required fields
    if (!to || !subject || !html) {
      return res.status(400).json({
        message: 'Missing required fields: to, subject, and html are required'
      });
    }

    // Check if user is unsubscribed
    const isUnsubscribed = await Unsubscribe.findOne({ 
      email: to,
      userId: req.user.userId 
    });

    if (isUnsubscribed) {
      return res.status(400).json({
        message: 'Recipient has unsubscribed from emails'
      });
    }

    // Get AWS settings for the current user
    const awsSettings = await AwsSettings.findOne({ userId: req.user.userId });
    console.log('Found AWS settings:', awsSettings ? 'Yes' : 'No');

    if (!awsSettings || !awsSettings.isVerified) {
      return res.status(400).json({
        message: 'Please configure and verify your AWS SES settings first'
      });
    }

    // Add unsubscribe link to email HTML with backend route
    const unsubscribeLink = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/email/unsubscribe?email=${encodeURIComponent(to)}&userId=${req.user.userId}`;
    const htmlWithUnsubscribe = html + `
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
      subject,
      html: htmlWithUnsubscribe,
      awsSettings,
    });

    // Log successful email
    const log = await logEmail({
      user: req.user.userId,
      to,
      subject,
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
    
    // Log failed email
    try {
      const log = await logEmail({
        user: req.user.userId,
        to: req.body.to,
        subject: req.body.subject,
        status: 'failed',
        messageId: 'N/A',
        error: error.message,
        type: 'single'
      });
      console.log('Failed email logged:', log._id);
    } catch (logError) {
      console.error('Failed to log failed email:', logError);
    }

    // Handle different types of AWS SES errors gracefully
    if (error.message.includes('Email address is not verified')) {
      return res.status(400).json({
        message: 'Email address is not verified in AWS SES. Please verify the email address in your AWS SES console.',
        error: error.message,
        type: 'verification_required'
      });
    }
    
    if (error.message.includes('MessageRejected')) {
      return res.status(400).json({
        message: 'Email was rejected by AWS SES. Please check your AWS SES configuration and email addresses.',
        error: error.message,
        type: 'message_rejected'
      });
    }
    
    if (error.message.includes('InvalidParameterValue')) {
      return res.status(400).json({
        message: 'Invalid email parameters. Please check the email address and content.',
        error: error.message,
        type: 'invalid_parameters'
      });
    }
    
    if (error.message.includes('QuotaExceeded')) {
      return res.status(429).json({
        message: 'Email sending quota exceeded. Please try again later.',
        error: error.message,
        type: 'quota_exceeded'
      });
    }

    // For other errors, return 500
    res.status(500).json({
      message: 'Failed to send email',
      error: error.message
    });
  }
};

/**
 * Send bulk emails
 */
const sendBulkEmails = async (req, res) => {
  try {
    const { recipients, subject, html, batchSize = 50 } = req.body;
    console.log('Send bulk email request from user:', req.user.userId);

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
    console.log('Found AWS settings:', awsSettings ? 'Yes' : 'No');

    if (!awsSettings || !awsSettings.isVerified) {
      return res.status(400).json({
        message: 'Please configure and verify your AWS SES settings first'
      });
    }

    // Process emails in batches
    const results = {
      successful: [],
      failed: []
    };

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const batchPromises = batch.map(async (recipient) => {
        try {
          // Add personalized unsubscribe link for each recipient
          const unsubscribeLink = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/email/unsubscribe?email=${encodeURIComponent(recipient)}&userId=${req.user.userId}`;
          const htmlWithUnsubscribe = html + `
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
            subject,
            html: htmlWithUnsubscribe,
            awsSettings,
          });

          // Log successful email
          await logEmail({
            user: req.user.userId,
            to: recipient,
            subject,
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
      message: 'Bulk email processing completed',
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

/**
 * Send test email
 */
const sendTestEmail = async (req, res) => {
  try {
    console.log('Test email request from user:', req.user.userId);
    
    // Get AWS settings for the current user
    const awsSettings = await AwsSettings.findOne({ userId: req.user.userId });
    console.log('Found AWS settings:', awsSettings ? 'Yes' : 'No');

    if (!awsSettings) {
      return res.status(400).json({
        message: 'AWS settings not found. Please configure your AWS SES settings first.'
      });
    }

    if (!awsSettings.isVerified) {
      return res.status(400).json({
        message: 'AWS settings not verified. Please verify your AWS SES settings first.'
      });
    }

    // Send test email
    const result = await EmailService.sendTestEmail(awsSettings);
    console.log('Test email sent successfully');

    // Log successful test email
    const log = await logEmail({
      user: req.user.userId,
      to: awsSettings.fromEmail,
      subject: 'Test Email',
      status: 'sent',
      messageId: result.messageId,
      type: 'test'
    });

    res.json({
      message: 'Test email sent successfully',
      messageId: result.messageId,
      logId: log._id
    });
  } catch (error) {
    console.error('Test email sending failed:', error);
    
    // Log failed test email
    try {
      const log = await logEmail({
        user: req.user.userId,
        to: req.body?.to || 'test@example.com',
        subject: 'Test Email',
        status: 'failed',
        messageId: 'N/A',
        error: error.message,
        type: 'test'
      });
      console.log('Failed test email logged:', log._id);
    } catch (logError) {
      console.error('Failed to log failed test email:', logError);
    }

    // Handle different types of AWS SES errors gracefully
    if (error.message.includes('Email address is not verified')) {
      return res.status(400).json({
        message: 'Your from email address is not verified in AWS SES. Please verify it in your AWS SES console.',
        error: error.message,
        type: 'verification_required'
      });
    }
    
    if (error.message.includes('MessageRejected')) {
      return res.status(400).json({
        message: 'Test email was rejected by AWS SES. Please check your AWS SES configuration.',
        error: error.message,
        type: 'message_rejected'
      });
    }
    
    if (error.message.includes('InvalidParameterValue')) {
      return res.status(400).json({
        message: 'Invalid email parameters. Please check your AWS SES settings.',
        error: error.message,
        type: 'invalid_parameters'
      });
    }
    
    if (error.message.includes('QuotaExceeded')) {
      return res.status(429).json({
        message: 'Email sending quota exceeded. Please try again later.',
        error: error.message,
        type: 'quota_exceeded'
      });
    }

    // For other errors, return 500
    res.status(500).json({
      message: 'Failed to send test email',
      error: error.message
    });
  }
};

/**
 * Serve unsubscribe confirmation page (public endpoint, no auth required)
 * This is the page that recipients see when they click the unsubscribe link
 */
const unsubscribePage = async (req, res) => {
  try {
    const { email, userId } = req.query;
    
    if (!email || !userId) {
      return res.status(400).send(getUnsubscribeErrorPage('The unsubscribe link is missing required parameters.'));
    }

    // Check if already unsubscribed
    const existingUnsubscribe = await Unsubscribe.findOne({ email, userId });
    
    if (existingUnsubscribe) {
      return res.send(getAlreadyUnsubscribedPage(email));
    }

    // Show unsubscribe confirmation page
    res.send(getUnsubscribeConfirmationPage(email, userId));
  } catch (error) {
    console.error('Unsubscribe page error:', error);
    res.status(500).send(getServerErrorPage());
  }
};

module.exports = {
  getEmailHistory,
  unsubscribe,
  directUnsubscribe,
  checkUnsubscribeStatus,
  sendEmail,
  sendBulkEmails,
  sendTestEmail,
  unsubscribePage
}; 