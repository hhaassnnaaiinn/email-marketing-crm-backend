const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  getAllCampaigns, 
  getCampaignById, 
  createCampaign, 
  createCampaignBatch,
  updateCampaign, 
  deleteCampaign, 
  sendCampaign 
} = require('../controllers/campaign.controller');

// Get all campaigns
router.get('/', auth, getAllCampaigns);

// Get single campaign
router.get('/:id', auth, getCampaignById);

// Create campaign
router.post('/', auth, createCampaign);

// Create campaign with batch processing for large contact lists
router.post('/batch', auth, createCampaignBatch);

// Update campaign
router.put('/:id', auth, updateCampaign);

// Delete campaign
router.delete('/:id', auth, deleteCampaign);

// Send campaign
router.post('/:id/send', auth, sendCampaign);

module.exports = router; 