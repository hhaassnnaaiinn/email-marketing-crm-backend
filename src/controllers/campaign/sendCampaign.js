const Campaign = require('../../models/campaign.model');
const AwsSettings = require('../../models/aws-settings.model');
const Unsubscribe = require('../../models/unsubscribe.model');
const EmailService = require('../../services/email.service');
const { logEmail } = require('../../utils/email-logger');

/**
 * Send a campaign
 */
const sendCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('template')
      .populate('contacts');

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status === 'sent') {
      return res.status(400).json({ message: 'Campaign has already been sent' });
    }

    // Get AWS settings
    const awsSettings = await AwsSettings.findOne({ userId: req.user.userId });
    if (!awsSettings || !awsSettings.isVerified) {
      return res.status(400).json({ message: 'AWS settings not configured or not verified' });
    }

    // Get unsubscribed contact IDs
    const contactIds = campaign.contacts.map(contact => contact._id);
    const unsubscribed = await Unsubscribe.find({ 
      contactId: { $in: contactIds }
    }).select('contactId').lean();
    const unsubscribedContactIds = new Set(unsubscribed.map(u => u.contactId.toString()));

    // Filter out unsubscribed contacts
    const validContacts = campaign.contacts.filter(contact => !unsubscribedContactIds.has(contact._id.toString()));
    
    if (validContacts.length === 0) {
      return res.status(400).json({ message: 'No valid recipients found' });
    }

    const results = {
      successful: [],
      failed: [],
      unsubscribed: campaign.contacts.length - validContacts.length
    };

    // Send emails in batches
    const batchSize = 10;
    for (let i = 0; i < validContacts.length; i += batchSize) {
      const batch = validContacts.slice(i, i + batchSize);
      const batchPromises = batch.map(async (contact) => {
        try {
          // Add personalized unsubscribe link for each contact
          const unsubscribeLink = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/email/unsubscribe?email=${encodeURIComponent(contact.email)}&contactId=${contact._id}`;
          const htmlWithUnsubscribe = campaign.template.body + `
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
            to: contact.email,
            subject: campaign.subject,
            html: htmlWithUnsubscribe,
            awsSettings,
          });

          // Log successful email
          await logEmail({
            user: req.user.userId,
            to: contact.email,
            subject: campaign.subject,
            status: 'sent',
            messageId: result.messageId,
            type: 'bulk',
            campaignId: campaign._id
          });

          results.successful.push({
            to: contact.email,
            messageId: result.messageId
          });
        } catch (error) {
          // Log failed email
          await logEmail({
            user: req.user.userId,
            to: contact.email,
            subject: campaign.subject,
            status: 'failed',
            messageId: 'N/A',
            error: error.message,
            type: 'bulk',
            campaignId: campaign._id
          });

          results.failed.push({
            to: contact.email,
            error: error.message
          });
        }
      });

      await Promise.all(batchPromises);
    }

    // Update campaign status
    campaign.status = 'sent';
    campaign.sentAt = new Date();
    await campaign.save();

    res.json({
      message: `Campaign sent successfully. ${results.unsubscribed} recipients were unsubscribed and filtered out.`,
      results
    });
  } catch (error) {
    console.error('Campaign sending failed:', error);
    res.status(500).json({
      message: 'Failed to send campaign',
      error: error.message
    });
  }
};

module.exports = sendCampaign; 