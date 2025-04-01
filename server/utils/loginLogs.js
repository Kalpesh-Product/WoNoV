const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");

const registerLogs = async (logData) => {
  try {
    const logMessage = `[${new Date().toISOString()}] - Email: ${
      logData.email
    } - Status: ${logData.status} - IP: ${logData.ip} - ${
      logData.message || ""
    }\n`;
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", "login.log"),
      logMessage,
      "utf8"
    );
  } catch (error) {
    console.error("Error writing log:", error);
  }
};

module.exports = registerLogs;
