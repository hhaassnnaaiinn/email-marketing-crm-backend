const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('./s3Client');

const bucketName = process.env.AWS_S3_BUCKET_NAME;

/**
 * Delete image from S3
 * @param {string} fileName - The S3 file name/key
 * @returns {Promise<Object>} Delete result
 */
async function deleteImage(fileName) {
    try {
        const deleteParams = {
            Bucket: bucketName,
            Key: fileName,
        };

        const command = new DeleteObjectCommand(deleteParams);
        await s3Client.send(command);

        return {
            success: true,
            message: 'Image deleted successfully',
        };
    } catch (error) {
        console.error('S3 delete error:', error);
        throw new Error(`Failed to delete image: ${error.message}`);
    }
}

module.exports = deleteImage; 