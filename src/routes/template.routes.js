const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  getAllTemplates, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate 
} = require('../controllers/template.controller');

// Get all templates for user
router.get('/', auth, getAllTemplates);

// Add a template
router.post('/', auth, createTemplate);

// Update a template
router.put('/:id', auth, updateTemplate);

// Delete a template
router.delete('/:id', auth, deleteTemplate);

module.exports = router; 