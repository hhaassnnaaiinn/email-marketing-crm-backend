const multer = require('multer');

// Configure multer for memory storage (for S3 uploads)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10, // Maximum 10 files for multiple upload
    },
});

// Middleware for single image upload
const uploadSingleImage = upload.single('image');

// Middleware for multiple image upload
const uploadMultipleImages = upload.array('images', 10); // Max 10 images

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB.',
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum 10 files allowed.',
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected file field.',
            });
        }
    }

    if (error.message.includes('Invalid file type')) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }

    // Default error
    return res.status(500).json({
        success: false,
        message: 'File upload error',
        error: error.message,
    });
};

module.exports = {
    uploadSingleImage,
    uploadMultipleImages,
    handleUploadError,
}; 