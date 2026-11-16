const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isConnected = false;

// Disable Mongoose command buffering so queries don't hang if Mongo is offline
mongoose.set('bufferCommands', false);

const DATA_DIR = path.join(__dirname, '../data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

/**
 * Loads persistent storage from disk for fallback mode
 */
const loadFileStore = () => {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        users: new Map(Object.entries(parsed.users || {})),
        decisions: new Map(Object.entries(parsed.decisions || {})),
      };
    }
  } catch (err) {
    console.warn('[Store] Could not read fallback store file:', err.message);
  }
  return { users: new Map(), decisions: new Map() };
};

/**
 * Saves fallback storage to disk
 */
const saveFileStore = (usersMap, decisionsMap) => {
  try {
    const data = {
      users: Object.fromEntries(usersMap || []),
      decisions: Object.fromEntries(decisionsMap || []),
      lastSynced: new Date().toISOString(),
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Store] Error persisting fallback store:', err.message);
  }
};

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
    console.warn('[DB] The system will operate with high-performance persistent fallback storage.');
  }
};

const getDbStatus = () => ({
  connected: isConnected && mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  host: isConnected ? mongoose.connection.host : 'persistent-file-engine',
  name: isConnected ? mongoose.connection.name : 'decision_matrix_local',
});

const isDbConnected = () => isConnected && mongoose.connection.readyState === 1;

module.exports = {
  connectDB,
  getDbStatus,
  isDbConnected,
  loadFileStore,
  saveFileStore,
};
