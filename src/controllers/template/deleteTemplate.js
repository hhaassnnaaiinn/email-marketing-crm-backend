const Template = require('../../models/template.model');

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

module.exports = deleteTemplate; 