const emitter = require("../utils/eventEmitter");

const auditLogger = (req, res, next) => {
  const startTime = Date.now();

  // Only log meaningful HTTP methods
  const validMethods = ["GET", "POST", "PATCH", "PUT", "DELETE"];
  if (!validMethods.includes(req.method)) return next();

  // Setup once the response is done
  res.on("finish", () => {
    const status = res.statusCode;
    const success = status < 400;
    let logData = {};

    // Storing data appended in query other than ids is pending
    const sanitizedPayload = { ...req.body };
    if ("password" in sanitizedPayload) sanitizedPayload.password = "***";
    logData.payload = sanitizedPayload;

    logData = {
      performedBy: req?.user || null,
      ipAddress: req.ip,
      departments: req?.departments || "Unknown",
      company: req?.company || null,
      action: req.method === "GET" ? "View" : "Edit",
      method: req.method,
      path: req.originalUrl,
      statusCode: status,
      success,
      payload: req.body, // 🔥 captures data that was submitted
      responseTime: Date.now() - startTime, //milliseconds
    };

    emitter.emit("storeLog", logData);
  });

  next();
};

module.exports = auditLogger;
