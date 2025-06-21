module.exports = {
  logEmail: require('./logEmail'),
  getEmailHistory: require('./getEmailHistory'),
  unsubscribe: require('./unsubscribe'),
  directUnsubscribe: require('./directUnsubscribe'),
  checkUnsubscribeStatus: require('./checkUnsubscribeStatus'),
  sendEmail: require('./sendEmail'),
  sendBulkEmails: require('./sendBulkEmails'),
  sendTestEmail: require('./sendTestEmail'),
  unsubscribePage: require('./unsubscribePage'),
  // Add other handlers here as you modularize them
}; 