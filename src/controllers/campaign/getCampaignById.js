const Campaign = require('../../models/campaign.model');

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

module.exports = getCampaignById; 