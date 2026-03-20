const Profile = require('../models/Profile');

// @desc    Get current user's profile
// @route   GET /api/profiles/me
// @access  Private
exports.getMyProfile = async (req, res, next) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate(
            'user',
            ['username', 'email']
        );

        if (!profile) {
            return res.status(404).json({ message: 'There is no profile for this user' });
        }

        res.status(200).json(profile);
    } catch (err) {
        next(err);
    }
};

// @desc    Create or update user profile
// @route   POST /api/profiles
// @access  Private
exports.createOrUpdateProfile = async (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            graduationYear,
            degree,
            currentCompany,
            role,
            linkedInUrl,
            location,
            bio,
            skills,
        } = req.body;

        // Build profile object
        const profileFields = {
            user: req.user.id,
            firstName,
            lastName,
            graduationYear,
            degree,
        };

        if (currentCompany) profileFields.currentCompany = currentCompany;
        if (role) profileFields.role = role;
        if (linkedInUrl) profileFields.linkedInUrl = linkedInUrl;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (skills) profileFields.skills = skills;

        // Check if profile exists
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            // Update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true, runValidators: true }
            );
            return res.status(200).json(profile);
        }

        // Create
        profile = new Profile(profileFields);
        await profile.save();
        res.status(201).json(profile);
    } catch (err) {
        next(err);
    }
};

// @desc    Get all profiles
// @route   GET /api/profiles
// @access  Public
exports.getProfiles = async (req, res, next) => {
    try {
        const { search, graduationYear, industry, page = 1, limit = 10 } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } }
            ];
        }

        if (graduationYear) {
            query.graduationYear = graduationYear;
        }

        if (industry) {
            // Using currentCompany as a proxy for industry if industry field is not strictly defined
            query.currentCompany = { $regex: industry, $options: 'i' };
        }

        const limitNum = parseInt(limit, 10);
        const pageNum = parseInt(page, 10);
        const skip = (pageNum - 1) * limitNum;

        const profiles = await Profile.find(query)
            .populate('user', ['username', 'email'])
            .skip(skip)
            .limit(limitNum);

        const total = await Profile.countDocuments(query);

        res.status(200).json({
            profiles,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            total
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get profile by user ID
// @route   GET /api/profiles/user/:user_id
// @access  Public
exports.getProfileByUserId = async (req, res, next) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate(
            'user',
            ['username', 'email']
        );

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.status(200).json(profile);
    } catch (err) {
        // If user_id is not a valid ObjectId, it will throw an error
        if (err.kind == 'ObjectId') {
            return res.status(404).json({ message: 'Profile not found' });
        }
        next(err);
    }
};

// @desc    Upload profile picture
// @route   POST /api/profiles/picture
// @access  Private
exports.uploadProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const profile = await Profile.findOne({ user: req.user.id });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found. Please create a profile first.' });
        }

        profile.profilePicture = `/uploads/${req.file.filename}`;
        await profile.save();

        res.status(200).json({
            message: 'Profile picture updated',
            profilePicture: profile.profilePicture
        });
    } catch (err) {
        next(err);
    }
};
