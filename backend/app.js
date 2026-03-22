const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
})); // Secure HTTP headers

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Apply the rate limiting middleware to all requests.
app.use(limiter);

// Middleware
app.use(express.json()); // Body parser
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? [process.env.CLIENT_URL, 'http://localhost:5173'] : 'http://localhost:5173',
    credentials: true
})); // Enable CORS

// Serve static files (uploads)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Alumni Platform API' });
});

// We will mount routes here soon
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/profiles', require('./src/routes/profileRoutes'));
app.use('/api/posts', require('./src/routes/postRoutes'));
app.use('/api/messages', require('./src/routes/messageRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));

// Basic Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: err.message || 'Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

module.exports = app;
