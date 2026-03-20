const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI || process.env.MONGO_URI === 'mongodb://localhost:27017/alumni_platform') {
      console.warn('⚠️ WARNING: using default or missing MONGO_URI.');
      console.warn('⚠️ Please configure your database in backend/.env');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/alumni_platform');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
