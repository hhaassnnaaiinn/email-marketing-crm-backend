const s3Service = require('../services/s3.service');

class ImageController {
    /**
     * Upload single image
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async uploadImage(req, res) {
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

    /**
     * Upload multiple images
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async uploadMultipleImages(req, res) {
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

    /**
     * Delete image
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async deleteImage(req, res) {
        try {
            const { fileName } = req.params;
            const { userId, email } = req.user; // User info from auth middleware

            if (!fileName) {
                return res.status(400).json({
                    success: false,
                    message: 'File name is required',
                });
            }

            const deleteResult = await s3Service.deleteImage(fileName);

            // Add user information to the delete result
            const resultWithUser = {
                ...deleteResult,
                deletedBy: {
                    userId: userId,
                    email: email
                },
                deletedAt: new Date().toISOString()
            };

            res.status(200).json({
                success: true,
                message: 'Image deleted successfully',
                data: resultWithUser,
            });
        } catch (error) {
            console.error('Image delete error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete image',
                error: error.message,
            });
        }
    }

    /**
     * Get upload status and info
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getUploadInfo(req, res) {
        try {
            const { userId, email } = req.user; // User info from auth middleware

            res.status(200).json({
                success: true,
                data: {
                    maxFileSize: '5MB',
                    allowedTypes: ['JPEG', 'PNG', 'GIF', 'WebP', 'SVG'],
                    bucketName: process.env.AWS_S3_BUCKET_NAME,
                    region: process.env.AWS_REGION,
                    authenticatedUser: {
                        userId: userId,
                        email: email
                    }
                },
            });
        } catch (error) {
            console.error('Upload info error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get upload information',
                error: error.message,
            });
        }
    }
}

module.exports = new ImageController(); 