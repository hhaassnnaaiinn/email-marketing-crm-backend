const Unsubscribe = require('../../models/unsubscribe.model');
const getUnsubscribeErrorPage = require('../../utils/html-templates/getUnsubscribeErrorPage');
const getUnsubscribeConfirmationPage = require('../../utils/html-templates/getUnsubscribeConfirmationPage');
const getAlreadyUnsubscribedPage = require('../../utils/html-templates/getAlreadyUnsubscribedPage');
const getServerErrorPage = require('../../utils/html-templates/getServerErrorPage');

/**
 * Serve unsubscribe confirmation page (public endpoint, no auth required)
 * This is the page that recipients see when they click the unsubscribe link
 */
const unsubscribePage = async (req, res) => {
  try {
    const { email, contactId, userId } = req.query;
    
    if (!email) {
      return res.status(400).send(getUnsubscribeErrorPage('The unsubscribe link is missing the email parameter.'));
    }

    let unsubscribeRecord = null;

    // Support both new format (contactId) and old format (userId) for backward compatibility
    if (contactId) {
      // New format: check by contactId
      unsubscribeRecord = await Unsubscribe.findOne({ email, contactId });
    } else if (userId) {
      // Old format: check by userId (for backward compatibility)
      unsubscribeRecord = await Unsubscribe.findOne({ email, userId });
    } else {
      return res.status(400).send(getUnsubscribeErrorPage('The unsubscribe link is missing required parameters.'));
    }
    
    if (unsubscribeRecord) {
      return res.send(getAlreadyUnsubscribedPage(email));
    }

    // Show unsubscribe confirmation page
    res.send(getUnsubscribeConfirmationPage(email, contactId || userId));
  } catch (error) {
    console.error('Unsubscribe page error:', error);
    res.status(500).send(getServerErrorPage());
  }
};

module.exports = unsubscribePage; 