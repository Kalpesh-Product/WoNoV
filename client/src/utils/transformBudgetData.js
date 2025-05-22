// utils/budgetUtils.js
import { format, addMonths, isValid } from "date-fns";

export const transformBudgetData = (allBudgets = []) => {
  // Define fiscal year range: April 2024 – March 2025
  const start = new Date(2024, 3); // April = 3 (0-indexed)
  const months = Array.from({ length: 12 }, (_, i) =>
    format(addMonths(start, i), "yyyy-MM")
  );

  const monthMap = months.reduce((acc, month) => {
    acc[month] = { projected: 0, actual: 0 };
    return acc;
  }, {});

  if (!Array.isArray(allBudgets)) return {
    projectedBudget: months.map(() => 0),
    utilisedBudget: months.map(() => 0),
  };

  allBudgets.forEach((entry) => {
    const dueDate = new Date(entry.dueDate);
    const monthKey = isValid(dueDate) ? format(dueDate, "yyyy-MM") : null;

    if (monthKey && monthMap[monthKey]) {
      const projected = Number(entry.projectedAmount) || 0;
      const actual = Number(entry.actualAmount) || 0;

      monthMap[monthKey].projected += projected;
      monthMap[monthKey].actual += actual;
    }
  });

  return {
    projectedBudget: months.map((m) => monthMap[m].projected),
    utilisedBudget: months.map((m) => monthMap[m].actual),
  };
};
