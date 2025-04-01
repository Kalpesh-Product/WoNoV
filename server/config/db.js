const mongoose = require("mongoose");

const connectDb = async (url) => {
  try {
    await mongoose.connect(url);
  } catch (error) {
    (error);
  }
};

module.exports = connectDb;
