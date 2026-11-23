const MODULE_PATH_SEGMENTS = {
  ACCESS: ["access"],
  ASSETS: ["assets", "asset"],
  CAFE: ["cafe"],
  FINANCE: ["finance"],
  FINANCE1: ["finance1", "finance"],
  FRONTEND: ["frontend"],
  HR: ["hr"],
  INVESTOR: ["investor"],
  IT: ["it"],
  KRAKPA: ["krakpa", "kra-kpa", "kra", "kpa"],
  MAINTENANCE: ["maintenance", "maintainance"],
  MEETINGS: ["meetings", "meeting"],
  PERFORMANCE: ["performance"],
  PRINTOUT: ["printouts", "printout"],
  PROFILE: ["profile"],
  REPORTS: ["reports", "report"],
  SALES: ["sales"],
  SALES1: ["sales1", "sales"],
  SIDEBAR: ["sidebar"],
  TASKS: ["tasks", "task"],
  TICKETS: ["tickets", "ticket"],
  VISITORS: ["visitors", "visitor"],
};

const normalizeKey = (value) =>
  String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

const getApiPathSegment = (path) => {
  const segments = String(path || "")
    .split("?")[0]
    .split("/")
    .filter(Boolean);
  const apiIndex = segments.findIndex(
    (segment) => segment.toLowerCase() === "api",
  );

  return (apiIndex >= 0 ? segments[apiIndex + 1] : segments[0]) || "";
};

const normalizeLogModule = (path) => {
  const segmentKey = normalizeKey(getApiPathSegment(path));
  if (!segmentKey) return "unknown";

  for (const [module, aliases] of Object.entries(MODULE_PATH_SEGMENTS)) {
    if (aliases.some((alias) => normalizeKey(alias) === segmentKey)) {
      return module.toLowerCase();
    }
  }

  return segmentKey.toLowerCase();
};

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getModulePathRegex = (module) => {
  const moduleKey = normalizeKey(module);
  const aliases = MODULE_PATH_SEGMENTS[moduleKey] || [
    String(module || "").toLowerCase(),
  ];
  const patterns = aliases.map(escapeRegExp).join("|");

  return new RegExp(`/api/(?:${patterns})(?:/|$)`, "i");
};

module.exports = {
  MODULE_PATH_SEGMENTS,
  normalizeLogModule,
  getModulePathRegex,
};
