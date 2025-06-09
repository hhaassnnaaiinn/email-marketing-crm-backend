const Template = require('../models/template.model');

/**
 * Get all templates for the authenticated user
 */
const getAllTemplates = async (req, res) => {
  try {
    const templates = await Template.find({ createdBy: req.user.userId });
    res.json(templates);
  } catch (err) {
    console.error('Get all templates error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new template
 */
const createTemplate = async (req, res) => {
  try {
    const { name, subject, body } = req.body;
    
    if (!name || !subject || !body) {
      return res.status(400).json({ message: 'name, subject, and body are required' });
    }

    const template = new Template({ 
      name, 
      subject, 
      body, 
      createdBy: req.user.userId 
    });
    await template.save();
    res.status(201).json(template);
  } catch (err) {
    console.error('Create template error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update a template
 */
const updateTemplate = async (req, res) => {
  try {
    const { name, subject, body } = req.body;
    
    const template = await Template.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.userId },
      { name, subject, body },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json(template);
  } catch (err) {
    console.error('Update template error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a template
 */
const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({ 
      _id: req.params.id, 
      createdBy: req.user.userId 
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({ message: 'Template deleted' });
  } catch (err) {
    console.error('Delete template error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate
}; 