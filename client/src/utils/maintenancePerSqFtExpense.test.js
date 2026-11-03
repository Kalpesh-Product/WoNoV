import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parse } from "@babel/parser";
import { getMaintenanceExpenseRows } from "./maintenancePerSqFtExpense.js";

const unit = { _id: "unit-1", unitNo: "ST 701 A", sqft: 100 };
const budgets = [
  { unit, dueDate: "2025-10-15", actualAmount: 500 },
  { unit, dueDate: "2026-10-01T00:00:00", actualAmount: 100 },
  { unit, dueDate: "2026-10-31T23:59:59", actualAmount: "200" },
  { unit, dueDate: "2026-11-01", actualAmount: 400 },
];
const dateRange = { startDate: new Date(2026, 9, 1), endDate: new Date(2026, 9, 31) };

test("table date range filters underlying Due Dates inclusively before aggregation", () => {
  const rows = getMaintenanceExpenseRows(budgets, { dateRange });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].totalExpense, 300);
  assert.equal(rows[0].expensePerSqFt, 3);
  assert.equal(rows[0].expense, "3.00");
});
test("graph financial year and table date range are independent", () => {
  assert.equal(getMaintenanceExpenseRows(budgets, { financialYear: "FY 2025-26" })[0].totalExpense, 500);
  assert.equal(getMaintenanceExpenseRows(budgets, { financialYear: "FY 2026-27" })[0].totalExpense, 700);
  assert.equal(getMaintenanceExpenseRows(budgets, { dateRange })[0].totalExpense, 300);
  assert.equal(getMaintenanceExpenseRows(budgets, { dateRange: { startDate: "2025-10-01", endDate: "2025-10-31" } })[0].totalExpense, 500);
});
test("empty/invalid dates, missing units and zero sqft are safe", () => {
  assert.deepEqual(getMaintenanceExpenseRows([], { dateRange }), []);
  assert.deepEqual(getMaintenanceExpenseRows([{ unit, dueDate: null }, { unit, dueDate: "invalid" }, { dueDate: "2026-10-02" }], { dateRange }), []);
  assert.equal(getMaintenanceExpenseRows([{ unit: { ...unit, sqft: 0 }, dueDate: "2026-10-02", actualAmount: 10 }], { dateRange })[0].expensePerSqFt, 0);
});
test("financial year boundaries use April through March", () => {
  const rows = getMaintenanceExpenseRows([
    { unit, dueDate: "2026-03-31", actualAmount: 100 },
    { unit, dueDate: "2026-04-01", actualAmount: 200 },
  ], { financialYear: "FY 2026-27" });
  assert.equal(rows[0].totalExpense, 200);
});
test("page uses the shared table toolbar and does not couple table data to graph year", () => {
  const source = fs.readFileSync(new URL("../pages/Dashboard/MaintainanceDashboard/MaintenancePerSqFtExpense.jsx", import.meta.url), "utf8");
  parse(source, { sourceType: "module", plugins: ["jsx"] });
  assert.match(source, /\[maintenanceBudgets, tableDateRange\]/);
  assert.match(source, /\[maintenanceBudgets, selectedFY\]/);
  assert.match(source, /toolbarDateControls=\{<TableDateFilter/);
  assert.match(source, /onChange=\{setTableDateRange\}/);
  assert.ok(!source.includes("YearWiseTable"));
  assert.match(source, /categories: graphData\.map/);
  assert.match(source, /data: graphData\.map/);
});
