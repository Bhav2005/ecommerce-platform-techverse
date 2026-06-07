const mongoose = require('mongoose');

let useMock = false;

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.log('No MONGODB_URI found in env variables. Running with JSON Mock Database.');
    useMock = true;
    return false;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 4000
    });
    console.log('MongoDB Connected Successfully.');
    useMock = false;
    return true;
  } catch (err) {
    console.error('MongoDB Connection Failed. Falling back to JSON Mock Database.');
    console.error('Error Details:', err.message);
    useMock = true;
    return false;
  }
}

const getUseMock = () => useMock;

module.exports = { connectDB, getUseMock };
