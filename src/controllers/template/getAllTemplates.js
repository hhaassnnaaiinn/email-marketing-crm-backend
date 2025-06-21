const Template = require('../../models/template.model');

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

module.exports = getAllTemplates; 