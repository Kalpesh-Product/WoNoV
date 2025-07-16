// const sharp = require("sharp");
const emitter = require("../utils/eventEmitter");

const auditLogger = (req, res, next) => {
  try {
    const startTime = Date.now();

    const validMethods = ["GET", "POST", "PATCH", "PUT", "DELETE"];
    const cleanUrl = req.originalUrl.split("?")[0];
    const pathSegments = cleanUrl.split("/").filter(Boolean);

    // If last segment is alphanumeric or just numeric, it's likely an ID
    const isPossiblyId = (segment) => /^[a-zA-Z0-9]+$/.test(segment);

    const lastSegment =
      pathSegments.length > 1 && isPossiblyId(pathSegments.at(-1))
        ? pathSegments.at(-2)
        : pathSegments.at(-1);

    // Skip invalid HTTP methods
    if (!validMethods.includes(req.method)) return next();

    // Skip GET methods except logout
    if (req.method === "GET" && lastSegment !== "logout") {
      return next();
    }

    // Skip refresh token route
    if (req.originalUrl.includes("refresh")) return next();

    console.log("segment", lastSegment);
    console.log("method", req.method);
    console.log("body", req.body);
    console.log("params", req.params);
    console.log("query", req.query);
    console.log("file", req.file);

    // Skip if body is empty on methods other then GET
    if (
      !req.body &&
      !isPossiblyId &&
      req.method !== "GET" &&
      Object.keys(req.body).length === 0
    ) {
      return next();
    }

    res.on("finish", async () => {
      try {
        const status = res.statusCode;
        const success = status < 400;
        const { method, ip } = req;
        const url = req.originalUrl;

        const { performedBy, company } = req.logContext || {
          performedBy: req.user,
          company: req.company,
        };

        const parseJSONFields = (obj) => {
          for (const key in obj) {
            if (
              typeof obj[key] === "string" &&
              obj[key].startsWith("[") &&
              obj[key].endsWith("]")
            ) {
              try {
                const parsed = JSON.parse(obj[key]);
                if (Array.isArray(parsed)) {
                  obj[key] = parsed;
                }
              } catch (_) {
                // leave as-is if not parseable
              }
            }
          }
          return obj;
        };

        const flattenObject = (obj, prefix = "", result = {}) => {
          for (const key in obj) {
            const value = obj[key];
            const prefixedKey = prefix ? `${prefix}.${key}` : key;

            if (
              typeof value === "object" &&
              value !== null &&
              !Array.isArray(value)
            ) {
              flattenObject(value, prefixedKey, result);
            } else {
              result[prefixedKey] = value;
            }
          }
          return result;
        };

        let combinedPayload = parseJSONFields({
          ...(req.body || {}),
          ...(req.params || {}),
          ...(req.query || {}),
        });

        //Storing files

        // let base64Image = null;

        // if (req.file && req.file.buffer) {
        //   try {
        //     const buffer = await sharp(req.file.buffer)
        //       .resize(1200, 800, { fit: "cover" })
        //       .webp({ quality: 80 })
        //       .toBuffer();

        //     base64Image = `data:image/webp;base64,${buffer.toString("base64")}`;

        //     combinedPayload = { ...combinedPayload, image: base64Image };
        //   } catch (err) {
        //     console.error("Image processing error:", err.message);
        //   }
        // }

        // Mask sensitive fields before flattening
        ["password", "newPassword", "confirmPassword"].forEach((field) => {
          if (field in combinedPayload) combinedPayload[field] = "***";
        });

        const updatedPayload = flattenObject({
          ...combinedPayload,
          image: base64Image,
        });

        const logData = {
          performedBy,
          ipAddress: ip,
          company,
          action: lastSegment,
          method,
          path: url,
          statusCode: status,
          success,
          payload: updatedPayload,
          responseTime: Date.now() - startTime,
        };

        // emitter.emit("storeLog", logData);
        logEmitHandler("storeLog", logData);
      } catch (error) {
        console.error("Error in auditLogger:", error.message);
      }
    });

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = auditLogger;
