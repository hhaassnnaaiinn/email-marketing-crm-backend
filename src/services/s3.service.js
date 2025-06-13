const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

class S3Service {
    constructor() {
        this.bucketName = process.env.AWS_S3_BUCKET_NAME;
    }

    /**
     * Upload image to S3
     * @param {Buffer} fileBuffer - The file buffer
     * @param {string} originalName - Original filename
     * @param {string} mimeType - File MIME type
     * @returns {Promise<Object>} Upload result with URL
     */
    async uploadImage(fileBuffer, originalName, mimeType) {
        try {
            // Generate unique filename
            const fileExtension = originalName.split('.').pop();
            const fileName = `images/${uuidv4()}.${fileExtension}`;

            // Prepare upload parameters (removed ACL for compatibility)
            const uploadParams = {
                Bucket: this.bucketName,
                Key: fileName,
                Body: fileBuffer,
                ContentType: mimeType,
                Metadata: {
                    'original-name': originalName,
                    'uploaded-at': new Date().toISOString(),
                },
            };

            // Upload to S3
            const command = new PutObjectCommand(uploadParams);
            await s3Client.send(command);

            // Generate public URL
            const publicUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

            return {
                success: true,
                url: publicUrl,
                fileName: fileName,
                originalName: originalName,
                size: fileBuffer.length,
            };
        } catch (error) {
            console.error('S3 upload error:', error);
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    }

    /**
     * Delete image from S3
     * @param {string} fileName - The S3 file name/key
     * @returns {Promise<Object>} Delete result
     */
    async deleteImage(fileName) {
        try {
            const deleteParams = {
                Bucket: this.bucketName,
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

    /**
     * Validate file type
     * @param {string} mimeType - File MIME type
     * @returns {boolean} Whether file type is allowed
     */
    validateFileType(mimeType) {
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
        ];
        return allowedTypes.includes(mimeType);
    }

    /**
     * Validate file size
     * @param {number} size - File size in bytes
     * @param {number} maxSize - Maximum size in bytes (default: 5MB)
     * @returns {boolean} Whether file size is allowed
     */
    validateFileSize(size, maxSize = 5 * 1024 * 1024) {
        return size <= maxSize;
    }
}

module.exports = new S3Service(); 