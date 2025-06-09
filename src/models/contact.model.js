const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  company: { type: String, required: true },
  fullName: { type: String, required: true },
  workPhone: { type: String },
  mobilePhone: { type: String },
  role: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zip: { type: String },
  email: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', contactSchema);
