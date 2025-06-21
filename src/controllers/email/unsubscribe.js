const Unsubscribe = require('../../models/unsubscribe.model');

/**
 * Unsubscribe from emails (public endpoint, no auth required)
 */
const unsubscribe = async (req, res) => {
  try {
    const { email, contactId, reason } = req.body;
    
    if (!email || !contactId) {
      return res.status(400).json({
        message: 'Email and contactId are required'
      });
    }

    // Add to unsubscribe list
    await Unsubscribe.findOneAndUpdate(
      { email, contactId },
      { 
        email,
        contactId,
        userId: req.user?.userId, // Optional, for admin tracking
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

module.exports = unsubscribe; 