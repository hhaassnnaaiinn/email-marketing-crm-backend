const replaceMergeTags = require('./replaceMergeTags');

/**
 * Replace merge tags in email subject line
 * @param {string} subject - Email subject line
 * @param {Object} contact - Contact object from database
 * @returns {string} - Subject with merge tags replaced
 */
const replaceSubjectMergeTags = (subject, contact) => {
  return replaceMergeTags(subject, contact);
};

module.exports = replaceSubjectMergeTags; 