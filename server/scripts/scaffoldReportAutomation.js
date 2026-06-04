#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const reportsDir = path.join(root, "services", "reports");
const registryFile = path.join(reportsDir, "index.js");

const DEFAULT_CONTEXT_KEYS = [
  "departmentId",
  "departments",
  "roles",
  "company",
  "user",
  "query",
  "params",
];

function parseArgs(argv) {
  const args = {};

  for (let i = 2; i < argv.length; i += 1) {
    const part = argv[i];

    if (!part.startsWith("--")) continue;

    const key = part.slice(2);
    const next = argv[i + 1];

    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
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
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join("");
}

function ensureFileExists(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found: ${filePath}`);
  }
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

function parseList(value, fallback = []) {
  if (!value) return fallback;

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatArray(items) {
  return `[${items.map((item) => `"${item}"`).join(", ")}]`;
}

function findControllerFunction(content, controllerFn) {
  const patterns = [
    new RegExp(`const\\s+${controllerFn}\\s*=\\s*async\\s*\\([^)]*\\)\\s*=>`),
    new RegExp(`exports\\.${controllerFn}\\s*=\\s*async\\s*\\([^)]*\\)\\s*=>`),
    new RegExp(
      `module\\.exports\\.${controllerFn}\\s*=\\s*async\\s*\\([^)]*\\)\\s*=>`,
    ),
    new RegExp(`async\\s+function\\s+${controllerFn}\\s*\\([^)]*\\)`),
    new RegExp(`function\\s+${controllerFn}\\s*\\([^)]*\\)`),
    new RegExp(
      `export\\s+const\\s+${controllerFn}\\s*=\\s*async\\s*\\([^)]*\\)\\s*=>`,
    ),
  ];

  return patterns.some((pattern) => pattern.test(content));
}

function createServiceFile({
  key,
  serviceName,
  controllerFile,
  controllerFn,
  contextKeys,
}) {
  const servicePath = path.join(reportsDir, `${key}.js`);

  if (fs.existsSync(servicePath)) {
    throw new Error(`Service file already exists: ${servicePath}`);
  }

  const params = [...new Set(["dateFilter", ...contextKeys])];

  const content = `const ${serviceName} = async ({
${params.map((param) => `  ${param},`).join("\n")}
}) => {
  // Source controller: ${controllerFile}#${controllerFn}
  // TODO: Add report business logic here.

  return [];
};

module.exports = {
  ${serviceName},
};
`;

  fs.writeFileSync(servicePath, content, "utf8");
  console.log(`Created service file: ${servicePath}`);

  return servicePath;
}

function addRequireOnce(content, importLine) {
  if (content.includes(importLine)) return content;

  const requireMatches = [
    ...content.matchAll(/^const\s+.*?=\s+require\(.+?\);\s*$/gm),
  ];

  if (requireMatches.length) {
    const lastMatch = requireMatches[requireMatches.length - 1];
    const insertAt = lastMatch.index + lastMatch[0].length;

    return `${content.slice(0, insertAt)}\n${importLine}${content.slice(insertAt)}`;
  }

  return `${importLine}\n${content}`;
}

function updateRegistry({
  key,
  serviceName,
  servicePath,
  dateField,
  contextKeys,
}) {
  ensureFileExists(registryFile, "Report registry file");

  let content = fs.readFileSync(registryFile, "utf8");

  const duplicatePatterns = [
    new RegExp(`['"]${key}['"]\\s*:`),
    new RegExp(`\\b${key}\\s*:`),
  ];

  if (duplicatePatterns.some((pattern) => pattern.test(content))) {
    throw new Error(`Report key '${key}' already exists in registry.`);
  }

  const requirePath = getRelativeRequirePath(registryFile, servicePath);
  const importLine = `const { ${serviceName} } = require("${requirePath}");`;

  content = addRequireOnce(content, importLine);

  const registryStart = /const\s+reportServiceRegistry\s*=\s*\{\s*\n/;

  if (!registryStart.test(content)) {
    throw new Error(
      "Could not find `const reportServiceRegistry = {` in registry file.",
    );
  }

  const registryEntry = `  "${key}": createReportService(${serviceName}, {
    dateField: "${dateField}",
   }),

`;

  content = content.replace(
    registryStart,
    (match) => `${match}${registryEntry}`,
  );

  fs.writeFileSync(registryFile, content, "utf8");
  console.log(`Updated report registry: ${registryFile}`);
}

