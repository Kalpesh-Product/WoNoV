#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const reportsDir = path.join(root, "services", "reports");
const registryFile = path.join(reportsDir, "index.js");
const scriptsDir = path.join(root, "scripts");
const testDir = path.join(root, "tests", "report");

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
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function createServiceFile({ key, serviceName, controllerFile, controllerFn }) {
  const filePath = path.join(reportsDir, `${key}.js`);
  if (fs.existsSync(filePath)) {
    console.log(`Service file already exists: ${filePath}`);
    return filePath;
  }

  const content = `const ${serviceName} = async ({ dateFilter, departmentId, departments = [], roles = [],company,user }) => {
  // TODO: Move business logic from controller here.
  // Source controller: ${controllerFile || "n/a"}${controllerFn ? `#${controllerFn}` : ""}
  return {
    rows: [],
    meta: {
      reportKey: '${key}',
      dateFilter,
      departmentId,
      departmentsCount: departments.length,
      roles,
      company,
      user
    },
  };
};

module.exports = {
  ${serviceName},
};
`;
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Created service file: ${filePath}`);
  return filePath;
}

function updateRegistry({ key, serviceName }) {
  let content = fs.readFileSync(registryFile, "utf8");
  const importLine = `const { ${serviceName} } = require('./${key}');`;
  if (!content.includes(importLine)) {
    const marker = 'const { fetchTicketReportService } = require("./ticket");';
    if (content.includes(marker)) {
      content = content.replace(marker, `${marker}\n${importLine}`);
    } else {
      content = `${importLine}\n${content}`;
    }
  }

  const registryEntry = `  '${key}': async ({ dateFilter, departmentId, departments, roles,company,user }) =>\n    ${serviceName}({ dateFilter, departmentId, departments, roles,company,user }),`;

  if (!content.includes(`'${key}':`) && !content.includes(`${key}:`)) {
    content = content.replace(
      /const reportServiceRegistry = \{/,
      (m) => `${m}\n${registryEntry}\n`,
    );
  }

  fs.writeFileSync(registryFile, content, "utf8");
  console.log(`Updated registry file: ${registryFile}`);
}

function updateController({ controllerFile, controllerFn, serviceName, key }) {
  if (!controllerFile || !controllerFn) {
    console.log(
      "Skipping controller update (--controller and --controllerFn not provided).",
    );
    return;
  }

  const controllerPath = path.join(root, controllerFile);
  if (!fs.existsSync(controllerPath)) {
    throw new Error(`Controller file not found: ${controllerPath}`);
  }

  let content = fs.readFileSync(controllerPath, "utf8");
  const importLine = `const { ${serviceName} } = require('../../services/reports/${key}');`;
  if (!content.includes(importLine)) {
    const firstConst = content.indexOf("const ");
    if (firstConst >= 0) {
      content = `${content.slice(0, firstConst)}${importLine}\n${content.slice(firstConst)}`;
    } else {
      content = `${importLine}\n${content}`;
    }
  }

  const fnRegex = new RegExp(
    `(const\\s+${controllerFn}\\s*=\\s*async\\s*\\([^)]*\\)\\s*=>\\s*\\{[\\s\\S]*?\\n\\}|async function\\s+${controllerFn}\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\n\\})`,
    "m",
  );
  if (!fnRegex.test(content)) {
    throw new Error(
      `Could not find async function ${controllerFn} in ${controllerFile}`,
    );
  }

  const replacement = `async function ${controllerFn}(req, res) {\n  const payload = await ${serviceName}({\n    dateFilter: req.body?.dateFilter || {},\n    departmentId: req.body?.department,\n    departments: req.body?.departments || || req?.departments || [],\n    roles: req?.roles || [],\n    company: req?.company || null,\n    user: req?.user || null  });\n\n  return res.status(200).json(payload);\n}`;

  content = content.replace(fnRegex, replacement);
  fs.writeFileSync(controllerPath, content, "utf8");
  console.log(
    `Updated controller function ${controllerFn} in ${controllerFile}`,
  );
}

function createSeedTemplate({ key, reportName, moduleName }) {
  ensureDir(scriptsDir);
  const filePath = path.join(scriptsDir, `seedReport.${key}.js`);
  if (fs.existsSync(filePath)) return;
  const content = `require('dotenv').config();
const connectDb = require('../config/db');
const Report = require('../models/reports/Report');

(async () => {
  try {
    await connectDb(process.env.DB_URL);
    await Report.updateOne(
      { reportKey: '${key}' },
      {
        $set: {
          module: '${moduleName || "reports"}',
          reportName: '${reportName}',
          reportKey: '${key}',
          status: true,
        },
      },
      { upsert: true },
    );

    console.log('Seeded report ${key}');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
`;
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Created seed template: ${filePath}`);
}

function createSmokeTestTemplate({ key }) {
  ensureDir(testDir);
  const filePath = path.join(testDir, `${key}.smoke.md`);
  if (fs.existsSync(filePath)) return;
  const content = [
    `# Smoke test for ${key}`,
    "",
    "1. Run seed script:",
    `   - \`node scripts/seedReport.${key}.js\``,
    "2. Start API + worker:",
    "   - `npm run dev:api`",
    "   - `npm run dev:worker`",
    `3. Trigger report generation via API (using a valid report id for reportKey=${key}).`,
    "4. Verify status transitions pending -> processing -> completed in ReportJob.",
    "5. Verify generated payload stored in ReportJob.data.",
    "",
  ].join("\\n");
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Created smoke test checklist: ${filePath}`);
}

function createStartupValidation() {
  const validationDir = path.join(root, "services", "reports");
  const validationFile = path.join(validationDir, "validateRegistry.js");
  if (!fs.existsSync(validationFile)) {
    const content = [
      "const Report = require('../../models/reports/Report');",
      "const { reportServiceRegistry } = require('./index');",
      "",
      "const normalizeReportIdentifier = (value = '') =>",
      "  value",
      "    .trim()",
      "    .toLowerCase()",
      "    .replace(/\\\\s+/g, '-')",
      "    .replace(/[^a-z0-9-]/g, '')",
      "    .replace(/-report$/, '');",
      "",
      "async function validateReportRegistryMappings() {",
      "  const reports = await Report.find({ status: true }).select('reportName reportKey').lean();",
      "",
      "  const missing = reports.filter((report) => {",
      "    const normalizedKey = normalizeReportIdentifier(report.reportKey || report.reportName || '');",
      "    return !normalizedKey || !reportServiceRegistry[normalizedKey];",
      "  });",
      "",
      "  if (missing.length) {",
      "    const details = missing",
      "      .map((item) => `${item.reportName} (${item.reportKey || 'no-reportKey'})`)",
      "      .join(', ');",
      "    throw new Error(`Missing report service mappings: ${details}`);",
      "  }",
      "}",
      "",
      "module.exports = {",
      "  validateReportRegistryMappings,",
      "};",
      "",
    ].join("\\n");
    fs.writeFileSync(validationFile, content, "utf8");
    console.log(`Created startup validation helper: ${validationFile}`);
  }

  const serverFile = path.join(root, "server.js");
  let serverContent = fs.readFileSync(serverFile, "utf8");
  const importLine =
    "const { validateReportRegistryMappings } = require('./services/reports/validateRegistry');";
  if (!serverContent.includes(importLine)) {
    serverContent = serverContent.replace(
      'const bullBoardAdapter = require("./queues/bullBoard");',
      `const bullBoardAdapter = require(\"./queues/bullBoard\");\n${importLine}`,
    );
  }

  const hook = `mongoose.connection.once("open", async () => {\n  console.log("Connected to MongoDB");\n  await validateReportRegistryMappings();\n  app.listen(PORT);\n  console.log(\`Server running on port \${PORT}\`);\n});`;

  serverContent = serverContent.replace(
    /mongoose\.connection\.once\("open", \(\) => \{[\s\S]*?\n\}\);/m,
    hook,
  );
  fs.writeFileSync(serverFile, serverContent, "utf8");
  console.log("Enabled startup validation in server.js");
}

function main() {
  const args = parseArgs(process.argv);
  const reportName = args.name;
  if (!reportName) {
    throw new Error(
      'Usage: node scripts/scaffoldReportAutomation.js --name "Report Name" [--controller path] [--controllerFn functionName] [--module moduleName] [--withValidation true]',
    );
  }
  const key = normalizeKey(args.key || reportName);
  const serviceName = `fetch${toPascalCase(key)}ReportService`;

  createServiceFile({
    key,
    serviceName,
    controllerFile: args.controller,
    controllerFn: args.controllerFn,
  });
  updateRegistry({ key, serviceName });
  updateController({
    controllerFile: args.controller,
    controllerFn: args.controllerFn,
    serviceName,
    key,
  });
  createSeedTemplate({ key, reportName, moduleName: args.module });
  createSmokeTestTemplate({ key });

  if (args.withValidation === "true" || args.withValidation === true) {
    createStartupValidation();
  }

  console.log("\nDone. Next: run seed script and smoke test checklist.");
}

main();
