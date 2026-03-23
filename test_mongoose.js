const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('./backend/src/models/Post');
const Profile = require('./backend/src/models/Profile');
dotenv.config({path: './backend/.env'});

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const posts = await Post.find().limit(1).populate('author', ['user', 'firstName', 'lastName']);
        console.log("SUCCESS:", posts[0]?.author);
    } catch (err) {
        console.error("ERROR:", err.message);
    }
    process.exit(0);
});