function buildControllerPayload(contextKeys) {
  const lines = [];

  if (contextKeys.includes("query")) {
    lines.push("    query: { ...req.query },");
  }

  if (contextKeys.includes("params")) {
    lines.push("    params: req.params || {},");
  }

  return lines.join("\n");
}

function replaceControllerFunction(content, controllerFn, replacement) {
  const startPatterns = [
    new RegExp(
      `const\\s+${controllerFn}\\s*=\\s*async\\s*\\([^)]*\\)\\s*=>\\s*\\{`,
    ),
    new RegExp(
      `exports\\.${controllerFn}\\s*=\\s*async\\s*\\([^)]*\\)\\s*=>\\s*\\{`,
    ),
    new RegExp(
      `module\\.exports\\.${controllerFn}\\s*=\\s*async\\s*\\([^)]*\\)\\s*=>\\s*\\{`,
    ),
    new RegExp(`async\\s+function\\s+${controllerFn}\\s*\\([^)]*\\)\\s*\\{`),
    new RegExp(`function\\s+${controllerFn}\\s*\\([^)]*\\)\\s*\\{`),
    new RegExp(
      `export\\s+const\\s+${controllerFn}\\s*=\\s*async\\s*\\([^)]*\\)\\s*=>\\s*\\{`,
    ),
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

        while (
          content[endIndex] === ";" ||
          content[endIndex] === "\n" ||
          content[endIndex] === "\r"
        ) {
          if (content[endIndex] === ";") {
            endIndex += 1;
            break;
          }

          endIndex += 1;
        }

        break;
      }
    }

    if (endIndex === -1) {
      throw new Error(
        `Could not find the end of controller function '${controllerFn}'.`,
      );
    }

    return `${content.slice(0, startIndex)}${replacement}${content.slice(endIndex)}`;
  }

  throw new Error(`Could not replace controller function '${controllerFn}'.`);
}

function updateController({
  controllerFile,
  controllerFn,
  serviceName,
  servicePath,
  contextKeys,
}) {
  const controllerPath = path.join(root, controllerFile);

  ensureFileExists(controllerPath, "Controller file");

  let content = fs.readFileSync(controllerPath, "utf8");

  if (!findControllerFunction(content, controllerFn)) {
    throw new Error(
      `Could not find controller function '${controllerFn}' in ${controllerFile}`,
    );
  }

  const requirePath = getRelativeRequirePath(controllerPath, servicePath);
  const importLine = `const { ${serviceName} } = require("${requirePath}");`;

  content = addRequireOnce(content, importLine);

  const payload = buildControllerPayload(contextKeys);

  const replacement = `const ${controllerFn} = async (req, res, next) => {
  try {
    const payload = await ${serviceName}({
${payload}
    });

    return res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};`;

  content = replaceControllerFunction(content, controllerFn, replacement);

  fs.writeFileSync(controllerPath, content, "utf8");
  console.log(`Updated controller: ${controllerPath}`);
}

function validateArgs(args) {
  const required = ["name", "controller", "controllerFn", "dateField"];
  const missing = required.filter((key) => !args[key]);

  if (missing.length) {
    throw new Error(
      `Missing required argument(s): ${missing.join(", ")}\n` +
        `Usage: node scripts/scaffoldReportAutomation.js --name "Vendor" --controller controllers/vendorControllers/vendorController.js --controllerFn fetchVendors --dateField onboardingDate`,
    );
  }
}

function main() {
  const args = parseArgs(process.argv);

  validateArgs(args);

  const key = normalizeKey(args.key || args.name);
  const serviceName =
    args.serviceName || `fetch${toPascalCase(key)}ReportService`;
  const contextKeys = parseList(args.contextKeys, DEFAULT_CONTEXT_KEYS);

  ensureFileExists(registryFile, "Report registry file");
  ensureFileExists(path.join(root, args.controller), "Controller file");

  const servicePath = createServiceFile({
    key,
    serviceName,
    controllerFile: args.controller,
    controllerFn: args.controllerFn,
    contextKeys,
  });

  updateRegistry({
    key,
    serviceName,
    servicePath,
    dateField: args.dateField,
    contextKeys,
  });

  updateController({
    controllerFile: args.controller,
    controllerFn: args.controllerFn,
    serviceName,
    servicePath,
    contextKeys,
  });

  console.log(
    "\nDone. Report service created, registry updated, and controller now calls the service.",
  );
}

main();
