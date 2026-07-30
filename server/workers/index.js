require("dotenv").config();
const connectDb = require("../config/db");

const startWorker = async () => {
  try {
    await connectDb(process.env.DB_URL);
    require("./report.worker");
    console.log("Worker started");
  } catch (error) {
    console.error("MongoDB connection error (worker):", error.message);
    process.exitCode = 1;
  }
};

startWorker();
