const emitter = require("../utils/eventEmitter");

const auditLogger = (req, res, next) => {
  const startTime = Date.now();

  // Only log meaningful HTTP methods
  const validMethods = ["GET", "POST", "PATCH", "PUT", "DELETE"];

  if (!validMethods.includes(req.method)) return next();

  //Do not store logs of refresh route
  if (req.originalUrl.includes("refresh")) return next();

  if (req.originalUrl.includes("login")) {
    console.log("logout");
    console.log("body", req.body);
  }
  if (
    !req.body ||
    (req.body.method === "POST" && Object.keys(req.body).length === 0)
  )
    return next();

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
      performedBy: req?.user || req?.body?.user || null,
      ipAddress: req.ip,
      departments: req?.departments || null,
      company: req?.company || req?.body?.user?.company || null,
      action: req.method === "GET" ? "View" : "Edit",
      method: req.method,
      path: req.originalUrl,
      statusCode: status,
      success,
      payload: req.body.user, // 🔥 captures data that was submitted
      responseTime: Date.now() - startTime, //milliseconds
    };

    emitter.emit("storeLog", logData);
  });

  next();
};

module.exports = auditLogger;
