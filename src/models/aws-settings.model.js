const mongoose = require('mongoose');

const awsSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  accessKeyId: {
    type: String,
    required: true,
  },
  secretAccessKey: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
    default: 'us-east-2',
  },
  fromEmail: {
    type: String,
    required: true,
  },
  fromName: {
    type: String,
    required: false,
    default: '',
  },
  replyToEmail: {
    type: String,
    required: false,
    default: '',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
awsSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const AwsSettings = mongoose.model('AwsSettings', awsSettingsSchema);

module.exports = AwsSettings; 