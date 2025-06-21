const ALLOWED_FIELDS = [
  'company',
  'fullName',
  'workPhone',
  'mobilePhone',
  'role',
  'address',
  'city',
  'state',
  'zip',
  'email',
];

/**
 * Helper function to pick allowed fields from request body
 */
const pickAllowed = (body) =>
  ALLOWED_FIELDS.reduce((acc, field) => {
    if (body[field] !== undefined) acc[field] = body[field];
    return acc;
  }, {});

module.exports = pickAllowed; 