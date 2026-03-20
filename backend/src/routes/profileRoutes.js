const express = require('express');
const {
    getMyProfile,
    createOrUpdateProfile,
    getProfiles,
    getProfileByUserId,
    uploadProfilePicture,
} = require('../controllers/profileController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { body } = require('express-validator');
const validate = require('../middlewares/validationMiddleware');

const router = express.Router();

// Public routes
router.get('/', getProfiles);
router.get('/user/:user_id', getProfileByUserId);

// Private routes
router.get('/me', protect, getMyProfile);
router.post(
    '/',
    [
        protect,
        body('firstName', 'First name is required').not().isEmpty(),
        body('lastName', 'Last name is required').not().isEmpty(),
        body('graduationYear', 'Graduation year is required').isNumeric(),
        body('degree', 'Degree is required').not().isEmpty(),
        validate
    ],
    createOrUpdateProfile
);
router.post('/picture', protect, upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;
