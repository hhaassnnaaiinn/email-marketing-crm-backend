const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables FIRST
dotenv.config();

const connectDB = require('./utils/db');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const campaignRoutes = require('./routes/campaign.routes');
const contactRoutes = require('./routes/contact.routes');
const templateRoutes = require('./routes/template.routes');
const awsSettingsRoutes = require('./routes/aws-settings.routes');
const emailRoutes = require('./routes/email.routes');
const imageRoutes = require('./routes/image.routes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/aws-settings', awsSettingsRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/images', imageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server only after DB connection
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error('Failed to connect to DB:', err);
});