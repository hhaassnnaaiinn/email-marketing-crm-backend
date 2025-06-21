/**
 * Utility functions for batch processing operations
 */

/**
 * Split an array into smaller batches
 * @param {Array} array - The array to split
 * @param {number} batchSize - Size of each batch
 * @returns {Array} Array of batches
 */
const splitIntoBatches = (array, batchSize) => {
  const batches = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
};

/**
 * Process an array in batches with a callback function
 * @param {Array} array - The array to process
 * @param {number} batchSize - Size of each batch
 * @param {Function} processBatch - Function to process each batch
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Array>} Array of results from all batches
 */
const processInBatches = async (array, batchSize, processBatch, onProgress = null) => {
  const batches = splitIntoBatches(array, batchSize);
  const results = [];
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const result = await processBatch(batch, i, batches.length);
    results.push(result);
    
    if (onProgress) {
      onProgress({
        currentBatch: i + 1,
        totalBatches: batches.length,
        processedItems: (i + 1) * batchSize,
        totalItems: array.length,
        percentage: Math.round(((i + 1) / batches.length) * 100)
      });
    }
  }
  
  return results;
};

/**
 * Validate batch size and provide defaults
 * @param {number} requestedSize - Requested batch size
 * @param {number} maxSize - Maximum allowed batch size
 * @param {number} defaultSize - Default batch size
 * @returns {number} Validated batch size
 */
const validateBatchSize = (requestedSize, maxSize = 5000, defaultSize = 1000) => {
  if (!requestedSize || requestedSize <= 0) {
    return defaultSize;
  }
  
  if (requestedSize > maxSize) {
    console.warn(`Batch size ${requestedSize} exceeds maximum ${maxSize}, using ${maxSize}`);
    return maxSize;
  }
  
  return requestedSize;
};

module.exports = {
  splitIntoBatches,
  processInBatches,
  validateBatchSize
}; 