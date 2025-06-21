const Contact = require('../../models/contact.model');
const Unsubscribe = require('../../models/unsubscribe.model');
const pickAllowed = require('./pickAllowed');

/**
 * Update a contact
 */
const updateContact = async (req, res) => {
  try {
    const updates = pickAllowed(req.body);
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.userId },
      { $set: updates },
      { new: true },
    );

    if (!contact) return res.status(404).json({ message: 'Contact not found' });

    // Handle unsubscribe status if provided in request body
    if (req.body.unsubscribed === false) {
      // Remove from unsubscribe list if unsubscribed is set to false
      await Unsubscribe.findOneAndDelete({ 
        contactId: contact._id
      });
    }

    // Check if contact is unsubscribed (after potential removal)
    const isUnsubscribed = await Unsubscribe.findOne({ 
      contactId: contact._id
    });

    const contactObj = contact.toObject();
    contactObj.unsubscribed = !!isUnsubscribed;

    return res.json(contactObj);
  } catch (err) {
    console.error('Update contact error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = updateContact; 