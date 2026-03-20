const express = require('express');
const {
    getAllUsers,
    updateUserRole,
    deleteUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply auth & admin middleware to all routes in this file
router.use(protect);
router.use(authorize('admin'));

router.route('/users')
    .get(getAllUsers);

router.route('/users/:id')
    .delete(deleteUser);

router.route('/users/:id/role')
    .put(updateUserRole);

module.exports = router;
