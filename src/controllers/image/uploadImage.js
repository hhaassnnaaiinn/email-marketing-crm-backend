const s3Service = require('../../services/s3.service');

/**
 * Upload single image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function uploadImage(req, res) {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided',
            });
        }

        const { buffer, originalname, mimetype, size } = req.file;
        const { userId, email } = req.user; // User info from auth middleware

        // Validate file type
        if (!s3Service.validateFileType(mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP, SVG) are allowed.',
            });
        }

        // Validate file size (5MB limit)
        if (!s3Service.validateFileSize(size)) {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB.',
            });
        }

        // Upload to S3
        const uploadResult = await s3Service.uploadImage(buffer, originalname, mimetype);

        // Add user information to the result
        const resultWithUser = {
            ...uploadResult,
            uploadedBy: {
                userId: userId,
                email: email
            },
            uploadedAt: new Date().toISOString()
        };

        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            data: resultWithUser,
        });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message,
        });
    }
}

module.exports = uploadImage; 