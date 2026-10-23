import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "@babel/parser";

const read = (file) => {
  const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  return { source, ast: parse(source, { sourceType: "module", plugins: ["jsx"] }) };
};
const find = (node, predicate, matches = []) => {
  if (!node || typeof node !== "object" || !node.type) return matches;
  if (predicate(node)) matches.push(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((child) => find(child, predicate, matches));
    else if (value?.type) find(value, predicate, matches);
  }
  return matches;
};
const attribute = (node, name) => node.openingElement.attributes.find((entry) => entry.name?.name === name);

test("shared toolbar centers date controls and places export immediately before advanced filter", () => {
  const { source, ast } = read("components/AgTable.jsx");
  const toolbar = find(ast, (node) => node.type === "JSXElement" && attribute(node, "className")?.value?.value?.includes("grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"))[0];
  assert.ok(toolbar);
  const content = source.slice(toolbar.start, toolbar.end);
  assert.ok(content.includes('xl:col-start-1'));
  assert.ok(content.includes('xl:col-start-2'));
  assert.ok(content.includes('xl:col-start-3'));
  assert.ok(content.indexOf("{toolbarActions}") < content.indexOf("renderExportButton()"));
  assert.ok(content.indexOf("renderExportButton()") < content.indexOf('aria-label="Advanced filter"'));
  assert.ok(content.includes("toolbarDateControls !== undefined ? toolbarDateControls"));
});

for (const name of ["YearWiseTable", "WidgetTable", "AllocatedBudget", "DateWiseTable", "MonthWiseTable", "MonthWiseAgTable"]) {
  test(`${name} reuses its existing picker in the shared toolbar`, () => {
    const { ast } = read(`components/Tables/${name}.jsx`);
    const component = ast.program.body.find((node) => node.type === "VariableDeclaration" && node.declarations[0].id.name === name).declarations[0].init;
    const table = find(component, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
    const slot = attribute(table, "toolbarDateControls");
    assert.ok(slot, "Existing date/month/day controls must be passed to the toolbar");
    const controlName = slot.value.expression.name;
    assert.ok(component.body.body.some((node) => node.type === "VariableDeclaration" && node.declarations[0].id.name === controlName), "Picker declaration must be in component scope");
    if (name !== "MonthWiseAgTable") assert.ok(attribute(table, "toolbarActions"), "Existing export action must use the same toolbar");
    if (["YearWiseTable", "WidgetTable", "AllocatedBudget", "MonthWiseAgTable"].includes(name)) {
      assert.equal(find(component, (node) => node.type === "ConditionalExpression" && node.consequent?.openingElement?.name?.name === "AgTable").length, 0, "Zero filtered rows must not remove the picker and search controls");
    }
  });
}

test("Monthly Attendance keeps exactly one month selector and no automatic range picker", () => {
  const { ast } = read("pages/Dashboard/HrDashboard/Mixbag/MonthlyAttendanceSummary.jsx");
  const table = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "AgTable")[0];
  assert.equal(attribute(table, "showDateControls").value.expression.value, false);
  const slot = attribute(table, "toolbarDateControls");
  assert.ok(slot);
  assert.equal(find(ast, (node) => node.type === "JSXElement" && node.openingElement.name.name === "TextField" && attribute(node, "type")?.value?.value === "month").length, 1);
  assert.equal(find(slot, (node) => node.type === "JSXElement" && node.openingElement.name.name === "TextField" && attribute(node, "type")?.value?.value === "month").length, 1);
});
