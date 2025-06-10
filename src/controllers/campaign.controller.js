const Campaign = require('../models/campaign.model');
const Template = require('../models/template.model');
const Contact = require('../models/contact.model');
const AwsSettings = require('../models/aws-settings.model');
const Unsubscribe = require('../models/unsubscribe.model');
const EmailService = require('../services/email.service');
const { logEmail } = require('../utils/email-logger');

/**
 * Get all campaigns for the authenticated user
 */
const getAllCampaigns = async (req, res) => {
  try {
    console.log('Fetching campaigns for user:', req.user.userId);
    const campaigns = await Campaign.find({ createdBy: req.user.userId })
      .populate('template')
      .populate('contacts')
      .sort({ createdAt: -1 });
    console.log('Found campaigns:', campaigns.length);
    res.json(campaigns);
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * Get a single campaign by ID
 */
const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, createdBy: req.user.userId })
      .populate('template')
      .populate('contacts');
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (err) {
    console.error('Error fetching campaign:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * Create a new campaign
 */
const createCampaign = async (req, res) => {
  try {
    const { name, subject, templateId, contacts, scheduledAt, status = 'draft' } = req.body;

    // Validate template
    const template = await Template.findOne({ _id: templateId, createdBy: req.user.userId });
    if (!template) {
      return res.status(400).json({ message: 'Template not found' });
    }

    // Validate contacts
    const validContacts = await Contact.find({
      _id: { $in: contacts },
      createdBy: req.user.userId
    });

    if (validContacts.length !== contacts.length) {
      return res.status(400).json({ message: 'One or more contacts not found' });
    }

    const campaign = await Campaign.create({
      name,
      subject: subject || template.subject,
      template: templateId,
      contacts,
      scheduledAt,
      status,
      createdBy: req.user.userId
    });

    const populatedCampaign = await Campaign.findById(campaign._id)
      .populate('template')
      .populate('contacts');

    res.status(201).json(populatedCampaign);
  } catch (err) {
    console.error('Campaign creation error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * Update a campaign
 */
const updateCampaign = async (req, res) => {
  try {
    const { name, subject, templateId, contactIds, scheduledAt, status } = req.body;

    const campaign = await Campaign.findOne({ _id: req.params.id, createdBy: req.user.userId });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Validate template if provided
    if (templateId) {
      const template = await Template.findOne({ _id: templateId, createdBy: req.user.userId });
      if (!template) {
        return res.status(400).json({ message: 'Template not found' });
      }
      campaign.template = templateId;
    }

    // Validate contacts if provided
    if (contactIds) {
      const contacts = await Contact.find({
        _id: { $in: contactIds },
        createdBy: req.user.userId
      });

      if (contacts.length !== contactIds.length) {
        return res.status(400).json({ message: 'One or more contacts not found' });
      }
      campaign.contacts = contactIds;
    }

    // Update other fields
    if (name) campaign.name = name;
    if (subject) campaign.subject = subject;
    if (scheduledAt) campaign.scheduledAt = scheduledAt;
    if (status) campaign.status = status;

    await campaign.save();

    const updatedCampaign = await Campaign.findById(campaign._id)
      .populate('template')
      .populate('contacts');

    res.json(updatedCampaign);
  } catch (err) {
    console.error('Update campaign error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * Delete a campaign
 */
const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, createdBy: req.user.userId });
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.json({ message: 'Campaign deleted successfully' });
  } catch (err) {
    console.error('Delete campaign error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

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

module.exports = {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  sendCampaign
}; 