const Contact = require('../../models/contact.model');

/**
 * Get multiple contacts by an array of IDs (POST)
 * Expects: { ids: [id1, id2, ...] }
 */
const getContactsByIds = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids array is required' });
    }

    // Only return contacts belonging to the authenticated user
    const contacts = await Contact.find({
      _id: { $in: ids },
      createdBy: req.user.userId
    });

    return res.json({ contacts });
  } catch (err) {
    console.error('Get contacts by IDs error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = getContactsByIds; 