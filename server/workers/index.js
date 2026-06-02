require("dotenv").config();
const mongoose = require("mongoose");
const connectDb = require("../config/db");

connectDb(process.env.DB_URL);

mongoose.connection.once("open", () => {
  require("./report.worker");
  console.log("Worker started ✅");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error (worker):", err.message);
});
