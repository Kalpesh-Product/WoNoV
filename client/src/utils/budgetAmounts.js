export const normalizeBudgetAmount = (value) => {
  const amount = Number(typeof value === "string" ? value.replace(/,/g, "") : value);
  return Number.isFinite(amount) ? amount : 0;
};

export const formatBudgetAmount = (value) => normalizeBudgetAmount(value).toLocaleString("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Prefer original API amounts over display strings; add in paise to retain cents.
export const sumBudgetAmounts = (rows, field = "actualAmount") => rows.reduce(
  (total, row) => {
    const amount = normalizeBudgetAmount(row[`${field}Raw`] ?? row[field]);
    return total + Math.round((amount + Number.EPSILON) * 100);
  }, 0,
) / 100;
