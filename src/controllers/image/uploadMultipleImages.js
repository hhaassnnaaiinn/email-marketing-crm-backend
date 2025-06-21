const s3Service = require('../../services/s3.service');

/**
 * Upload multiple images
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function uploadMultipleImages(req, res) {
    try {
        // Check if files exist
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No image files provided',
            });
        }

        const { userId, email } = req.user; // User info from auth middleware

        const uploadPromises = req.files.map(async (file) => {
            const { buffer, originalname, mimetype, size } = file;

            // Validate file type
            if (!s3Service.validateFileType(mimetype)) {
                throw new Error(`Invalid file type for ${originalname}. Only images are allowed.`);
            }

            // Validate file size
            if (!s3Service.validateFileSize(size)) {
                throw new Error(`File size too large for ${originalname}. Maximum size is 5MB.`);
            }

            // Upload to S3
            const uploadResult = await s3Service.uploadImage(buffer, originalname, mimetype);
            
            // Add user information to each result
            return {
                ...uploadResult,
                uploadedBy: {
                    userId: userId,
                    email: email
                },
                uploadedAt: new Date().toISOString()
            };
        });

        const uploadResults = await Promise.all(uploadPromises);

        res.status(201).json({
            success: true,
            message: `${uploadResults.length} images uploaded successfully`,
            data: uploadResults,
        });
    } catch (error) {
        console.error('Multiple image upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload images',
            error: error.message,
        });
    }
}

module.exports = uploadMultipleImages; 