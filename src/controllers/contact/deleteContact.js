const Contact = require('../../models/contact.model');

/**
 * Delete a contact
 */
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId,
    });

    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    return res.json({ message: 'Contact deleted' });
  } catch (err) {
    console.error('Delete contact error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = deleteContact; 