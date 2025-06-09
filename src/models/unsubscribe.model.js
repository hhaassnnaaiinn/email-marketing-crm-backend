const mongoose = require('mongoose');

const unsubscribeSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  unsubscribedAt: { 
    type: Date, 
    default: Date.now 
  },
  reason: { 
    type: String,
    trim: true
  }
});

// Create index for faster lookups
unsubscribeSchema.index({ email: 1, userId: 1 });

module.exports = mongoose.model('Unsubscribe', unsubscribeSchema); 