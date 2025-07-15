const emitter = require("../utils/eventEmitter");

const auditLogger = (req, res, next) => {
  const startTime = Date.now();

  const validMethods = ["GET", "POST", "PATCH", "PUT", "DELETE"];
  const cleanUrl = req.originalUrl.split("?")[0];
  const lastSegment = cleanUrl.split("/").pop();

  // Skip invalid HTTP methods
  if (!validMethods.includes(req.method)) return next();

  // Skip GET methods except logout
  if (req.method === "GET" && lastSegment !== "logout") {
    return next();
  }

  // Skip refresh token route
  if (req.originalUrl.includes("refresh")) return next();

  // Skip if body is empty on POST
  if (
    !req.body ||
    (req.method === "POST" && Object.keys(req.body).length === 0)
  )
    return next();

  res.on("finish", () => {
    try {
      const status = res.statusCode;
      const success = status < 400;
      const { method, ip } = req;
      const url = req.originalUrl;

      const { performedBy, company, departments } = req.logContext || {
        performedBy: req.user,
        company: req.company,
        departments: req.departments,
      };

      // Sanitize payload
      const sanitizedPayload = { ...req.body };
      if ("password" in sanitizedPayload) sanitizedPayload.password = "***";

      const logData = {
        performedBy,
        ipAddress: ip,
        departments,
        company,
        action: lastSegment,
        method,
        path: url,
        statusCode: status,
        success,
        payload: sanitizedPayload,
        responseTime: Date.now() - startTime,
      };

      emitter.emit("storeLog", logData);
    } catch (error) {
      console.error("Error in auditLogger:", error.message);
    }
  });

  next();
};

module.exports = auditLogger;
