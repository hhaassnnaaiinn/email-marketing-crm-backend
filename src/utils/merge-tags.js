/**
 * Merge tag replacement utility for email personalization
 * Handles replacement of merge tags with actual contact data
 */

/**
 * Replace merge tags in email content with contact data
 * @param {string} content - Email content (HTML or text)
 * @param {Object} contact - Contact object from database
 * @returns {string} - Content with merge tags replaced
 */
const replaceMergeTags = (content, contact) => {
  let emailContent = content;

  // Contact field replacements only
  const contactReplacements = {
    '{{fullName}}': contact.fullName || '',
    '{{email}}': contact.email || '',
    '{{company}}': contact.company || '',
    '{{workPhone}}': contact.workPhone || '',
    '{{mobilePhone}}': contact.mobilePhone || '',
    '{{role}}': contact.role || '',
    '{{address}}': contact.address || '',
    '{{city}}': contact.city || '',
    '{{state}}': contact.state || '',
    '{{zip}}': contact.zip || ''
  };

  // Apply contact field replacements
  Object.entries(contactReplacements).forEach(([tag, value]) => {
    const regex = new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    emailContent = emailContent.replace(regex, value);
  });

  return emailContent;
};

/**
 * Replace merge tags in email subject line
 * @param {string} subject - Email subject line
 * @param {Object} contact - Contact object from database
 * @returns {string} - Subject with merge tags replaced
 */
const replaceSubjectMergeTags = (subject, contact) => {
  return replaceMergeTags(subject, contact);
};

module.exports = {
  replaceMergeTags,
  replaceSubjectMergeTags
}; 