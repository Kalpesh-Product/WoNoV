// const apiPerformanceLogger = (req, res, next) => {
//   const startTime = process.hrtime.bigint();

//   res.on("finish", () => {
//     const durationMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;

//     if (durationMs >= 500) {
//       console.warn({
//         severity: durationMs >= 1000 ? "HIGH" : "MEDIUM",
//         method: req.method,
//         route: req.route?.path || req.originalUrl,
//         statusCode: res.statusCode,
//         durationMs: Number(durationMs.toFixed(2)),
//         contentLength: res.getHeader("content-length") || null,
//       });
//     }
//   });

//   next();
// };

// const { recordApiMetric } = require("../services/performanceMetricsService");

// module.exports = apiPerformanceLogger;

const apiPerformanceLogger = (req, res, next) => {
  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const endTime = process.hrtime.bigint();

    const durationMs = Number(endTime - startTime) / 1_000_000;

    consle.log("Before API Performance Logger - Duration (ms):", durationMs);
    // Ignore APIs faster than 500 ms
    if (durationMs < 500) return;
    consle.log("After API Performance Logger - Duration (ms):", durationMs);

    const route = req.route?.path || req.originalUrl.split("?")[0];

    const responseSize = Number(res.getHeader("content-length")) || 0;

    recordApiMetric({
      method: req.method,
      route,
      durationMs,
      responseSize,
      statusCode: res.statusCode,
    });

    console.warn("recordApiMetric", {
      severity: durationMs >= 1000 ? "HIGH" : "MEDIUM",
      method: req.method,
      route,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      contentLength: responseSize,
    });
  });

  next();
};

module.exports = apiPerformanceLogger;
