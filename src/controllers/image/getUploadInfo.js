/**
 * Get upload status and info
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getUploadInfo(req, res) {
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

module.exports = getUploadInfo; 