const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const { 
  getAllContacts, 
  createContact, 
  updateContact, 
  deleteContact, 
  uploadContacts 
} = require('../controllers/contact.controller');

// Multer setup for CSV uploads
const upload = multer({ dest: 'uploads/' });

// Get all contacts for the authenticated user
router.get('/', auth, getAllContacts);

// Create a single new contact
router.post('/', auth, createContact);

// Update one contact
router.put('/:id', auth, updateContact);

// Remove a contact
router.delete('/:id', auth, deleteContact);

// Upload CSV file and bulk-import contacts
router.post('/upload', auth, upload.single('file'), uploadContacts);

module.exports = router;
