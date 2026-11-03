import dayjs from "dayjs";

export const getMaintenanceExpenseRows = (budgets = [], { financialYear, dateRange } = {}) => {
  const groups = new Map();
  for (const budget of budgets) {
    const dueDate = budget.dueDate ? dayjs(budget.dueDate) : null;
    if (!dueDate?.isValid()) continue;
    if (financialYear) {
      const year = dueDate.month() < 3 ? dueDate.year() - 1 : dueDate.year();
      if (`FY ${year}-${String((year + 1) % 100).padStart(2, "0")}` !== financialYear) continue;
    }
    if (dateRange && (dueDate.isBefore(dayjs(dateRange.startDate), "day") ||
      dueDate.isAfter(dayjs(dateRange.endDate), "day"))) continue;
    const unit = budget.unit;
    if (!unit?._id) continue;
    const key = String(unit._id);
    if (!groups.has(key)) groups.set(key, {
      unitId: unit._id, unitNo: unit.unitNo || "-", unitName: unit.unitName || "-",
      buildingName: unit.building?.buildingName || "-", sqft: Number(unit.sqft) || 0, totalExpense: 0,
    });
    groups.get(key).totalExpense += Number(budget.actualAmount) || 0;
  }
  return [...groups.values()].sort((a, b) => a.unitNo.localeCompare(b.unitNo, undefined, { numeric: true }))
    .map((group, index) => {
      const expensePerSqFt = group.sqft ? group.totalExpense / group.sqft : 0;
      return { ...group, srNo: index + 1, expensePerSqFt,
        expense: expensePerSqFt.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) };
    });
};
