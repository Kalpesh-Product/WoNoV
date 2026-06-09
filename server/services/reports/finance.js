// services/budget.service.js
const User = require("../../models/hr/UserData");
const Budget = require("../../models/budget/Budget");

const isSameId = (a, b) => String(a) === String(b);

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

const mapBudgetBaseFields = (budget = {}, isReport) => {
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
    ...(budget?.expanseType !== "Reimbursement" && {
      projectedAmount: budget?.projectedAmount,
      paymentType: budget?.paymentType || "-",
    }),
    actualAmount: budget?.actualAmount ?? "-",
    building: budget?.unit?.building?.buildingName,
    unit: budget?.unit?.unitName || "-",
    unitNo: budget?.unit?.unitNo || "-",
    dueDate: budget?.dueDate || null,
    invoiceName: budget?.invoice?.name || "-",
    invoiceFile: budget?.invoice?.link || "-",
    invoiceDate: budget?.invoice?.date || null,
    isExtraBudget: budget?.isExtraBudget ?? false,
    approvalStatus: budget?.status || "-",
    paidStatus: budget?.isPaid || "-",
  };
};

const fetchBudgetService = async ({
  dateFilter,
  departmentId,
  roles,
  isElectricity,
  isReport = false,
  type,
}) => {
  const query = { expanseType: { $ne: "Reimbursement" } };

  if (dateFilter) query.dueDate = dateFilter.dueDate;

  // const FINANCE_DEPT_ID = "6798bab0e469e809084e249a";
  // if (!isSameId(departmentId, FINANCE_DEPT_ID)) {
  //   query.department = departmentId;
  // }

  if (type !== "overall") {
    query.department = departmentId;
  }

  if (isElectricity) {
    query.expanseType = "ELECTRICITY";
  }

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

  return {
    allBudgets: budgets.map((budget) => mapBudgetBaseFields(budget, isReport)),
  };
};

const fetchVoucherService = async ({
  dateFilter,
  departmentId,
  roles,
  type,
}) => {
  const query = {
    $or: [
      { "finance.voucher.link": { $exists: true, $ne: "" } },
      { "voucher.link": { $exists: true, $ne: "" } },
    ],
  };

  // const FINANCE_DEPT_ID = "6798bab0e469e809084e249a";

  // if (!isSameId(departmentId, FINANCE_DEPT_ID)) {
  //   query.department = departmentId;
  // }

  if (type !== "overall") {
    query.department = departmentId;
  }

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
    const totalAmountVoucher = budget.particulars.reduce(
      (acc, curr) => acc + curr.particularAmount,
      0,
    );
    const totalAmountFinance = budget.finance.particulars.reduce(
      (acc, curr) => acc + curr.particularAmount,
      0,
    );

    return {
      ...base,
      gstin: budget?.gstIn || "-",
      reimbursementDate: budget?.reimbursementDate || null,
      preApproved: budget?.preApproved ?? false,
      emergencyApproval: budget?.emergencyApproval ?? false,
      budgetApproval: budget?.budgetApproval ?? false,
      l1Approval: budget?.l1Approval ?? false,
      modeOfPayment: budget?.finance?.modeOfPayment || "-",
      chequeNo: budget?.finance?.chequeNo || "-",
      chequeDate: budget?.finance?.chequeDate || null,
      advanceAmount: budget?.finance?.advanceAmount ?? "-",
      approvedAt: budget?.finance?.approvedAt || null,
      expectedDateInvoice: budget?.finance?.expectedDateInvoice || null,
      voucherSrNo: budget?.srNo || "-",
      voucherName: budget?.voucher?.name || "-",
      voucherDate: budget?.voucher?.date || null,
      voucherParticulars: budget?.particulars || [],
      totalAmountVoucher,
      voucherFile: budget?.voucher?.link || "-",
      financeSrNo: budget?.finance?.fSrNo || budget?.srNo || "-",
      financeVoucherName: budget?.finance?.voucher?.name || "-",
      financeVoucherDate: budget?.finance?.voucher?.date || null,
      financeParticulars: budget?.finance?.particulars || [],
      totalAmountFinance,
      financeVoucherFile: budget?.finance?.voucher?.link || "-",
    };
  });

  return { allBudgets: vouchers };
};

module.exports = {
  fetchBudgetVoucherService,
  fetchBudgetService,
  fetchVoucherService,
};
