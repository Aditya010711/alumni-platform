const User = require('../models/User');
const Profile = require('../models/Profile');
const Post = require('../models/Post');
const Message = require('../models/Message');

// @desc    Get all users with their profile data
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        const profiles = await Profile.find();
        
        // Map profiles to users
        const userData = users.map(user => {
            const profile = profiles.find(p => p.user.toString() === user._id.toString());
            return {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                profile: profile ? {
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    profilePicture: profile.profilePicture,
                    currentCompany: profile.currentCompany,
                    role: profile.role
                } : null,
            };
        });

        res.status(200).json(userData);
    } catch (err) {
        next(err);
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        if (!['alumni', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role provided' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent self-demotion
        if (user._id.toString() === req.user.id && role === 'alumni') {
            return res.status(400).json({ message: 'You cannot demote yourself. Another admin must do it.' });
        }

        user.role = role;
        await user.save();

        res.status(200).json({ message: `User role successfully updated to ${role}`, user });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent self-deletion
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own admin account.' });
        }

        // Cascade delete all associated data
        await Profile.findOneAndDelete({ user: userId });
        await Post.deleteMany({ user: userId });
        await Message.deleteMany({ sender: userId });
        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: 'User and associated data permanently deleted.' });
    } catch (err) {
        next(err);
    }
};
