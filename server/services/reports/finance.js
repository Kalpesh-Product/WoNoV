// services/budget.service.js
const User = require("../../models/hr/UserData");
const Budget = require("../../models/budget/Budget");

const fetchBudgetService = async ({ dateFilter, departmentId }) => {
  const query = {};

  if (departmentId) {
    query.department = departmentId;
  }

  if (dateFilter) {
    query.dueDate = dateFilter.dueDate;
  }

  const budgets = await Budget.find(query)
    .populate([
      { path: "department", select: "name" },
      { path: "unit", populate: { path: "building", model: "Building" } },
    ])
    .lean()
    .exec();

  const allBudgets = budgets.map((budget) => {
    if (budget?.particulars?.length) {
      const projectedAmount = budget.particulars.reduce(
        (acc, curr) => acc + curr.particularAmount,
        0,
      );

      return {
        ...budget,
        projectedAmount,
      };
    }

    return budget;
  });

  return { allBudgets };
};

module.exports = {
  fetchBudgetService,
};
