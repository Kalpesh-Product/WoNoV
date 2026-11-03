import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "@babel/parser";

const source = fs.readFileSync(new URL("../pages/Dashboard/SalesDashboard/ManageUnit.jsx", import.meta.url), "utf8");
const ast = parse(source, { sourceType: "module", plugins: ["jsx"] });
const find = (node, predicate) => {
  if (!node || typeof node !== "object") return undefined;
  if (predicate(node)) return node;
  for (const value of Object.values(node)) {
    const match = Array.isArray(value)
      ? value.map((child) => find(child, predicate)).find(Boolean)
      : find(value, predicate);
    if (match) return match;
  }
};

test("Manage Units exposes the calculated total as a visible table column", () => {
  const columns = find(ast, (node) => node.type === "VariableDeclarator" && node.id?.name === "columns");
  const total = columns.init.elements.find((node) => node.properties?.some((prop) => prop.key?.name === "field" && prop.value?.value === "totalUnits"));
  assert.ok(total);
  assert.equal(total.properties.find((prop) => prop.key?.name === "headerName").value.value, "Total Units");
  assert.ok(!total.properties.some((prop) => prop.key?.name === "hide" && prop.value?.value));
  const fields = columns.init.elements.map((node) => node.properties?.find((prop) => prop.key?.name === "field")?.value?.value);
  assert.equal(fields.indexOf("totalUnits") + 1, fields.indexOf("openDesks"));
});

test("Total Units adds Open Desks and Cabin Desks numerically with missing values as zero", () => {
  const property = find(ast, (node) => node.type === "ObjectProperty" && node.key?.name === "totalUnits");
  const calculate = new Function("item", `return (${source.slice(property.value.start, property.value.end)});`);
  assert.equal(calculate({ openDesks: 12, cabinDesks: 8 }), 20);
  assert.equal(calculate({ openDesks: "12", cabinDesks: "8" }), 20);
  assert.equal(calculate({ openDesks: 12 }), 12);
  assert.equal(calculate({}), 0);
});
