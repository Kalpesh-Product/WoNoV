const mongoose = require("mongoose");

// Reuse one MongoDB connection per warm serverless instance to avoid TLS connection storms.
const cached = global._mongooseConnection || {
  connection: null,
  promise: null,
};

global._mongooseConnection = cached;

const connectDb = async (url) => {
  if (!url) {
    throw new Error("DB_URL is not configured");
  }

  if (mongoose.connection.readyState === 1) {
    cached.connection = mongoose;
    return mongoose;
  }

  if (mongoose.connection.readyState === 0 && cached.connection) {
    cached.connection = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(url, {
      maxPoolSize: 10,
      minPoolSize: 0,
      maxIdleTimeMS: 60000,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });
  }

  try {
    cached.connection = await cached.promise;
    return cached.connection;
  } catch (error) {
    cached.promise = null;
    cached.connection = null;
    throw error;
  }
};

module.exports = connectDb;
