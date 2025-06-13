const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image.controller');
const { uploadSingleImage, uploadMultipleImages, handleUploadError } = require('../middleware/upload.middleware');
const auth = require('../middleware/auth');

// Apply error handling middleware to all routes
router.use(handleUploadError);

/**
 * @route   POST /api/images/upload
 * @desc    Upload a single image (Authenticated users only)
 * @access  Private
 */
router.post('/upload', auth, uploadSingleImage, imageController.uploadImage);

/**
 * @route   POST /api/images/upload-multiple
 * @desc    Upload multiple images (Authenticated users only)
 * @access  Private
 */
router.post('/upload-multiple', auth, uploadMultipleImages, imageController.uploadMultipleImages);

/**
 * @route   DELETE /api/images/:fileName
 * @desc    Delete an image (Authenticated users only)
 * @access  Private
 */
router.delete('/:fileName', auth, imageController.deleteImage);

/**
 * @route   GET /api/images/info
 * @desc    Get upload information and limits (Authenticated users only)
 * @access  Private
 */
router.get('/info', auth, imageController.getUploadInfo);

module.exports = router; 