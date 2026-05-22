// services/budget.service.js
const User = require("../../models/hr/UserData");
const Budget = require("../../models/budget/Budget");

const fetchBudgetVoucherService = async ({ dateFilter, departmentId }) => {
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

const mapBudgetBaseFields = (budget = {}) => {
  const projectedAmount = budget?.particulars?.length
    ? budget.particulars.reduce(
        (acc, curr) => acc + (curr.particularAmount || 0),
        0,
      )
    : budget.projectedAmount || 0;

  return {
    department: budget?.department?.name || "-",
    expanseName: budget?.expanseName || "-",
    expanseType: budget?.expanseType || "-",
    paymentType: budget?.paymentType || "-",
    projectedAmount,
    actualAmount: budget?.actualAmount ?? "-",
    unit: budget?.unit?.unitName || "-",
    unitNo: budget?.unit?.unitNo || "-",
    building: budget?.unit?.building?.buildingName || "-",
    paymentType: budget?.paymentType || "-",
    projectedAmount,
    actualAmount: budget?.actualAmount ?? "-",
    dueDate: budget?.dueDate || null,
    invoiceName: budget?.invoice?.name || "-",
    invoiceDate: budget?.invoice?.date || null,
    approvalStatus: budget?.status || "-",
    paidStatus: budget?.isPaid || "-",
    invoiceFile: budget?.invoice?.link || "-",
  };
};

const fetchBudgetService = async ({ dateFilter, departments, roles }) => {
  const query = { expanseType: { $ne: "Reimbursement" } };

  if (dateFilter) query.dueDate = dateFilter.dueDate;

  if (
    !roles.includes([
      "Finance Admin",
      "Finance Emloyee",
      "Master Admin",
      "Super Admin",
    ])
  ) {
    query.department = { $in: departments };
  }

  console.log("budget query", query);

  const budgets = await Budget.find(query)
    .populate([
      { path: "department", select: "name" },
      {
        path: "unit",
        select: "unitName unitNo building",
        populate: {
          path: "building",
          model: "Building",
          select: "buildingName",
        },
      },
    ])
    .lean()
    .exec();

  return { allBudgets: budgets.map(mapBudgetBaseFields) };
};

const fetchVoucherService = async ({ dateFilter, departments }) => {
  const query = {
    $or: [
      { "finance.voucher.link": { $exists: true, $ne: "" } },
      { "voucher.link": { $exists: true, $ne: "" } },
    ],
  };

  if (departments) query.department = { $in: departments };
  if (dateFilter) query.dueDate = dateFilter.dueDate;

  const budgets = await Budget.find(query)
    .populate([
      { path: "department", select: "name" },
      {
        path: "unit",
        select: "unitName unitNo building",
        populate: {
          path: "building",
          model: "Building",
          select: "buildingName",
        },
      },
    ])
    .lean()
    .exec();

  const vouchers = budgets.map((budget) => {
    const base = mapBudgetBaseFields(budget);
    return {
      ...base,
      voucherName:
        budget?.finance?.voucher?.name || budget?.voucher?.name || "-",
      voucherDate:
        budget?.finance?.voucher?.date || budget?.voucher?.date || null,
      voucherFile:
        budget?.finance?.voucher?.link || budget?.voucher?.link || "-",
      voucherSrNo: budget?.finance?.fSrNo || budget?.srNo || "-",
    };
  });

  return { allBudgets: vouchers };
};

module.exports = {
  fetchBudgetVoucherService,
  fetchBudgetService,
  fetchVoucherService,
};
