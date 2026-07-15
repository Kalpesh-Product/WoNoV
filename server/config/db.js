// const mongoose = require("mongoose");

// const connectDb = async (url) => {
//   try {
//     await mongoose.connect(url);
//   } catch (error) {
//     error;
//   }
// };

// module.exports = connectDb;

// lib/db.js — unchanged, this file is already correct
// const mongoose = require("mongoose");

// let cached = global._mongoose;
// if (!cached) cached = global._mongoose = { conn: null, promise: null };

// async function connectDB() {
//   if (cached.conn) return cached.conn;
//   if (!cached.promise) {
//     cached.promise = mongoose.connect(process.env.DB_URL, {
//       maxPoolSize: 10,
//       serverSelectionTimeoutMS: 5000,
//     });
//   }
//   cached.conn = await cached.promise;
//   return cached.conn;
// }

// module.exports = connectDB;

const mongoose = require("mongoose");

let cachedConnection = null;

const connectDb = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  cachedConnection = await mongoose.connect(process.env.DB_URL, {
    maxPoolSize: 10,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 20000,
  });

  return cachedConnection;
};

module.exports = connectDb;
