const Campaign = require('../../models/campaign.model');
const Template = require('../../models/template.model');
const Contact = require('../../models/contact.model');

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

module.exports = updateCampaign; 