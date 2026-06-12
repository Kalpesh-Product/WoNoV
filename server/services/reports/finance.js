// services/budget.service.js
const User = require("../../models/hr/UserData");
const Budget = require("../../models/budget/Budget");
const MeetingRevenue = require("../../models/sales/MeetingRevenue");
const AlternateRevenue = require("../../models/sales/AlternateRevenue");
const VirtualOfficeRevenue = require("../../models/sales/VirtualOfficeRevenue");
const WorkationRevenue = require("../../models/sales/WorkationRevenue");
const CoworkingRevenue = require("../../models/sales/CoworkingRevenue");
const dayjs = require("dayjs");

const fetchBudgetVoucherService = async ({
  company,
  dateFilter,
  departmentId,
  type = "",
}) => {
  const query = { company };

  console.log("type", type);
  console.log("departmentId", departmentId);
  if (departmentId && type !== "payout") {
    query.department = departmentId;
  }

  if (dateFilter) {
    query.dueDate = dateFilter.dueDate;
  }
  console.log("budget voucher query", query);

  let budgetQuery = Budget.find(query);

  if (type === "payout") {
    budgetQuery = budgetQuery
      .select(
        "expanseName expanseType actualAmount dueDate status department unit",
      )
      .populate([
        { path: "department", select: "name" },
        { path: "unit", select: "unitNo" },
      ]);
  }

  const budgets = await budgetQuery
    .populate([
      { path: "department", select: "name" },
      { path: "unit", populate: { path: "building", model: "Building" } },
    ])
    .lean()
    .exec();

  // const budgets = await Budget.find(query)
  //   .populate([
  //     { path: "department", select: "name" },
  //     { path: "unit", populate: { path: "building", model: "Building" } },
  //   ])
  //   .lean()
  //   .exec();

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
  type,
  company,
  isReport = false,
}) => {
  const query = { expanseType: { $ne: "Reimbursement" }, company };

  if (dateFilter) query.dueDate = dateFilter.dueDate;

  if (type !== "overall") {
    query.department = departmentId;
  }

  if (type) {
    const typeValue =
      type === "electricity"
        ? "ELECTRICITY"
        : type === "statutory"
          ? "statutory payments"
          : "";

    if (typeValue) {
      query.expanseType = { $regex: typeValue, $options: "i" };
    }
  }

  console.log("budget query report", query);
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

const excludedMonths = ["Jan-24", "Feb-24", "Mar-24"];

// Keep report income aligned with the Overall Profit Loss dashboard, which
// reports taxable/net income where that field is available.
const meetingIncomeValueExpr = { $ifNull: ["$taxable", 0] };
const taxableIncomeValueExpr = { $ifNull: ["$taxableAmount", 0] };
const revenueIncomeValueExpr = { $ifNull: ["$revenue", 0] };
const virtualOfficeIncomeValueExpr = {
  $cond: [
    { $ne: [{ $ifNull: ["$taxableAmount", 0] }, 0] },
    "$taxableAmount",
    { $ifNull: ["$revenue", 0] },
  ],
};

const expenseValueExpr = { $ifNull: ["$actualAmount", 0] };

// Extracts a { $gte, $lte } range regardless of how buildDateFilter nested it
// Handles: { $gte, $lte } directly, OR { dueDate: { $gte, $lte } }
const extractDateRange = (dateFilter = {}) => {
  if (!dateFilter || typeof dateFilter !== "object") return null;
  if (dateFilter.$gte || dateFilter.$lte) return dateFilter;

  const nested = Object.values(dateFilter).find(
    (v) => v && typeof v === "object" && (v.$gte || v.$lte),
  );
  return nested || null;
};

// Generates ["Jan-26", "Feb-26", "Mar-26", "Apr-26", "May-26"] style month list
const generateMonthRange = (range) => {
  if (!range || (!range.$gte && !range.$lte)) return null;

  const start = dayjs(range.$gte || range.$lte).startOf("month");
  const end = dayjs(range.$lte || range.$gte).startOf("month");

  const months = [];
  let cursor = start;
  while (cursor.isBefore(end) || cursor.isSame(end)) {
    months.push(cursor.format("MMM-YY"));
    cursor = cursor.add(1, "month");
  }
  return months;
};

// const monthlyAggregate = (
//   Model,
//   dateField,
//   valueExpr,
//   company,
//   dateRange,
//   type = "",
// ) => {
//   const match = { company };

const monthlyAggregate = (
  Model,
  dateField,
  valueExpr,
  company,
  dateRange,
  additionalMatch = {},
) => {
  const match = { company, ...additionalMatch };

  if (dateRange && (dateRange.$gte || dateRange.$lte)) {
    match[dateField] = dateRange;
  }

  return Model.aggregate([
    { $match: match },
    {
      $project: {
        monthKey: {
          $concat: [
            { $dateToString: { format: "%b", date: `$${dateField}` } },
            "-",
            {
              $substr: [
                { $dateToString: { format: "%Y", date: `$${dateField}` } },
                2,
                2,
              ],
            },
          ],
        },
        amount: valueExpr,
      },
    },
    // { $group: { _id: "$monthKey", total: { $sum: "$amount" } } },
    {
      $group: {
        _id: "$monthKey",
        total: { $sum: "$amount" },
        totalEntries: { $sum: 1 },
        values: { $push: "$amount" },
      },
    },
  ]);
};

const logProfitLossSourceCalculation = (source, monthlyData) => {
  const includedMonthlyData = monthlyData.filter(
    ({ _id: month }) => !excludedMonths.includes(month),
  );

  console.log(`[ProfitLossReport] ${source} calculation`, {
    totalEntries: includedMonthlyData.reduce(
      (sum, { totalEntries = 0 }) => sum + totalEntries,
      0,
    ),
    values: includedMonthlyData.flatMap(({ _id: month, values = [] }) =>
      values.map((value) => ({ month, value })),
    ),
    total: includedMonthlyData.reduce((sum, { total = 0 }) => sum + total, 0),
  });
};

const fetchProfitLossReportService = async ({ company, dateFilter }) => {
  const dateRange = extractDateRange(dateFilter);

  const [
    meetingRevenue,
    alternateRevenue,
    virtualOfficeRevenue,
    workationRevenue,
    coworkingRevenue,
    expense,
  ] = await Promise.all([
    monthlyAggregate(
      MeetingRevenue,
      "date",
      meetingIncomeValueExpr,
      company,
      dateRange,
    ),
    monthlyAggregate(
      AlternateRevenue,
      "invoiceCreationDate",
      taxableIncomeValueExpr,
      company,
      dateRange,
    ),
    monthlyAggregate(
      VirtualOfficeRevenue,
      "rentDate",
      virtualOfficeIncomeValueExpr,
      company,
      dateRange,
    ),
    monthlyAggregate(
      WorkationRevenue,
      "date",
      taxableIncomeValueExpr,
      company,
      dateRange,
    ),
    monthlyAggregate(
      CoworkingRevenue,
      "rentDate",
      revenueIncomeValueExpr,
      company,
      dateRange,
    ),
    monthlyAggregate(Budget, "dueDate", expenseValueExpr, company, dateRange, {
      status: "Approved",
    }),
  ]);

  [
    ["Meeting revenue", meetingRevenue],
    ["Alternate revenue", alternateRevenue],
    ["Virtual office revenue", virtualOfficeRevenue],
    ["Workation revenue", workationRevenue],
    ["Coworking revenue", coworkingRevenue],
    ["Approved budget expense", expense],
  ].forEach(([source, monthlyData]) =>
    logProfitLossSourceCalculation(source, monthlyData),
  );

  // Merge income sources
  const incomeMap = {};
  [
    meetingRevenue,
    alternateRevenue,
    virtualOfficeRevenue,
    workationRevenue,
    coworkingRevenue,
  ].forEach((sourceArr) => {
    sourceArr.forEach(({ _id: month, total }) => {
      if (excludedMonths.includes(month)) return;
      incomeMap[month] = (incomeMap[month] || 0) + total;
    });
  });

  // Build expense map
  const expenseMap = {};
  expense.forEach(({ _id: month, total }) => {
    if (excludedMonths.includes(month)) return;
    expenseMap[month] = (expenseMap[month] || 0) + total;
  });

  // Months to display: prefer the requested date range, fall back to
  // whatever months actually have data if no range was supplied
  const allMonths =
    generateMonthRange(dateRange) ||
    Array.from(
      new Set([...Object.keys(incomeMap), ...Object.keys(expenseMap)]),
    );

  return allMonths
    .filter((month) => !excludedMonths.includes(month))
    .map((month) => {
      const income = incomeMap[month] || 0;
      const expenseTotal = expenseMap[month] || 0;
      return {
        month,
        income,
        expense: expenseTotal,
        pnl: income - expenseTotal,
      };
    });
};

module.exports = {
  fetchBudgetVoucherService,
  fetchBudgetService,
  fetchVoucherService,
  fetchProfitLossReportService,
};
