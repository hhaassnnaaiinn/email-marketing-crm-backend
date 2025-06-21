const Campaign = require('../../models/campaign.model');

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

module.exports = deleteCampaign; 