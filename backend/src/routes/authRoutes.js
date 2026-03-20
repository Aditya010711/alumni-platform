const express = require('express');
const { register, login, getMe, adminRegister } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const validate = require('../middlewares/validationMiddleware');

const router = express.Router();

router.post(
    '/register',
    [
        body('username', 'Username is required').not().isEmpty(),
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
        validate
    ],
    register
);

router.post(
    '/admin-register',
    [
        body('username', 'Username is required').not().isEmpty(),
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
        body('adminSecret', 'Admin Secret Code is required').not().isEmpty(),
        validate
    ],
    adminRegister
);

router.post(
    '/login',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password is required').exists(),
        validate
    ],
    login
);

router.get('/me', protect, getMe);

module.exports = router;
