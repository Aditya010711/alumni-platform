const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const {
    createPost,
    getFeed,
    likePost,
    commentPost,
    sharePost,
    getUserPosts
} = require('../controllers/postController');
const { getRecommendedJobs } = require('../controllers/jobController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const validate = require('../middlewares/validationMiddleware');

// Post Validation rules
const postValidationRules = [
    check('content', 'Content is required').not().isEmpty(),
];

const commentValidationRules = [
    check('content', 'Comment content is required').not().isEmpty(),
];

// Route definitions
// We use upload.single('image') for creating posts with images

// IMPORTANT: Put concrete paths like /jobs/recommended BEFORE dynamic paths like /:id
router.get('/jobs/recommended', protect, getRecommendedJobs);
router.get('/profile/:profileId', protect, getUserPosts);

router.route('/')
    .post(protect, upload.single('image'), postValidationRules, validate, createPost)
    .get(protect, getFeed);

router.route('/:id/like')
    .put(protect, likePost);

router.route('/:id/comment')
    .post(protect, commentValidationRules, validate, commentPost);

router.route('/:id/share')
    .post(protect, sharePost);

module.exports = router;
