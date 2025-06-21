const fs = require('fs');
const csv = require('csv-parser');
const Contact = require('../../models/contact.model');

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

module.exports = uploadContacts; 