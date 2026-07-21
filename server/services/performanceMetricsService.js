const axios = require("axios");

const apiMetrics = new Map();

const recordApiMetric = ({
  method,
  route,
  durationMs,
  responseSize,
  statusCode,
}) => {
  const key = `${method}:${route}`;

  const existingMetric = apiMetrics.get(key) || {
    method,
    api: route,
    callsObserved: 0,
    totalDurationMs: 0,
    maximumMs: 0,
    totalResponseSize: 0,
    statusCodes: {},
  };

  existingMetric.callsObserved += 1;
  existingMetric.totalDurationMs += durationMs;
  existingMetric.maximumMs = Math.max(existingMetric.maximumMs, durationMs);
  existingMetric.totalResponseSize += responseSize;

  existingMetric.statusCodes[statusCode] =
    (existingMetric.statusCodes[statusCode] || 0) + 1;

  apiMetrics.set(key, existingMetric);
};

const prepareMetricRows = () => {
  console.log(
    "Preparing metric rows for sync:",
    apiMetrics.size,
    "metrics found.",
  );
  return Array.from(apiMetrics.values()).map((metric) => {
    const averageMs = metric.totalDurationMs / metric.callsObserved;

    const averageResponseSize = metric.totalResponseSize / metric.callsObserved;

    return {
      method: metric.method,
      api: metric.api,
      callsObserved: metric.callsObserved,
      average: Number(averageMs.toFixed(2)),
      maximum: Number(metric.maximumMs.toFixed(2)),
      responseSize: Math.round(averageResponseSize),
      priority: averageMs >= 1000 ? "High" : "Medium",
      statusCodes: metric.statusCodes,
    };
  });
};

const syncMetricsToSheet = async () => {
  console.log(
    "PERFORMANCE_SHEET_WEBHOOK",
    process.env.PERFORMANCE_SHEET_WEBHOOK,
  );
  const metrics = prepareMetricRows();

  if (metrics.length === 0) return;

  try {
    const response = await axios.post(process.env.PERFORMANCE_SHEET_WEBHOOK, {
      metrics,
    });

    // Clear only after successful upload
    console.log(response.data);
    if (response.data.success) {
      apiMetrics.clear();
    }

    console.log(
      `${metrics.length} performance metrics synced to Google Sheets`,
    );
  } catch (error) {
    console.error("Failed to sync performance metrics:", error.message);
  }
};

module.exports = {
  recordApiMetric,
  syncMetricsToSheet,
};
