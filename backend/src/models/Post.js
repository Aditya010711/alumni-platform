const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile',
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: 1000,
        },
    },
    { timestamps: true }
);

const postSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile',
            required: true,
        },
        content: {
            type: String,
            required: [true, 'Post content is required'],
            maxlength: 3000,
        },
        image: {
            type: String,
            default: '',
        },
        type: {
            type: String,
            enum: ['post', 'job'],
            default: 'post',
        },
        jobDetails: {
            title: { type: String, trim: true },
            company: { type: String, trim: true },
            location: { type: String, trim: true },
            link: { type: String, trim: true },
            skills: [{ type: String, trim: true }],
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Profile',
            },
        ],
        comments: [commentSchema],
        sharedPost: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
