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
    dueDate: budget?.dueDate || null,
    isExtraBudget: budget?.isExtraBudget ?? false,
    invoiceAttached: budget?.invoiceAttached ?? false,
    invoiceName: budget?.invoice?.name || "-",
    invoiceDate: budget?.invoice?.date || null,
    approvalStatus: budget?.status || "-",
    paidStatus: budget?.isPaid || "-",
    invoiceFile: budget?.invoice?.link || "-",
  };
};

const fetchBudgetService = async ({ dateFilter, departmentId, roles }) => {
  const query = { expanseType: { $ne: "Reimbursement" } };

  if (dateFilter) query.dueDate = dateFilter.dueDate;

  const hasFinanceAccess = [
    "Finance Admin",
    "Finance Emloyee",
    "Master Admin",
    "Super Admin",
  ].some((role) => roles?.includes(role));

  const FINANCE_DEPT_ID = "6798bab0e469e809084e249a";
  if (!hasFinanceAccess && departmentId !== FINANCE_DEPT_ID) {
    query.department = departmentId;
  }

  console.log("Finance Query", query);
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

const fetchVoucherService = async ({ dateFilter, departmentId, roles }) => {
  const query = {
    $or: [
      { "finance.voucher.link": { $exists: true, $ne: "" } },
      { "voucher.link": { $exists: true, $ne: "" } },
    ],
  };

  // const hasFinanceAccess = [
  //   "Finance Admin",
  //   "Finance Emloyee",
  //   "Master Admin",
  //   "Super Admin",
  // ].some((role) => roles?.includes(role));

  const FINANCE_DEPT_ID = "6798bab0e469e809084e249a";
  if (!departmentId.equals(FINANCE_DEPT_ID)) {
    query.department = departmentId;
  }

  if (dateFilter) query.dueDate = dateFilter.dueDate;

  console.log("voucher query", query);
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
      gstin: budget?.gstIn || "-",
      reimbursementDate: budget?.reimbursementDate || null,
      preApproved: budget?.preApproved ?? false,
      emergencyApproval: budget?.emergencyApproval ?? false,
      budgetApproval: budget?.budgetApproval ?? false,
      l1Approval: budget?.l1Approval ?? false,
      financeSrNo: budget?.finance?.fSrNo || budget?.srNo || "-",
      modeOfPayment: budget?.finance?.modeOfPayment || "-",
      chequeNo: budget?.finance?.chequeNo || "-",
      chequeDate: budget?.finance?.chequeDate || null,
      advanceAmount: budget?.finance?.advanceAmount ?? "-",
      approvedAt: budget?.finance?.approvedAt || null,
      expectedDateInvoice: budget?.finance?.expectedDateInvoice || null,
      financeParticulars: budget?.finance?.particulars || [],
      voucherName: budget?.voucher?.name || "-",
      voucherDate: budget?.voucher?.date || null,
      voucherFile: budget?.voucher?.link || "-",
      voucherSrNo: budget?.srNo || "-",
      financeVoucherName: budget?.finance?.voucher?.name || "-",
      financeVoucherDate: budget?.finance?.voucher?.date || null,
      financeVoucherFile: budget?.finance?.voucher?.link || "-",
      financeVoucherSrNo: budget?.finance?.fSrNo || "-",
    };
  });

  return { allBudgets: vouchers };
};

module.exports = {
  fetchBudgetVoucherService,
  fetchBudgetService,
  fetchVoucherService,
};
