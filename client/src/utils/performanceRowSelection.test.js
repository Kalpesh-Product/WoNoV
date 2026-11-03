import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "@babel/parser";
import { getPerformanceRowId, isDueTaskOverdue, isDueTaskRowSelectable } from "./performanceRowSelection.js";

const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("Due Tasks checkboxes have no tooltip and deadline edit access is preserved", () => {
  const page = read("pages/Performance/KraKpaDueTask.jsx");
  assert.doesNotMatch(page, /checkboxTooltip=/);
  assert.match(page, /isTaskEmployee\(record\) \|\| Boolean\(deadlineAccess\?\.canEditManagerReview\)/);
  assert.match(page, /editingRecord && !canEditDeadline\(editingRecord\)/);
});

test("Due Tasks overdue status compares calendar days, not time of day", () => {
  const today = "2026-10-27T18:00:00";
  assert.equal(isDueTaskOverdue({ deadline: "2026-10-26T23:59:59" }, today), true);
  assert.equal(isDueTaskOverdue({ deadline: "2026-10-27T00:00:00" }, today), false);
  assert.equal(isDueTaskOverdue({ deadline: "2026-10-28" }, today), false);
  assert.equal(isDueTaskOverdue({ deadline: null }, today), false);
  assert.equal(isDueTaskOverdue({ deadline: "invalid" }, today), false);
});

test("overdue Due Tasks can be selected, but closed or already scheduled tasks cannot", () => {
  assert.equal(isDueTaskRowSelectable({ data: { deadline: "2000-01-01" } }), true);
  assert.equal(isDueTaskRowSelectable({ data: { deadline: "2000-01-01", status: "Closed" } }), false);
  assert.equal(isDueTaskRowSelectable({ data: { deadline: "2000-01-01", isAddedToDailyLogs: true } }), false);
  assert.equal(isDueTaskRowSelectable({ data: { deadline: "2099-12-31" } }), true);
  assert.equal(isDueTaskRowSelectable({ data: undefined }), false);
  const source = read("pages/Performance/KraKpaDueTask.jsx");
  assert.match(source, /isRowSelectable=\{isDueTaskRowSelectable\}/);
  assert.match(source, /showDisabledCheckboxes/);
});
const find = (node, predicate, matches = []) => {
  if (!node || typeof node !== "object") return matches;
  if (predicate(node)) matches.push(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((child) => find(child, predicate, matches));
    else if (value && typeof value === "object") find(value, predicate, matches);
  }
  return matches;
};

test("API refreshes preserve row IDs without depending on position or object identity", () => {
  const original = [{ _id: "kra-1", srNo: 1 }, { _id: "kra-2", srNo: 2 }];
  const refreshed = [{ _id: "kra-2", srNo: 1 }, { _id: "kra-1", srNo: 2 }];
  assert.equal(getPerformanceRowId({ data: original[0] }), getPerformanceRowId({ data: refreshed[1] }));
  assert.notEqual(getPerformanceRowId({ data: original[0] }), getPerformanceRowId({ data: original[1] }));
});

test("toolbar JSX identity is not a dependency of filtered row data", () => {
  const source = read("components/AgTable.jsx");
  const ast = parse(source, { sourceType: "module", plugins: ["jsx"] });
  const memo = find(ast, (node) => node.type === "VariableDeclarator" && node.id?.name === "filteredData")[0];
  const dependencies = memo.init.arguments[1].elements.map((node) => node.name);
  assert.ok(dependencies.includes("hasCustomDateControls"));
  assert.ok(!dependencies.includes("toolbarDateControls"));
  assert.match(source, /const hasCustomDateControls = toolbarDateControls !== undefined/);
  assert.match(source, /getRowId=\{getRowId\}/);
});

test("grid selection resets only when an explicit reset key changes", () => {
  const source = read("components/AgTable.jsx");
  assert.match(source, /if \(previousSelectionResetKeyRef.current === selectionResetKey\) return/);
  assert.match(source, /gridRef.current\?\.api\?\.deselectAll\(\)/);
  assert.match(source, /\}, \[selectionResetKey\]\)/);
});

for (const [file, mutation] of [
  ["KraKpaIndividualMonthlyKpa.jsx", "addSelfKrasToDailyLogs"],
  ["KraKpaDueTask.jsx", "addToDailyLogs"],
]) {
  test(`${file}: stable row IDs and reset only after successful Daily Logs submission`, () => {
    const source = read(`pages/Performance/${file}`);
    const ast = parse(source, { sourceType: "module", plugins: ["jsx"] });
    const config = find(ast, (node) => node.type === "VariableDeclarator" && node.id?.name === mutation)[0].init.arguments[0];
    const success = config.properties.find((node) => node.key?.name === "onSuccess");
    assert.equal(find(success, (node) => node.type === "CallExpression" && node.callee?.name === "setSelectionResetKey").length, 1);
    assert.equal(find(ast, (node) => node.type === "CallExpression" && node.callee?.name === "setSelectionResetKey").length, 1,
      "Opening/cancelling the form and failed submissions must not reset selection");
    assert.match(source, /getRowId=\{getPerformanceRowId\}/);
    assert.match(source, /selectionResetKey=\{selectionResetKey\}/);
  });

  test(`${file}: title-row operations and KPA toolbar actions use the requested placement`, () => {
    const ast = parse(read(`pages/Performance/${file}`), { sourceType: "module", plugins: ["jsx"] });
    const tables = find(ast, (node) => node.type === "JSXElement" && node.openingElement.name?.name === "AgTable");
    const table = tables.find((node) => node.openingElement.attributes.some((attr) => attr.name?.name === "toolbarDateControls"));
    const attributes = table.openingElement.attributes;
    const titleRow = file === "KraKpaIndividualMonthlyKpa.jsx"
      ? attributes.find((attr) => attr.name?.name === "titleRightContent")
      : find(ast, (node) => node.type === "JSXElement" && node.children?.some((child) => child.type === "JSXElement" && child.openingElement.name?.name === "h1"))[0];
    assert.ok(find(titleRow, (node) => node.type === "JSXElement" && node.openingElement.name?.name === "PrimaryButton").length >= 2);
    const kpaActions = attributes.find((attr) => attr.name?.name === "headerActions");
    if (file === "KraKpaIndividualMonthlyKpa.jsx") {
      assert.ok(kpaActions);
      assert.equal(find(kpaActions, (node) => node.type === "JSXElement" && node.openingElement.name?.name === "PrimaryButton").length, 1);
      assert.equal(kpaActions.value.expression.left.left.operator, "!");
      assert.equal(kpaActions.value.expression.left.left.argument.name, "isSelfKra");
    } else assert.ok(!kpaActions);
    for (const name of ["headerBottomContent", "searchRowActions", "toolbarActions", "buttonTitle"]) {
      assert.ok(!attributes.some((attr) => attr.name?.name === name), `${name} must not crowd Export and Filter`);
    }
    assert.ok(attributes.some((attr) => attr.name?.name === "search"));
    assert.ok(attributes.some((attr) => attr.name?.name === "exportData"));
    const filter = attributes.find((attr) => attr.name?.name === "hideFilter");
    assert.equal(filter.value.expression.value, false);
  });
}
