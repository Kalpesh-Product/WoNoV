// Read-only static inventory. Reports are returned in memory for the caller to save.
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "../..");
const clientRequire = createRequire(path.join(root, "client/package.json"));
const { parse } = clientRequire("@babel/parser");
const traverse = clientRequire("@babel/traverse").default;
const relative = (file) => path.relative(root, file).replaceAll("\\", "/");
const clean = (text, limit = 340) => {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  return value.length > limit ? `${value.slice(0, limit)}…` : value;
};
const walkFiles = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(directory, entry.name);
  return entry.isDirectory() ? walkFiles(file) : /\.[cm]?(?:js|jsx)$/.test(file) && !/\.test\./.test(file) ? [file] : [];
});
const resolveLocal = (file, specifier) => {
  if (!specifier.startsWith(".")) return null;
  const base = path.resolve(path.dirname(file), specifier);
  return [base, `${base}.jsx`, `${base}.js`, path.join(base, "index.jsx"), path.join(base, "index.js")]
    .find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null;
};
const jsxName = (node) => node?.type === "JSXIdentifier" ? node.name : node?.type === "JSXMemberExpression" ? `${jsxName(node.object)}.${jsxName(node.property)}` : "";
const propertyName = (node) => node?.name || node?.value;
const attr = (node, name) => node.openingElement.attributes.find((entry) => entry.name?.name === name);
const valueNode = (attribute) => attribute?.value?.type === "JSXExpressionContainer" ? attribute.value.expression : attribute?.value;
const literal = (node) => node?.type === "StringLiteral" ? node.value : null;
const descendants = (node, predicate) => {
  const result = [];
  const visit = (item) => {
    if (!item?.type) return;
    if (predicate(item)) result.push(item);
    for (const value of Object.values(item)) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value?.type) visit(value);
    }
  };
  visit(node);
  return result;
};

