import test from "node:test";
import assert from "node:assert/strict";
import { formatBudgetAmount, normalizeBudgetAmount, sumBudgetAmounts } from "./budgetAmounts.js";

test("actual amount matches the edit form and always displays two decimals", () => {
  assert.equal(formatBudgetAmount(1694.07), "1,694.07");
  assert.equal(formatBudgetAmount(1694), "1,694.00");
  assert.equal(formatBudgetAmount("1,694.07"), "1,694.07");
  assert.equal(formatBudgetAmount(123456.78), "1,23,456.78");
});

test("actual totals use original amounts, never rounded table strings", () => {
  const rows = [
    { actualAmount: "1,694", actualAmountRaw: 1694.07 },
    { actualAmount: "1", actualAmountRaw: 0.93 },
  ];
  assert.equal(sumBudgetAmounts(rows), 1695);
  assert.equal(formatBudgetAmount(sumBudgetAmounts(rows)), "1,695.00");
});

test("paise are retained when adding decimal and formatted-string amounts", () => {
  assert.equal(sumBudgetAmounts([{ actualAmount: "1,694.07" }, { actualAmount: "12.34" }]), 1706.41);
  assert.equal(sumBudgetAmounts([{ actualAmount: 0.1 }, { actualAmount: 0.2 }]), 0.3);
});

test("missing and invalid values do not turn totals into NaN", () => {
  for (const value of [undefined, null, "", "invalid", Infinity]) {
    assert.equal(normalizeBudgetAmount(value), 0);
  }
  assert.equal(sumBudgetAmounts([{ actualAmount: null }, { actualAmount: "invalid" }, { actualAmount: 1694.07 }]), 1694.07);
  assert.equal(sumBudgetAmounts([]), 0);
});

test("zero original amounts are preserved and projected totals use their own field", () => {
  const rows = [{ actualAmountRaw: 0, actualAmount: 100, projectedAmountRaw: 2500.25, projectedAmount: "2,500" }];
  assert.equal(sumBudgetAmounts(rows), 0);
  assert.equal(sumBudgetAmounts(rows, "projectedAmount"), 2500.25);
});
