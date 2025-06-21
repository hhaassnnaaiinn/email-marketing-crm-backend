const Template = require('../../models/template.model');

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

module.exports = updateTemplate; 