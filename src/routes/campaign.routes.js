const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  getAllCampaigns, 
  getCampaignById, 
  createCampaign, 
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

// Update campaign
router.put('/:id', auth, updateCampaign);

// Delete campaign
router.delete('/:id', auth, deleteCampaign);

// Send campaign
router.post('/:id/send', auth, sendCampaign);

module.exports = router; 