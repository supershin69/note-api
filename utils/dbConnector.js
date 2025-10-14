const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

const connectDb = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Database connection successful');
  } catch(err) {
    console.log('Database connection failed');
    process.exit(1);
  }
}

module.exports = connectDb;