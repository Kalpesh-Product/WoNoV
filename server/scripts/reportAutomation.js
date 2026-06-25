#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const serverRoot = path.resolve(__dirname, "..");
const registryPath = path.join(serverRoot, "services", "reports", "index.js");
const DEFAULT_CONTEXT_KEYS = ["company", "query", "params"];

function parseArgs(argv) {
  const args = {};

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;

    const key = arg.slice(2);
    const value = argv[i + 1];

    if (!value || value.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = value;
      i += 1;
    }
  }

  return args;
}

function normalizeKey(value = "") {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-report$/, "");
}

function toPascalCase(value = "") {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function parseList(value, fallback = []) {
  if (!value) return fallback;

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function ensureFileExists(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found: ${filePath}`);
  }
}

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeFileIfChanged(filePath, content) {
  const current = fs.existsSync(filePath) ? readFile(filePath) : "";

  if (current === content) {
    console.log(`No change: ${path.relative(serverRoot, filePath)}`);
    return false;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Updated: ${path.relative(serverRoot, filePath)}`);
  return true;
}

function getRelativeRequirePath(fromFile, toFile) {
  let relativePath = path
    .relative(path.dirname(fromFile), toFile)
    .replace(/\\/g, "/");

  if (!relativePath.startsWith(".")) {
    relativePath = `./${relativePath}`;
  }

  return relativePath.replace(/\.js$/, "");
}

function addLineAfterLastRequire(content, line) {
  if (content.includes(line)) return content;

  const matches = [
    ...content.matchAll(/^const\s+.*?=\s+require\(.+?\);\s*$/gm),
  ];
  if (!matches.length) return `${line}\n${content}`;

  const last = matches[matches.length - 1];
  const insertAt = last.index + last[0].length;
  return `${content.slice(0, insertAt)}\n${line}${content.slice(insertAt)}`;
}

function buildServiceTemplate({ serviceName, dateField, contextKeys }) {
  const params = [...new Set(["dateFilter", "isReport", ...contextKeys])];

  return `const ${serviceName} = async ({
${params.map((param) => `  ${param},`).join("\n")}
} = {}) => {
  // TODO: Implement report-specific data retrieval and formatting.
  // Date filter for this report is available at dateFilter?.${dateField}.

  return [];
};

module.exports = {
  ${serviceName},
};
`;
}

function ensureServiceFile({
  servicePath,
  serviceName,
  dateField,
  contextKeys,
}) {
  if (fs.existsSync(servicePath)) {
    console.log(
      `No change: ${path.relative(serverRoot, servicePath)} already exists`,
    );
    return false;
  }

  return writeFileIfChanged(
    servicePath,
    buildServiceTemplate({ serviceName, dateField, contextKeys }),
  );
}

function ensureRegistryEntry({
  key,
  servicePath,
  serviceName,
  dateField,
  aliases,
}) {
  let content = readFile(registryPath);
  const requirePath = getRelativeRequirePath(registryPath, servicePath);
  const importLine = `const { ${serviceName} } = require("${requirePath}");`;

  content = addLineAfterLastRequire(content, importLine);

  const reportKeys = [key, ...aliases];
  const missingKeys = reportKeys.filter(
    (reportKey) =>
      !new RegExp(
        `(["']${reportKey}["']|\\b${reportKey}):\\s*createReportService\\(${serviceName}`,
      ).test(content),
  );

  if (missingKeys.length) {
    const entries = missingKeys
      .map(
        (reportKey) => `  "${reportKey}": createReportService(${serviceName}, {
    dateField: "${dateField}",
  }),`,
      )
      .join("\n\n");

    content = content.replace(
      /const\s+reportServiceRegistry\s*=\s*\{\s*\n/,
      (match) => `${match}${entries}\n\n`,
    );
  }

  return writeFileIfChanged(registryPath, content);
}

function buildControllerPayload(contextKeys) {
  const payloadByKey = {
    company: "      company: req.company,",
    user: "      user: req.user,",
    query: "      query: { ...req.query },",
    params: "      params: req.params || {},",
    departmentId:
      "      departmentId: req.body?.department || req.query?.department,",
    departments: "      departments: req.body?.departments || [],",
    roles: "      roles: req.roles || [],",
  };

  return contextKeys
    .map((key) => payloadByKey[key])
    .filter(Boolean)
    .join("\n");
}

function buildControllerReplacement({
  controllerFn,
  serviceName,
  contextKeys,
  emptyMessage,
}) {
  const payload = buildControllerPayload(contextKeys);
  const emptyCheck = emptyMessage
    ? `

    if (Array.isArray(payload) && !payload.length) {
      return res.status(404).json({ message: "${emptyMessage}" });
    }`
    : "";

  return `const ${controllerFn} = async (req, res, next) => {
  try {
    const payload = await ${serviceName}({
${payload}
    });${emptyCheck}

    return res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};`;
}

function replaceControllerFunction(content, controllerFn, replacement) {
  const startPatterns = [
    new RegExp(
      `const\\s+${controllerFn}\\s*=\\s*async\\s*\\([^)]*\\)\\s*=>\\s*\\{`,
    ),
    new RegExp(`async\\s+function\\s+${controllerFn}\\s*\\([^)]*\\)\\s*\\{`),
    new RegExp(`function\\s+${controllerFn}\\s*\\([^)]*\\)\\s*\\{`),
  ];

  for (const pattern of startPatterns) {
    const match = pattern.exec(content);
    if (!match) continue;

    const startIndex = match.index;
    const bodyStartIndex = startIndex + match[0].length - 1;
    let depth = 0;
    let endIndex = -1;

    for (let i = bodyStartIndex; i < content.length; i += 1) {
      const char = content[i];
      if (char === "{") depth += 1;
      if (char === "}") depth -= 1;

      if (depth === 0) {
        endIndex = i + 1;
        if (content[endIndex] === ";") endIndex += 1;
        break;
      }
    }

    if (endIndex === -1) {
      throw new Error(`Could not find the end of ${controllerFn}.`);
    }

    return `${content.slice(0, startIndex)}${replacement}${content.slice(endIndex)}`;
  }

  throw new Error(`Could not find ${controllerFn} in controller file.`);
}

function ensureController({
  controllerPath,
  controllerFn,
  servicePath,
  serviceName,
  contextKeys,
  emptyMessage,
}) {
  let content = readFile(controllerPath);
  const requirePath = getRelativeRequirePath(controllerPath, servicePath);
  const importLine = `const { ${serviceName} } = require("${requirePath}");`;

  content = addLineAfterLastRequire(content, importLine);
  content = replaceControllerFunction(
    content,
    controllerFn,
    buildControllerReplacement({
      controllerFn,
      serviceName,
      contextKeys,
      emptyMessage,
    }),
  );

  return writeFileIfChanged(controllerPath, content);
}

function validateArgs(args) {
  const missing = ["name", "controller", "controllerFn", "dateField"].filter(
    (key) => !args[key],
  );

  if (missing.length) {
    throw new Error(
      `Missing required argument(s): ${missing.join(", ")}\n` +
        "Usage: node scripts/createReportCycle.js --name leads --controller controllers/salesControllers/leadsControllers.js --controllerFn getLeads --dateField dateOfContact",
    );
  }
}

function main() {
  const args = parseArgs(process.argv);
  validateArgs(args);

  const key = normalizeKey(args.key || args.name);
  const aliases = parseList(args.aliases);
  const contextKeys = parseList(args.contextKeys, DEFAULT_CONTEXT_KEYS);
  const serviceName =
    args.serviceName || `fetch${toPascalCase(key)}ReportService`;
  const servicePath = path.join(
    serverRoot,
    args.serviceFile || path.join("services", "reports", `${key}.js`),
  );
  const controllerPath = path.join(serverRoot, args.controller);

  ensureFileExists(registryPath, "Report registry");
  ensureFileExists(controllerPath, "Controller");

  const changes = [
    ensureServiceFile({
      servicePath,
      serviceName,
      dateField: args.dateField,
      contextKeys,
    }),
    ensureRegistryEntry({
      key,
      aliases,
      servicePath,
      serviceName,
      dateField: args.dateField,
    }),
    ensureController({
      controllerPath,
      controllerFn: args.controllerFn,
      servicePath,
      serviceName,
      contextKeys,
      emptyMessage: args.emptyMessage,
    }),
  ];

  const changedCount = changes.filter(Boolean).length;
  console.log(
    changedCount
      ? `Report cycle automation completed for '${key}' with ${changedCount} file update(s).`
      : `Report cycle '${key}' is already configured.`,
  );
}

main();
