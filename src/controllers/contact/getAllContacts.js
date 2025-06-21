const Contact = require('../../models/contact.model');
const Unsubscribe = require('../../models/unsubscribe.model');

/**
 * Get all contacts for the authenticated user (with pagination and search)
 */
const getAllContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build base query
    const query = { createdBy: req.user.userId };

    // Add search by fullName or email if provided
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i'); // case-insensitive
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex }
      ];
    }

    // Get total count
    const total = await Contact.countDocuments(query);

    // Get paginated contacts
    const contacts = await Contact
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get unsubscribed contact IDs for this user's contacts
    const contactIds = contacts.map(contact => contact._id);
    const unsubscribedContacts = await Unsubscribe.find({ 
      contactId: { $in: contactIds }
    }).select('contactId').lean();
    const unsubscribedContactIds = new Set(unsubscribedContacts.map(u => u.contactId.toString()));

    // Add unsubscribed status to each contact
    const contactsWithStatus = contacts.map(contact => {
      const contactObj = contact.toObject();
      contactObj.unsubscribed = unsubscribedContactIds.has(contact._id.toString());
      return contactObj;
    });

    const response = {
      contacts: contactsWithStatus,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };

    return res.json(response);
  } catch (err) {
    console.error('Get all contacts error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = getAllContacts; 