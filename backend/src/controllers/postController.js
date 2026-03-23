const Post = require('../models/Post');
const Profile = require('../models/Profile');

// @desc    Create a post or job offer
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
    try {
        const { content, type } = req.body;
        let jobDetails = req.body.jobDetails;

        let profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found. Create a profile to post.' });
        }

        const newPost = new Post({
            author: profile._id,
            content,
            type: type || 'post',
        });

        if (type === 'job') {
            if (typeof jobDetails === 'string') {
                try { jobDetails = JSON.parse(jobDetails); } catch (e) { }
            }
            if (jobDetails) {
                if (typeof jobDetails.skills === 'string') {
                    jobDetails.skills = jobDetails.skills.split(',').map(s => s.trim()).filter(s => s);
                }
                newPost.jobDetails = jobDetails;
            } else if (req.body['jobDetails[title]']) {
                newPost.jobDetails = {
                    title: req.body['jobDetails[title]'],
                    company: req.body['jobDetails[company]'],
                    location: req.body['jobDetails[location]'],
                    link: req.body['jobDetails[link]']
                };
                if (req.body['jobDetails[skills]']) {
                    newPost.jobDetails.skills = req.body['jobDetails[skills]'].split(',').map(s => s.trim()).filter(s => s);
                }
            }
        }

        // Handle image upload if implemented via multer on this route
        if (req.file) {
            newPost.image = `/uploads/${req.file.filename}`;
        }

        const post = await newPost.save();

        // Populate author to return immediately
        await post.populate('author', 'user firstName lastName profilePicture degree currentCompany role');

        res.status(201).json(post);
    } catch (err) {
        next(err);
    }
};

// @desc    Get all posts (Feed)
// @route   GET /api/posts
// @access  Private
exports.getFeed = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const limitNum = parseInt(limit, 10);
        const pageNum = parseInt(page, 10);
        const skip = (pageNum - 1) * limitNum;

        const posts = await Post.find()
            .sort({ createdAt: -1 }) // Newest first
            .skip(skip)
            .limit(limitNum)
            .populate('author', 'user firstName lastName profilePicture degree currentCompany role')
            .populate('comments.author', 'firstName lastName profilePicture')
            .populate({
                path: 'sharedPost',
                populate: {
                    path: 'author',
                    select: ['firstName', 'lastName', 'profilePicture', 'degree', 'currentCompany', 'role']
                }
            });

        const total = await Post.countDocuments();

        res.status(200).json({
            posts,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            total
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get posts by a specific profile
// @route   GET /api/posts/profile/:profileId
// @access  Private
exports.getUserPosts = async (req, res, next) => {
    try {
        const posts = await Post.find({ author: req.params.profileId })
            .sort({ createdAt: -1 })
            .populate('author', 'user firstName lastName profilePicture degree currentCompany role')
            .populate('comments.author', 'firstName lastName profilePicture')
            .populate({
                path: 'sharedPost',
                populate: {
                    path: 'author',
                    select: ['firstName', 'lastName', 'profilePicture', 'degree', 'currentCompany', 'role']
                }
            });

        res.status(200).json(posts);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Profile not found' });
        }
        next(err);
    }
};

// @desc    Like or Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Check if the post has already been liked by this profile
        const isLiked = post.likes.includes(profile._id);

        if (isLiked) {
            // Unlike
            post.likes = post.likes.filter(likeId => likeId.toString() !== profile._id.toString());
        } else {
            // Like
            post.likes.push(profile._id);
        }

        await post.save();

        res.status(200).json(post.likes);
    } catch (err) {
        next(err);
    }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comment
// @access  Private
exports.commentPost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const newComment = {
            author: profile._id,
            content: req.body.content
        };

        post.comments.push(newComment);
        await post.save();

        // Populate comments author before returning
        await post.populate('comments.author', 'firstName lastName profilePicture');

        res.status(201).json(post.comments);
    } catch (err) {
        next(err);
    }
};

// @desc    Share a post
// @route   POST /api/posts/:id/share
// @access  Private
exports.sharePost = async (req, res, next) => {
    try {
        const postToShare = await Post.findById(req.params.id);
        if (!postToShare) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // We can allow adding extra content to the share
        const newSharePost = new Post({
            author: profile._id,
            content: req.body?.content || 'Shared a post',
            type: 'post',
            sharedPost: postToShare._id
        });

        const savedPost = await newSharePost.save();

        await savedPost.populate('author', ['firstName', 'lastName', 'profilePicture', 'degree', 'currentCompany', 'role']);
        await savedPost.populate({
            path: 'sharedPost',
            populate: {
                path: 'author',
                select: ['firstName', 'lastName', 'profilePicture', 'degree', 'currentCompany', 'role']
            }
        });

        res.status(201).json(savedPost);
    } catch (err) {
        next(err);
    }
};
