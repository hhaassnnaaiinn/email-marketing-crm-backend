const Template = require('../../models/template.model');

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

module.exports = createTemplate; 