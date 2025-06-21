const Campaign = require('../../models/campaign.model');

/**
 * Get all campaigns for the authenticated user
 */
const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ createdBy: req.user.userId })
      .populate('template')
      .populate('contacts')
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = getAllCampaigns; 