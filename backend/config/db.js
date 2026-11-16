const mongoose = require('mongoose');

let isConnected = false;

// Disable Mongoose command buffering so queries don't hang if Mongo is offline
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/decision_matrix';
  try {
    console.log(`[DB] Attempting connection to MongoDB at: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    
    isConnected = true;
    console.log('[DB] MongoDB connected successfully.');
  } catch (err) {
    isConnected = false;
    console.warn(`[DB] Notice: Could not connect to MongoDB (${err.message}).`);
    console.warn('[DB] The system will operate with high-performance persistent fallback memory store.');
  }
};

const getDbStatus = () => ({
  connected: isConnected && mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  host: isConnected ? mongoose.connection.host : 'in-memory-engine',
  name: isConnected ? mongoose.connection.name : 'decision_matrix_local',
});

const isDbConnected = () => isConnected && mongoose.connection.readyState === 1;

module.exports = {
  connectDB,
  getDbStatus,
  isDbConnected,
};