function buildAudit() {
  const files = walkFiles(path.join(root, "client/src"));
  const records = new Map();
  const errors = [];
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    try {
      const ast = parse(source, { sourceType: "module", plugins: ["jsx"] });
      const imports = new Map();
      const dependencies = [];
      for (const statement of ast.program.body) {
        if (statement.type !== "ImportDeclaration") continue;
        const target = resolveLocal(file, statement.source.value);
        if (target) {
          dependencies.push(target);
          for (const specifier of statement.specifiers) imports.set(specifier.local.name, target);
        }
      }
      records.set(file, { file, source, ast, imports, dependencies });
    } catch (error) { errors.push({ file: relative(file), error: error.message }); }
  }
  const routeRoot = path.join(root, "client/src/routes/Routes.jsx");
  const reachable = new Set();
  const mark = (file) => {
    if (reachable.has(file)) return;
    reachable.add(file);
    (records.get(file)?.dependencies || []).forEach(mark);
  };
  [routeRoot, path.join(root, "client/src/main.jsx")].forEach(mark);
  const routeReferences = new Map();
  const routes = records.get(routeRoot);
  if (routes) traverse(routes.ast, {
    ObjectExpression(p) {
      const element = p.node.properties.find((entry) => propertyName(entry.key) === "element")?.value;
      if (!element) return;
      const chain = [];
      for (let cursor = p; cursor; cursor = cursor.parentPath) {
        if (!cursor.isObjectExpression()) continue;
        const properties = cursor.node.properties;
        const route = properties.find((entry) => propertyName(entry.key) === "path")?.value;
        const wrapper = properties.find((entry) => propertyName(entry.key) === "element")?.value;
        chain.unshift({ path: literal(route) || "", wrapper });
      }
      const routePath = chain.map((item) => item.path).filter(Boolean).join("/").replace(/\/+/g, "/");
      const guards = [...new Set(chain.flatMap((item) => descendants(item.wrapper, (node) =>
        node.type === "JSXOpeningElement" && /Protect|RequireAuth|PermissionRoute|PermissionGuard/.test(jsxName(node.name)),
      ).map((node) => clean(routes.source.slice(node.start, node.end), 700))))];
      for (const node of descendants(element, (node) => node.type === "JSXOpeningElement")) {
        const target = routes.imports.get(jsxName(node.name));
        if (!target || !relative(target).startsWith("client/src/pages/")) continue;
        if (!routeReferences.has(target)) routeReferences.set(target, []);
        const list = routeReferences.get(target);
        if (!list.some((item) => item.path === routePath)) list.push({ path: routePath, guards });
      }
    },
  });

  const buttons = [];
  const moduleName = (file) => {
    const parts = relative(file).split("/");
    if (parts[2] !== "pages") return "Shared components and hooks";
    if (/\.jsx?$/.test(parts[3])) return "General pages";
    const module = parts[3] === "Dashboard" ? parts[4].replace(/Dashboard$/, "") + " Dashboard" : parts[3];
    return module.replace("Maintainance", "Maintenance").replace(/^Hr /, "HR ").replace(/^It /, "IT ");
  };
  for (const record of records.values()) {
    const { source, file } = record;
    const text = (node, length = 340) => node ? clean(source.slice(node.start, node.end), length) : "";
    const rawValue = (attribute) => !attribute ? "" : !attribute.value ? "true" : text(valueNode(attribute));
    const getContext = (p) => {
      const conditions = [];
      const expressionNodes = [];
      const dynamicSources = [];
      for (let cursor = p.parentPath; cursor; cursor = cursor.parentPath) {
        const node = cursor.node;
        if (node.type === "LogicalExpression" && p.node.start >= node.right.start) {
          conditions.push(node.operator === "&&" ? text(node.left) : `fallback of (${text(node.left)})`);
          expressionNodes.push(node.left);
        }
        if (node.type === "ConditionalExpression") {
          if (p.node.start >= node.consequent.start && p.node.end <= node.consequent.end) conditions.push(text(node.test));
          else if (p.node.start >= node.alternate.start) conditions.push(`NOT (${text(node.test)})`);
          else continue;
          expressionNodes.push(node.test);
        }
        if (node.type === "IfStatement") {
          conditions.push(p.node.start >= node.consequent.start && p.node.end <= node.consequent.end ? text(node.test) : `NOT (${text(node.test)})`);
          expressionNodes.push(node.test);
        }
        if (node.type === "CallExpression" && node.callee.type === "MemberExpression" && ["map", "flatMap"].includes(propertyName(node.callee.property))) dynamicSources.push(text(node.callee.object));
      }
      return { conditions: [...new Set(conditions)], expressionNodes, dynamicSources: [...new Set(dynamicSources)] };
    };
    const definitions = (p, expressions) => {
      const output = [];
      const seen = new Set();
      const inspect = (scope, expression, depth) => {
        if (!expression || depth > 3) return;
        for (const identifier of descendants(expression, (node) => node.type === "Identifier" && /^(?:can|is|has|allow|access|auth|user|role|permission|review|selected|record|data|params)/i.test(node.name))) {
          const binding = scope.getBinding(identifier.name);
          if (!binding || seen.has(binding.path.node.start)) continue;
          seen.add(binding.path.node.start);
          const declaration = binding.path.node;
          if (/Import/.test(declaration.type) || /Param/.test(binding.kind)) continue;
          const value = declaration.type === "VariableDeclarator" ? declaration.init : declaration;
          if (!value) continue;
          output.push({ name: identifier.name, line: declaration.loc.start.line, expression: text(value, 800) });
          inspect(binding.path.scope, value, depth + 1);
        }
      };
      expressions.forEach((expression) => inspect(p.scope, expression, 0));
      return output.slice(0, 12);
    };
    const add = (p, kind, label, options = {}) => {
      const context = getContext(p);
      const disabled = options.disabled || "";
      const localDefinitions = definitions(p, [...context.expressionNodes, ...(options.expressionNodes || [])]);
      const accessText = [context.conditions.join(" "), disabled, ...localDefinitions.map((entry) => entry.expression)].join(" ");
      const explicitlyAccessRelated = /permission|role|isHr\b|isTop\b|isManager\b|isAdmin\b|isEmployee\b|canEdit|canDelete|canAdd|canManage|access\.|createdBy|assignedTo|lead\b|owner/i.test(accessText);
      buttons.push({
        module: moduleName(file), file: relative(file), line: p.node.loc.start.line,
        kind, label: clean(label, 180) || "Unlabelled icon/control", handler: options.handler || "",
        renderConditions: context.conditions, disabledWhen: disabled, dynamicSources: context.dynamicSources,
        accessDefinitions: localDefinitions, explicitAccessCheckDetected: explicitlyAccessRelated,
        routeImportReachable: reachable.has(file), routes: routeReferences.get(file) || [],
        ...options.extra,
      });
    };
    traverse(record.ast, {
      JSXElement(p) {
        const node = p.node;
        const name = jsxName(node.openingElement.name);
        const handlerAttribute = ["onClick", "handleSubmit", "handleClick", "onConfirm"].map((key) => attr(node, key)).find(Boolean);
        if (/^(?:button|motion\.button|Button|IconButton|Fab|MenuItem)$/.test(name) && (name !== "MenuItem" || handlerAttribute) || /Button$/.test(name)) {
          const labelAttribute = ["aria-label", "title", "label"].map((key) => attr(node, key)).find(Boolean);
          const textChildren = node.children.map((child) => child.type === "JSXText" ? child.value : child.type === "JSXExpressionContainer" && child.expression.type === "StringLiteral" ? child.expression.value : "").join(" ");
          const label = labelAttribute ? literal(valueNode(labelAttribute)) || text(valueNode(labelAttribute), 180) : clean(textChildren, 180) || `Icon/action: ${rawValue(handlerAttribute) || name}`;
          const disabledAttribute = attr(node, "disabled");
          const loadingAttribute = attr(node, "isLoading");
          add(p, "button", label, { handler: rawValue(handlerAttribute), disabled: [rawValue(disabledAttribute), loadingAttribute && `loading: ${rawValue(loadingAttribute)}`].filter(Boolean).join("; "), expressionNodes: [valueNode(disabledAttribute), valueNode(handlerAttribute)], extra: { component: name, buttonType: rawValue(attr(node, "type")) } });
        } else if (handlerAttribute && /^(?:span|div|a|Md\w+|Fa\w+|Io\w+)$/.test(name)) {
          const labelAttribute = attr(node, "aria-label") || attr(node, "title");
          const childText = clean(node.children.filter((child) => child.type === "JSXText").map((child) => child.value).join(" "));
          add(p, "clickable action", literal(valueNode(labelAttribute)) || childText || `Action: ${rawValue(handlerAttribute)}`, { handler: rawValue(handlerAttribute), disabled: rawValue(attr(node, "disabled")), expressionNodes: [valueNode(handlerAttribute)], extra: { component: name } });
        }
        if (["AgTable", "MemoizedAgTable", "YearWiseTable", "WidgetTable", "DateWiseTable", "MonthWiseTable", "AllocatedBudget"].includes(name)) {
          for (const [labelKey, handlerKey, disabledKey] of [["buttonTitle", "handleClick", "disabled"], ["secondaryButtonTitle", "handleSecondarySubmit", "secondaryButtonDisabled"], ["middleButtonTitle", "handleMiddleSubmit", "middleButtonDisabled"], ["customExportTitle", "handleCustomExport", "customExportDisabled"], ["batchButton", "handleBatchAction", "disabled"]]) {
            const title = attr(node, labelKey);
            if (!title) continue;
            const callback = attr(node, handlerKey) || attr(node, "handleSubmit");
            const disabled = attr(node, disabledKey) || attr(node, "buttonDisabled");
            add(p, "table-generated action", literal(valueNode(title)) || rawValue(title), { handler: rawValue(callback), disabled: rawValue(disabled), expressionNodes: [valueNode(disabled), valueNode(callback)], extra: { component: name, configuredThrough: labelKey } });
          }
          const request = attr(node, "onRequestBudget");
          if (request) add(p, "table-generated action", "Request Budget", { handler: rawValue(request), expressionNodes: [valueNode(request)], extra: { component: name, configuredThrough: "onRequestBudget" } });
          if (attr(node, "exportData") && rawValue(attr(node, "exportData")) !== "false" && !attr(node, "exportAction") && !attr(node, "customExportTitle")) add(p, "table-generated utility", "Export", { handler: "Shared table export", extra: { component: name, availability: `exportData: ${rawValue(attr(node, "exportData"))}` } });
          if (rawValue(attr(node, "hideFilter")) !== "true" && rawValue(attr(node, "showTableControls")) !== "false" && !attr(node, "advancedFilterAction")) add(p, "table-generated utility", "Advanced filter", { handler: "Shared table filter drawer", extra: { component: name, availability: "Requires visible table controls and filterable columns at runtime" } });
        }
      },
      ObjectExpression(p) {
        const properties = p.node.properties;
        const label = properties.find((entry) => ["label", "title"].includes(propertyName(entry.key)));
        const handler = properties.find((entry) => ["onClick", "onSelect", "handleSubmit", "action"].includes(propertyName(entry.key)));
        if (!label || !handler || !["ArrowFunctionExpression", "FunctionExpression", "Identifier", "CallExpression"].includes(handler.value?.type)) return;
        const disabled = properties.find((entry) => propertyName(entry.key) === "disabled");
        add(p, "configured menu/action", literal(label.value) || text(label.value, 180), { handler: text(handler.value), disabled: text(disabled?.value), expressionNodes: [disabled?.value, handler.value] });
      },
    });
  }

  const backendChecks = [];
  for (const directory of ["controllers", "middlewares", "routes"]) {
    const folder = path.join(root, "server", directory);
    if (!fs.existsSync(folder)) continue;
    for (const file of walkFiles(folder)) {
      const source = fs.readFileSync(file, "utf8");
      try {
        traverse(parse(source, { sourceType: "unambiguous", plugins: ["jsx"] }), {
          IfStatement(p) {
            const body = source.slice(p.node.consequent.start, p.node.consequent.end);
            if (!/(?:status\(\s*403|CustomError\([^;]*403|Access Denied|[Ff]orbidden)/s.test(body)) return;
            backendChecks.push({ file: relative(file), line: p.node.loc.start.line, condition: clean(source.slice(p.node.test.start, p.node.test.end), 700), denial: clean(body, 650) });
          },
          CallExpression(p) {
            const callee = p.node.callee;
            if (callee.type !== "MemberExpression" || !["get", "post", "put", "patch", "delete"].includes(propertyName(callee.property))) return;
            if (!literal(p.node.arguments[0]) || !/router|Router/.test(source.slice(callee.object.start, callee.object.end))) return;
            const chain = p.node.arguments.slice(1).map((node) => clean(source.slice(node.start, node.end), 700));
            if (chain.some((item) => /permission|authorize|protect|role|access/i.test(item))) backendChecks.push({ file: relative(file), line: p.node.loc.start.line, condition: `${propertyName(callee.property).toUpperCase()} ${literal(p.node.arguments[0])}`, denial: chain.join(" → "), type: "route middleware chain" });
          },
        });
      } catch (error) { errors.push({ file: relative(file), error: error.message }); }
    }
  }
  return { generatedFor: "2026-10-27", filesScanned: files.length, buttons, backendChecks, errors };
}

function renderReports(audit) {
  const escape = (value) => String(value).replaceAll("|", "\\|").replaceAll("`", "'").replaceAll("\n", " ");
  const link = (file, line) => `[${path.basename(file)}:${line}](../../${file}#L${line})`;
  const modules = [...new Set(audit.buttons.map((button) => button.module))].sort();
  const reports = {};
  const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const summaryRows = [];
  for (const module of modules) {
    const entries = audit.buttons.filter((button) => button.module === module);
    const reachable = entries.filter((button) => button.routeImportReachable);
    summaryRows.push({ module, entries: entries.length, reachable: reachable.length, guarded: entries.filter((button) => button.explicitAccessCheckDetected).length, pages: new Set(entries.map((button) => button.file)).size });
    const lines = [`# ${module}: button access inventory`, "", "Static declarations, not distinct runtime buttons. Permission assignments and backend acceptance must be checked separately. See [scope and limitations](README.md).", ""];
    for (const file of [...new Set(entries.map((entry) => entry.file))].sort()) {
      const rows = entries.filter((entry) => entry.file === file);
      lines.push(`## ${file.replace("client/src/", "")}`, "", rows[0].routeImportReachable ? "Referenced by the application route/main import graph." : "Not reached from the route/main import graph; may be legacy, unused, or dynamically loaded outside this audit.", "");
      const routes = rows[0].routes;
      if (routes.length) {
        lines.push("Declared route paths:", "", ...routes.map((route) => `- ${escape(route.path)}${route.guards.length ? ` — ${route.guards.map((guard) => `\`${escape(guard)}\``).join("; ")}` : " — no permission wrapper detected on this route-object chain"}`), "");
      } else lines.push("No direct route-object binding detected; access may be inherited from its parent page/component.", "");
      lines.push("| Button/action | Rendered when | Disabled when | Handler / source |", "|---|---|---|---|");
      for (const row of rows.sort((a, b) => a.line - b.line)) {
        const render = row.renderConditions.length ? row.renderConditions.join(" AND ") : "No local render guard detected; page/API access still applies";
        lines.push(`| ${escape(row.label)} (${row.kind}) | ${escape(render)}${row.availability ? `; ${escape(row.availability)}` : ""} | ${escape(row.disabledWhen || "No local disabled condition detected")} | ${escape(row.handler || "No inline handler declared; may submit a form or delegate to a component")} — ${link(row.file, row.line)} |`);
      }
      const definitions = [...new Map(rows.flatMap((row) => row.accessDefinitions).map((definition) => [`${definition.name}:${definition.line}`, definition])).values()];
      if (definitions.length) lines.push("", "Access/condition definitions referenced by these controls (expressions may be abbreviated):", "", ...definitions.map((definition) => `- **${escape(definition.name)}**, line ${definition.line}: \`${escape(definition.expression)}\``));
      lines.push("");
    }
    reports[`${slug(module)}.md`] = lines.join("\n") + "\n";
  }
  reports["backend-checks.md"] = ["# Backend authorization declarations", "", "These are independently discovered HTTP-403 branches and explicit authorization middleware chains. They are not an endpoint-to-button mapping and do not prove every button/API pair has been checked. Route paths are router-local, not necessarily their full mounted URLs. A missing entry is not evidence of unrestricted access.", "", "| Source | Authorization condition / route | Denial branch / middleware |", "|---|---|---|", ...audit.backendChecks.map((check) => `| ${link(check.file, check.line)} | ${escape(check.condition)} | ${escape(check.denial)} |`), ""].join("\n");
  const totals = { controls: audit.buttons.length, filesWithControls: new Set(audit.buttons.map((row) => row.file)).size, importReachableControls: audit.buttons.filter((row) => row.routeImportReachable).length, accessCheckCandidates: audit.buttons.filter((row) => row.explicitAccessCheckDetected).length, backendChecks: audit.backendChecks.length, errors: audit.errors.length };
  reports["README.md"] = [
    "# Application-wide button access inventory", "", `Source snapshot reviewed for ${audit.generatedFor}. No application code or permission assignments were changed by this audit.`, "",
    `Scanned ${audit.filesScanned} client JavaScript/JSX source files. Found **${totals.controls} control declarations/configurations** across **${totals.filesWithControls} files**; ${totals.importReachableControls} are in the route/main import graph. Found ${totals.backendChecks} backend authorization declarations. Parse failures: ${totals.errors}.`, "",
    "## How to read access", "", "- Effective access combines parent-route access, assigned user permissions, local visibility, disabled/selection/status conditions, ownership and the API's server-side rules.",
    "- The app can load permissions per user; a role name alone cannot establish which users may invoke a button. This report does not query the live permission database or list actual user assignments.",
    "- 'No local guard detected' does NOT mean 'all users allowed'. Page wrappers, handler functions, reusable components or backend rules can still reject the operation.",
    "- Render conditions and disabled expressions are quoted from source. Nearby definitions help interpret names such as isHr, canDelete, isTop, selectedRows and reviewAccess. Conditions are not collapsed into guessed roles.",
    "- Shared controls, table-generated actions, dynamic labels, repeated table instances, menu entries and clickable actions are listed separately. Counts are declarations, NOT distinct labels, live buttons or security findings.",
    "- Route/main import reachability is not proof a component is rendered: imported legacy/demo components remain flagged as reachable. Unreached files are retained and explicitly marked, not claimed to be live pages.",
    "- Runtime-generated controls, remote configuration, alias imports, guards inside external helpers and conditions applied by filtered data/configuration may require manual tracing. Backend branches are listed separately, not exhaustively paired to frontend buttons.",
    "- Excluded: commented-out code, test files, plain navigation links without click handlers, and ordinary inputs/select options. Schema/config objects with action callbacks are included as configured actions.", "",
    "## Module lists", "", "| Module | Declarations | In route/main import graph | Files |", "|---|---:|---:|---:|",
    ...summaryRows.map((row) => `| [${row.module}](${slug(row.module)}.md) | ${row.entries} | ${row.reachable} | ${row.pages} |`), "",
    "## Supporting evidence", "", "- [Backend authorization declarations](backend-checks.md)", "- [Machine-readable control inventory](button-access.json)", "- [Read-only audit generator](generate.cjs)", "",
    "## Verification", "", "This is static source inspection. No production database, credentials, .env files or browser sessions were read. No live authorization or API mutation tests were performed. Treat this as a complete inventory of the supported detectable source patterns, not a certified role-to-button security matrix.", "",
    ...(audit.errors.length ? ["## Parse failures", "", ...audit.errors.map((error) => `- ${error.file}: ${error.error}`)] : []),
  ].join("\n") + "\n";
  const fileEvidence = Object.fromEntries([...new Set(audit.buttons.map((row) => row.file))].map((file) => {
    const rows = audit.buttons.filter((row) => row.file === file);
    return [file, {
      routes: rows[0].routes,
      routeImportReachable: rows[0].routeImportReachable,
      definitions: [...new Map(rows.flatMap((row) => row.accessDefinitions).map((definition) => [`${definition.name}:${definition.line}`, definition])).values()],
    }];
  }));
  reports["button-access.json"] = JSON.stringify({
    generatedFor: audit.generatedFor, filesScanned: audit.filesScanned, files: fileEvidence,
    buttons: audit.buttons.map(({ routes, accessDefinitions, ...row }) => ({ ...row, definitionReferences: accessDefinitions.map((definition) => `${definition.name}:${definition.line}`) })),
    backendChecks: audit.backendChecks, errors: audit.errors,
  }, null, 2) + "\n";
  return { reports, totals, summaryRows };
}

module.exports = { buildAudit, renderReports };
