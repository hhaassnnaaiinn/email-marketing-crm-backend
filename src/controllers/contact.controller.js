const fs = require('fs');
const csv = require('csv-parser');
const Contact = require('../models/contact.model');

// Allowed fields for contact updates
const ALLOWED_FIELDS = [
  'company',
  'fullName',
  'workPhone',
  'mobilePhone',
  'role',
  'address',
  'city',
  'state',
  'zip',
  'email',
];

/**
 * Helper function to pick allowed fields from request body
 */
const pickAllowed = (body) =>
  ALLOWED_FIELDS.reduce((acc, field) => {
    if (body[field] !== undefined) acc[field] = body[field];
    return acc;
  }, {});

/**
 * Get all contacts for the authenticated user
 */
const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact
      .find({ createdBy: req.user.userId })
      .sort({ createdAt: -1 });

    return res.json(contacts);
  } catch (err) {
    console.error('Get all contacts error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

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
    return res.status(201).json(contact);
  } catch (err) {
    console.error('Create contact error:', err);
    if (err.code === 11000) { // duplicate key
      return res.status(409).json({ message: 'Email already exists' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

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
    return res.json(contact);
  } catch (err) {
    console.error('Update contact error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

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

/**
 * Upload CSV file and bulk-import contacts
 */
const uploadContacts = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const contacts = [];

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', row => {
          // Map CSV columns to model fields - handle both template format and variations
          contacts.push({
            company: row.company || row.Company?.trim(),
            fullName: row.fullName || row.FullName?.trim(),
            workPhone: row.workPhone || row.WorkPhone?.trim(),
            mobilePhone: row.mobilePhone || row.MobilePhone?.trim(),
            role: row.role || row.Role?.trim(),
            address: row.address || row.Address?.trim(),
            city: row.city || row.City?.trim(),
            state: row.state || row.State?.trim(),
            zip: row.zip || row.Zip?.trim(),
            email: row.email || row.Email?.trim(),
            createdBy: req.user.userId,
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Keep only rows with the minimal required fields
    const filtered = contacts.filter(c => c.company && c.fullName && c.email);

    // Bulk insert – ordered:false lets MongoDB continue after dup-key errors
    const result = await Contact.insertMany(filtered, { ordered: false });

    return res.status(200).json({
      message: `Successfully imported ${result.length} contacts`,
      imported: result.length,
      total: contacts.length,
      skipped: contacts.length - filtered.length
    });
  } catch (err) {
    console.error('CSV upload error:', err);
    // Handle duplicate e-mail collisions gracefully
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'Some emails already exist; others were imported',
      });
    }
    return res.status(500).json({ message: 'Error processing CSV' });
  } finally {
    // Clean up the temp file even if an error occurred
    try { 
      fs.unlinkSync(req.file.path); 
    } catch (_) {
      /* ignore */ 
    }
  }
};

module.exports = {
  getAllContacts,
  createContact,
  updateContact,
  deleteContact,
  uploadContacts
}; 