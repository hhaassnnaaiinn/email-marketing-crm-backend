const Contact = require('../../models/contact.model');
const Unsubscribe = require('../../models/unsubscribe.model');
const pickAllowed = require('./pickAllowed');

/**
 * Create a new contact
 */
const createContact = async (req, res) => {
  try {
    const data = pickAllowed(req.body);

    if (!data.company || !data.fullName || !data.email) {
      return res.status(400).json({ message: 'company, fullName and email are required' });
    }

    const contact = new Contact({ ...data, createdBy: req.user.userId });
    await contact.save();

    // Check if contact is unsubscribed
    const isUnsubscribed = await Unsubscribe.findOne({ 
      contactId: contact._id
    });

    const contactObj = contact.toObject();
    contactObj.unsubscribed = !!isUnsubscribed;

    return res.status(201).json(contactObj);
  } catch (err) {
    console.error('Create contact error:', err);
    if (err.code === 11000) { // duplicate key
      return res.status(409).json({ message: 'Email already exists' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = createContact; 