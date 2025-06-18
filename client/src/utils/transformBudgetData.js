// utils/budgetUtils.js
import { format, addMonths, isValid } from "date-fns";

export const transformBudgetData = (allBudgets = []) => {
  const createMonthMap = (startYear) => {
    const start = new Date(startYear, 3); // April of startYear
    const months = Array.from({ length: 12 }, (_, i) =>
      format(addMonths(start, i), "yyyy-MM")
    );
    const map = months.reduce((acc, month) => {
      acc[month] = { projected: 0, actual: 0 };
      return acc;
    }, {});
    return { map, months };
  };

  const { map: fy24Map, months: fy24Months } = createMonthMap(2024);
  const { map: fy25Map, months: fy25Months } = createMonthMap(2025);

  if (Array.isArray(allBudgets)) {
    allBudgets.forEach((entry) => {
      const dueDate = new Date(entry.dueDate);
      const monthKey = isValid(dueDate) ? format(dueDate, "yyyy-MM") : null;
      const projected = Number(entry.projectedAmount) || 0;
      const actual = Number(entry.actualAmount) || 0;

      if (monthKey && fy24Map[monthKey]) {
        fy24Map[monthKey].projected += projected;
        fy24Map[monthKey].actual += actual;
      } else if (monthKey && fy25Map[monthKey]) {
        fy25Map[monthKey].projected += projected;
        fy25Map[monthKey].actual += actual;
      }
    });
  }

return {
  "FY 2024-25": {
    projectedBudget: fy24Months.map((m) => fy24Map[m].projected),
    utilisedBudget: fy24Months.map((m) => fy24Map[m].actual),
  },
  "FY 2025-26": {
    projectedBudget: fy25Months.map((m) => fy25Map[m].projected),
    utilisedBudget: fy25Months.map((m) => fy25Map[m].actual),
  },
};

};
