const Unsubscribe = require('../../models/unsubscribe.model');
const { getUnsubscribeErrorPage, getUnsubscribeSuccessPage, getServerErrorPage } = require('../../utils/html-templates');

/**
 * Direct unsubscribe for email recipients (public endpoint, no auth required)
 * This is the link that goes in email footers
 */
const directUnsubscribe = async (req, res) => {
  try {
    const { email, contactId, userId, reason } = req.body;
    
    if (!email) {
      return res.status(400).send(getUnsubscribeErrorPage('Email is required.'));
    }

    let unsubscribeData = {
      email,
      reason: reason || 'Direct unsubscribe from email',
      unsubscribedAt: new Date()
    };

    // Support both new format (contactId) and old format (userId) for backward compatibility
    if (contactId) {
      // New format: use contactId
      unsubscribeData.contactId = contactId;
      unsubscribeData.userId = req.user?.userId; // Optional, for admin tracking
      
      await Unsubscribe.findOneAndUpdate(
        { email, contactId },
        unsubscribeData,
        { upsert: true, new: true }
      );
    } else if (userId) {
      // Old format: use userId (for backward compatibility)
      unsubscribeData.userId = userId;
      
      await Unsubscribe.findOneAndUpdate(
        { email, userId },
        unsubscribeData,
        { upsert: true, new: true }
      );
    } else {
      return res.status(400).send(getUnsubscribeErrorPage('Contact ID or User ID is required.'));
    }

    // Return HTML success page
    res.send(getUnsubscribeSuccessPage(email));
  } catch (error) {
    console.error('Direct unsubscribe failed:', error);
    res.status(500).send(getServerErrorPage());
  }
};

module.exports = directUnsubscribe; 