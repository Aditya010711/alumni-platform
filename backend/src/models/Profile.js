const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // One profile per user
        },
        profilePicture: {
            type: String,
            default: '',
        },
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
        },
        graduationYear: {
            type: Number,
            required: [true, 'Graduation year is required'],
        },
        degree: {
            type: String,
            required: [true, 'Degree is required'],
            trim: true,
        },
        currentCompany: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            trim: true,
        },
        linkedInUrl: {
            type: String,
            trim: true,
            match: [
                /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/,
                'Please enter a valid LinkedIn URL',
            ],
        },
        location: {
            type: String,
            trim: true,
        },
        bio: {
            type: String,
            maxlength: 500,
        },
        skills: [{
            type: String,
            trim: true,
        }],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
