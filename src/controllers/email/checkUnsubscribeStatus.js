const Unsubscribe = require('../../models/unsubscribe.model');

/**
 * Check unsubscribe status (public endpoint, no auth required)
 */
const checkUnsubscribeStatus = async (req, res) => {
  try {
    const { email, contactId, userId } = req.query;
    
    if (!email) {
      return res.status(400).json({
        message: 'Email is required'
      });
    }

    let unsubscribe = null;

    // Support both new format (contactId) and old format (userId) for backward compatibility
    if (contactId) {
      // New format: check by contactId
      unsubscribe = await Unsubscribe.findOne({ email, contactId });
    } else if (userId) {
      // Old format: check by userId (for backward compatibility)
      unsubscribe = await Unsubscribe.findOne({ email, userId });
    } else {
      return res.status(400).json({
        message: 'Contact ID or User ID is required'
      });
    }
    
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

module.exports = checkUnsubscribeStatus; 