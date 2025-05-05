// utils/budgetUtils.js
import { format, addMonths, startOfMonth } from "date-fns";

export const transformBudgetData = (allBudgets) => {
  // Define your fiscal year range: April 2024 – March 2025
  const start = new Date(2024, 3); // April = 3 (0-indexed)
  const months = Array.from({ length: 12 }, (_, i) =>
    format(addMonths(start, i), "yyyy-MM")
  );

  const monthMap = months.reduce((acc, month) => {
    acc[month] = { projected: 0, actual: 0 };
    return acc;
  }, {});

  allBudgets.forEach((entry) => {
    const monthKey = format(startOfMonth(new Date(entry.dueDate)), "yyyy-MM");
    if (monthMap[monthKey]) {
      monthMap[monthKey].projected += entry.projectedAmount || 0;
      monthMap[monthKey].actual += entry.actualAmount || 0;
    }
  });

  return {
    projectedBudget: months.map((m) => monthMap[m].projected),
    utilisedBudget: months.map((m) => monthMap[m].actual),
  };
};
