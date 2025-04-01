// const errorHandler = (err, req, res, next) => {
//   (err.stack);
//   res.status(500).json({ message: err.message });
//   next();
// };

const multer = require("multer");
const { createLog } = require("../utils/moduleLogs");

const errorHandler = async (err, req, res, next) => {
  try {
    const { user, ip, company } = req;
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const path = err.path || req.originalUrl || "";
    const action = err.action || req.originalUrl || "Unknown API Error";
    const sourceKey = err.sourceKey || "";
    const sourceId = null;
    const remarks = err.message;

    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ message: "File upload error: " + err.message });
    }

    if (req.method !== "GET" && err.path) {
      try {
        await createLog({
          path,
          action,
          remarks,
          user,
          ip,
          company,
          sourceKey,
          sourceId,
        });
      } catch (logError) {
        return res
          .status(500)
          .json({ message: "Logging failed", error: logError }); //The error may be due to:
        //1.Incorrect path set in the controller
        //2.Incorrect field name passed while uploading file.As a result multer throws error and createLog() doesn't get path which is only set in the controller.
      }
      return res.status(statusCode).json({ message });
    }
    return res.status(401).json(err.message);
  } catch (criticalError) {
    return res.status(500).json({
      message: "Critical error in error handler",
      error: criticalError,
    });
  }
};

module.exports = errorHandler;
