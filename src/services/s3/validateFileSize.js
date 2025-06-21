/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @param {number} maxSize - Maximum size in bytes (default: 5MB)
 * @returns {boolean} Whether file size is allowed
 */
function validateFileSize(size, maxSize = 5 * 1024 * 1024) {
    return size <= maxSize;
}

module.exports = validateFileSize; 