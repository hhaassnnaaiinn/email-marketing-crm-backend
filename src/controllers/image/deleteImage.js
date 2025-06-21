const s3Service = require('../../services/s3.service');

/**
 * Delete image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteImage(req, res) {
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

module.exports = deleteImage; 