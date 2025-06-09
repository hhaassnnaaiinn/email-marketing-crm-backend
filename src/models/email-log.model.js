const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    required: true
  },
  messageId: {
    type: String,
    required: true
  },
  error: {
    type: String
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['single', 'bulk', 'test'],
    required: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  }
});

// Index for faster queries
emailLogSchema.index({ user: 1, sentAt: -1 });
emailLogSchema.index({ to: 1 });
emailLogSchema.index({ status: 1 });

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

module.exports = EmailLog; 