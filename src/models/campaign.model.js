const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }],
  status: { type: String, enum: ['draft', 'scheduled', 'sent'], default: 'draft' },
  scheduledAt: { type: Date },
  sentAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema); 