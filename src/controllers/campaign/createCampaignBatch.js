const Campaign = require('../../models/campaign.model');
const Template = require('../../models/template.model');
const Contact = require('../../models/contact.model');
const { processInBatches, validateBatchSize } = require('../../utils/batch-processor');

/**
 * Create a new campaign with batch processing for large contact lists
 */
const createCampaignBatch = async (req, res) => {
  try {
    const { 
      name, 
      subject, 
      templateId, 
      contacts, 
      scheduledAt, 
      status = 'draft',
      batchSize = 1000
    } = req.body;

    // Validate template
    const template = await Template.findOne({ _id: templateId, createdBy: req.user.userId });
    if (!template) {
      return res.status(400).json({ message: 'Template not found' });
    }

    // Validate that contacts array is provided
    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ message: 'Contacts array is required and must not be empty' });
    }

    // Validate and set batch size
    const validatedBatchSize = validateBatchSize(batchSize, 5000, 1000);

    // Create the campaign first with empty contacts array
    const campaign = await Campaign.create({
      name,
      subject: subject || template.subject,
      template: templateId,
      contacts: [], // Start with empty array
      scheduledAt,
      status,
      createdBy: req.user.userId
    });

    let totalValidContacts = 0;
    let totalProcessed = 0;

    // Process contacts in batches using the utility function
    const batchResults = await processInBatches(
      contacts,
      validatedBatchSize,
      async (batch, batchIndex, totalBatches) => {
        // Validate contacts in this batch
        const validContacts = await Contact.find({
          _id: { $in: batch },
          createdBy: req.user.userId
        });

        // Update campaign with valid contacts from this batch
        if (validContacts.length > 0) {
          await Campaign.findByIdAndUpdate(
            campaign._id,
            { 
              $push: { contacts: { $each: validContacts.map(contact => contact._id) } }
            }
          );
        }

        totalValidContacts += validContacts.length;
        totalProcessed += batch.length;

        return {
          batchIndex,
          batchSize: batch.length,
          validContacts: validContacts.length,
          invalidContacts: batch.length - validContacts.length
        };
      },
      (progress) => {
        // Log progress (optional - for debugging)
        console.log(`Campaign ${campaign._id}: Processed ${progress.currentBatch}/${progress.totalBatches} batches (${progress.percentage}%)`);
      }
    );

    // Get the final populated campaign
    const populatedCampaign = await Campaign.findById(campaign._id)
      .populate('template')
      .populate('contacts');

    res.status(201).json({
      ...populatedCampaign.toObject(),
      batchInfo: {
        totalContacts: contacts.length,
        validContacts: totalValidContacts,
        invalidContacts: contacts.length - totalValidContacts,
        batchesProcessed: batchResults.length,
        batchSize: validatedBatchSize,
        batchResults
      }
    });

  } catch (err) {
    console.error('Batch campaign creation error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = createCampaignBatch; 