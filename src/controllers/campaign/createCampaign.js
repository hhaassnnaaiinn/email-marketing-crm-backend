const Campaign = require('../../models/campaign.model');
const Template = require('../../models/template.model');
const Contact = require('../../models/contact.model');

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

module.exports = createCampaign; 