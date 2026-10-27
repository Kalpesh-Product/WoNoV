import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "@babel/parser";

const read = (file) => {
  const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  return { source, ast: parse(source, { sourceType: "module", plugins: ["jsx"] }) };
};
const find = (node, predicate, result = []) => {
  if (!node || typeof node !== "object") return result;
  if (predicate(node)) result.push(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((child) => find(child, predicate, result));
    else if (value && typeof value === "object") find(value, predicate, result);
  }
  return result;
};
const attr = (node, name) => node.openingElement.attributes.find((item) => item.name?.name === name);

test("rating page has one unbordered heading followed by tabs and the selected section", () => {
  const { source, ast } = read("pages/Performance/KraKpaRating.jsx");
  const wrapper = find(ast, (node) => node.type === "VariableDeclarator" && node.id?.name === "KraKpaRating")[0];
  assert.equal(find(wrapper, (node) => node.type === "JSXElement" && node.openingElement.name.name === "PageFrame").length, 0);
  const sections = find(wrapper, (node) => node.type === "JSXElement" && node.openingElement.name.name === "KraKpaRatingSection");
  assert.equal(sections.length, 1);
  assert.equal(attr(sections[0], "type").value.expression.object.name, "activeTab");
  assert.equal(attr(sections[0], "type").value.expression.property.name, "value");
  assert.ok(attr(sections[0], "navigationTabs"));
  const section = find(ast, (node) => node.type === "VariableDeclarator" && node.id?.name === "KraKpaRatingSection")[0];
  assert.equal(find(section, (node) => node.type === "JSXElement" && node.openingElement.name.name === "h1").length, 1);
  assert.equal(find(section, (node) => node.type === "JSXElement" && node.openingElement.name.name === "PageFrame").length, 0);
  const heading = find(section, (node) => node.type === "JSXElement" && node.openingElement.name.name === "h1")[0];
  const tabs = find(section, (node) => node.type === "JSXExpressionContainer" && node.expression?.name === "navigationTabs")[0];
  assert.ok(heading.end < tabs.start, "Tabs must follow Department - Employee");
  assert.ok(source.includes('label: "KPA Rating"'));
  assert.ok(source.includes('label: "Daily Logs Rating"'));
  assert.ok(source.includes("{ state: location.state }"), "Keep the selected employee when switching tabs");
});

test("each rating section remains gated by its own permission", () => {
  const { source, ast } = read("pages/Performance/KraKpaRating.jsx");
  const constants = { KRAKPA_INDIVIDUAL_MONTHLY_KPA: { value: "kpa" }, KRAKPA_SELF_KRA: { value: "kra" } };
  for (const [variable, permission] of [["showKpa", "kpa"], ["showDailyLogs", "kra"]]) {
    const expression = find(ast, (node) => node.type === "VariableDeclarator" && node.id?.name === variable)[0].init;
    const check = new Function("permissions", "PERMISSIONS", `return ${source.slice(expression.start, expression.end)}`);
    assert.equal(check([], constants), false);
    assert.equal(check([permission], constants), true);
    assert.equal(check([permission === "kpa" ? "kra" : "kpa"], constants), false);
  }
});

test("Daily Score uses a tab-free outlet and all legacy rating URLs render the combined page", () => {
  const { source } = read("pages/Performance/KraKpaIndividualLayout.jsx");
  assert.match(source, /isDailyScore \? <Outlet \/> : <TabLayout/);
  const { ast } = read("routes/Routes.jsx");
  const guards = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "PerformancePermissionRoute" && attr(node, "element")?.value?.expression?.openingElement?.name?.name === "KraKpaRating");
  assert.equal(guards.length, 6);
  for (const guard of guards) {
    assert.equal(attr(guard, "mode").value.value, "any");
    assert.equal(attr(guard, "permissions").value.expression.elements.length, 2);
  }
});
