const { default: mongoose } = require("mongoose");
const Payroll = require("../../models/payrolls/Payroll");
const PayrollDraft = require("../../models/payrolls/PayrollDraft");
const User = require("../../models/hr/UserData");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const { PDFDocument } = require("pdf-lib");
const { handleDocumentUpload } = require("../../config/s3Config");
const Payslip = require("../../models/Payslip");
const Company = require("../../models/hr/Company");
const { startOfMonth, isSameMonth } = require("date-fns");
const Leave = require("../../models/hr/Leaves");
const Attendance = require("../../models/hr/Attendance");
const AttendanceCorrection = require("../../models/hr/AttendanceCorrection");
const MonthlyAttendanceSummary = require("../../models/hr/MonthlyAttendanceSummary");

const allowanceOptions = [
  "Special Allowance",
  "Conveyance Allowance",
  "Medical Allowance",
  "Children Education Allowance",
  "Dearness Allowance",
  "Other Allowance",
  "Arrears",
  "House Rent Allowance",
];
const additionalDeductionOptions = [
  "Adjustments",
  "Voluntary Provident Fund",
  "LWF",
  "Employer LWF",
  "Recovery",
];
const numberValue = (value) => Number(value) || 0;
const roundCurrency = (value) =>
  Math.round((numberValue(value) + Number.EPSILON) * 100) / 100;
const isEnabled = (value) =>
  value === true || ["true", "yes"].includes(String(value).toLowerCase());
const getEmployeePf = (basic) =>
  numberValue(basic) >= 15000 ? 1800 : numberValue(basic) * 0.12;
const getAnnualCtc = (employee) =>
  numberValue(employee?.salaryPackage?.grossAnnual) ||
  numberValue(employee?.salaryPackage?.amount);
const getEmployeeType = (employee) =>
  String(
    employee?.employeeType?.name ||
      employee?.employeeType?.employeeType ||
      employee?.employeeType ||
      ""
  ).toLowerCase();
const isTdsWorker = (employee) => {
  const type = getEmployeeType(employee);
  return type.includes("intern") || type.includes("consultant");
};
const getPayPeriodKey = (date) => {
  const value = new Date(date);
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}`;
};
const recalculateDraftTotals = async (draft) => {
  const rows = draft.employeeSummaries.filter((row) => !row.isExcluded);
  const employeeIds = rows.map((row) => row.employee).filter(Boolean);
  const [employees, companyData] = await Promise.all([
    User.find({ _id: { $in: employeeIds }, company: draft.company })
      .select("payrollInformation salaryPackage employeeType")
      .lean(),
    Company.findById(draft.company).select("employerCosts").lean(),
  ]);
  const employeeById = new Map(
    employees.map((employee) => [String(employee._id), employee])
  );
  const employerCosts = companyData?.employerCosts || {};
  const totals = rows.reduce(
    (result, row) => {
      const employee = employeeById.get(String(row.employee));
      const pfEnabled = isEnabled(employee?.payrollInformation?.includePF);
      const annualCtc = getAnnualCtc(employee);
      const esiEnabled =
        isEnabled(employee?.payrollInformation?.includeEsi) &&
        annualCtc > 0 &&
        annualCtc / 12 < 21000;
      const deductionAmount = (label) =>
        (row.deductionItems || [])
          .filter(
            (item) =>
              String(item.label || "").toLowerCase() === label.toLowerCase()
          )
          .reduce((sum, item) => sum + numberValue(item.amount), 0);

      result.grossAmount += numberValue(row.gross);
      result.incomeTax += numberValue(row.incomeTax);
      result.surcharge += numberValue(row.surcharge);
      result.cess += numberValue(row.cess);
      result.netAmount += numberValue(row.netAmount);
      result.lossOfPay += numberValue(row.lossOfPay);
      result.employeePf += pfEnabled ? deductionAmount("Provident Fund") : 0;
      result.voluntaryProvidentFund += deductionAmount(
        "Voluntary Provident Fund"
      );
      result.employeeEsi += esiEnabled ? deductionAmount("ESI") : 0;
      result.employerPf += pfEnabled
        ? numberValue(employerCosts.employerPf)
        : 0;
      result.employerEsi += esiEnabled
        ? numberValue(employerCosts.employerEsi)
        : 0;
      result.pfEmployeeCount += pfEnabled ? 1 : 0;
      result.esiEmployeeCount += esiEnabled ? 1 : 0;
      return result;
    },
    {
      employeeCount: rows.length,
      grossAmount: 0,
      incomeTax: 0,
      surcharge: 0,
      cess: 0,
      netAmount: 0,
      lossOfPay: 0,
      employeePf: 0,
      employerPf: 0,
      voluntaryProvidentFund: 0,
      pfEmployeeCount: 0,
      employeeEsi: 0,
      employerEsi: 0,
      esiEmployeeCount: 0,
    }
  );
  Object.assign(draft, totals);
  return draft;
};

const createPayrollDraft = async (req, res, next) => {
  try {
    const { company, user } = req;
    const batchName = String(req.body.batchName || "").trim();
    const payPeriod = new Date(`${req.body.payPeriod}-01T00:00:00.000Z`);

    if (!batchName || !req.body.payPeriod || Number.isNaN(payPeriod.getTime())) {
      return res.status(400).json({
        message: "A valid payroll batch and pay period are required",
      });
    }

    const existingDraft = await PayrollDraft.findOne({
      company,
      batchName,
      payPeriod,
    })
      .select("status")
      .lean();
    if (existingDraft?.status === "Processed") {
      return res.status(409).json({
        message: "Processed payroll cannot be recreated or edited",
      });
    }
    const employees = await User.find({
      company,
      isActive: true,
      "payrollInformation.payrollBatch": batchName,
    })
      .select(
        "firstName lastName empId employeeType payrollInformation payrollCompensation salaryPackage"
      )
      .lean();

    if (!employees.length) {
      return res.status(400).json({
        message: "No active employees were found in the selected payroll batch",
      });
    }

    const companyData = await Company.findById(company)
      .select("employerCosts")
      .lean();
    const employeeIds = employees.map((employee) => employee._id);
    const attendanceSummaries = await MonthlyAttendanceSummary.find({
      company,
      employee: { $in: employeeIds },
      month: req.body.payPeriod,
    }).lean();
    const attendanceByEmployee = new Map(
      attendanceSummaries.map((summary) => [
        String(summary.employee),
        summary,
      ])
    );
    const employerCosts = companyData?.employerCosts || {};

    const employeeSummaries = [];
    const totals = employees.reduce(
      (summary, employee) => {
        const compensation = employee.payrollCompensation || {};
        const deductions = Array.isArray(compensation.deductions)
          ? compensation.deductions
          : [];
        const incomeTax = deductions.reduce((total, deduction) => {
          const label = String(deduction.label || "").toLowerCase();
          return label.includes("tax") || label === "tds"
            ? total + (Number(deduction.amount) || 0)
            : total;
        }, 0);
        const deductionAmount = (label) =>
          deductions
            .filter(
              (deduction) =>
                String(deduction.label || "").toLowerCase() ===
                label.toLowerCase()
            )
            .reduce(
              (total, deduction) => total + (Number(deduction.amount) || 0),
              0
            );
        const pfEnabled =
          employee.payrollInformation?.includePF === true ||
          ["true", "yes"].includes(
            String(employee.payrollInformation?.includePF).toLowerCase()
          );
        const annualCtc =
          Number(employee.salaryPackage?.grossAnnual) ||
          Number(employee.salaryPackage?.amount) ||
          0;
        const esiEnabled =
          (employee.payrollInformation?.includeEsi === true ||
            ["true", "yes"].includes(
              String(employee.payrollInformation?.includeEsi).toLowerCase()
            )) &&
          annualCtc > 0 &&
          annualCtc / 12 < 21000;
        const attendance = attendanceByEmployee.get(String(employee._id));
        const scheduledDays = Number(attendance?.scheduledWorkingDays) || 0;
        const lopDays = Number(attendance?.lop) || 0;
        const employeeLossOfPay = roundCurrency(
          scheduledDays > 0 ? (annualCtc / 12 / scheduledDays) * lopDays : 0
        );
        const gross = Number(compensation.grossPay) || 0;
        const basic = Number(compensation.basicPay) || 0;
        const allowances = Number(compensation.totalAllowances) || 0;
        const totalDeductions = deductions.reduce(
          (total, deduction) => total + (Number(deduction.amount) || 0),
          0
        );
        const netAmount = Math.max(
          0,
          (Number(compensation.netPay) || 0) - employeeLossOfPay
        );

        employeeSummaries.push({
          employee: employee._id,
          employeeName:
            [employee.firstName, employee.lastName].filter(Boolean).join(" ") ||
            "N/A",
          employeeId: employee.empId || "N/A",
          gross: Math.max(0, gross - employeeLossOfPay),
          actualGross: gross,
          basic,
          allowances,
          deductions: totalDeductions,
          allowanceItems: (compensation.allowances || []).map((item) => ({
            label: item.label,
            amount: numberValue(item.amount),
          })),
          deductionItems: deductions.map((item) => ({
            label: item.label,
            amount: numberValue(item.amount),
          })),
          lossOfPayDays: lopDays,
          lossOfPay: employeeLossOfPay,
          payrollNotes: "",
          isExcluded: false,
          incomeTax,
          surcharge: 0,
          cess: 0,
          netAmount,
        });

        summary.grossAmount += Math.max(0, gross - employeeLossOfPay);
        summary.incomeTax += incomeTax;
        summary.netAmount += netAmount;
        summary.employeePf += pfEnabled
          ? deductionAmount("Provident Fund")
          : 0;
        summary.voluntaryProvidentFund += deductionAmount(
          "Voluntary Provident Fund"
        );
        summary.employeeEsi += esiEnabled ? deductionAmount("ESI") : 0;
        summary.employerPf += pfEnabled
          ? Number(employerCosts.employerPf) || 0
          : 0;
        summary.employerEsi += esiEnabled
          ? Number(employerCosts.employerEsi) || 0
          : 0;
        summary.pfEmployeeCount += pfEnabled ? 1 : 0;
        summary.esiEmployeeCount += esiEnabled ? 1 : 0;
        summary.lossOfPay += employeeLossOfPay;
        return summary;
      },
      {
        grossAmount: 0,
        incomeTax: 0,
        netAmount: 0,
        lossOfPay: 0,
        employeePf: 0,
        employerPf: 0,
        voluntaryProvidentFund: 0,
        pfEmployeeCount: 0,
        employeeEsi: 0,
        employerEsi: 0,
        esiEmployeeCount: 0,
      }
    );

    const draft = await PayrollDraft.findOneAndUpdate(
      { company, payPeriod, batchName },
      {
        $set: {
          payrollType: "Monthly",
          status: "Draft",
          directDepositStatus: "-",
          employeeCount: employees.length,
          ...totals,
          employeeSummaries,
          surcharge: 0,
          cess: 0,
          createdBy: user,
          runDate: null,
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();

    res.status(201).json({ message: "Payroll draft saved", data: draft });
  } catch (error) {
    next(error);
  }
};

const fetchPayrollDrafts = async (req, res, next) => {
  try {
    const drafts = await PayrollDraft.find({ company: req.company })
      .sort({ payPeriod: -1, createdAt: -1 })
      .lean();
    res.status(200).json(drafts);
  } catch (error) {
    next(error);
  }
};

const fetchPayrollDraft = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.draftId)) {
      return res.status(400).json({ message: "Invalid payroll draft ID" });
    }
    const draft = await PayrollDraft.findOne({
      _id: req.params.draftId,
      company: req.company,
    })
      .populate("createdBy", "firstName lastName")
      .lean();
    if (!draft) {
      return res.status(404).json({ message: "Payroll draft not found" });
    }
    res.status(200).json(draft);
  } catch (error) {
    next(error);
  }
};

const fetchPayrollDraftExport = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.draftId)) {
      return res.status(400).json({ message: "Invalid payroll draft ID" });
    }
    const draft = await PayrollDraft.findOne({
      _id: req.params.draftId,
      company: req.company,
    }).lean();
    if (!draft) return res.status(404).json({ message: "Payroll draft not found" });

    const summaries = (draft.employeeSummaries || []).filter(
      (summary) => !summary.isExcluded
    );
    const employees = await User.find({
      _id: { $in: summaries.map((summary) => summary.employee) },
      company: req.company,
    })
      .select(
        "empId firstName middleName lastName email phone employeeType designation bankInformation panAadhaarDetails payrollInformation salaryPackage payrollCompensation"
      )
      .lean();
    const employeeById = new Map(
      employees.map((employee) => [String(employee._id), employee])
    );
    const formatItems = (items) =>
      (items || [])
        .map((item) => `${item.label}: ${numberValue(item.amount)}`)
        .join("; ");
    const exportRows = summaries.map((summary) => {
      const employee = employeeById.get(String(summary.employee)) || {};
      const bank = employee.bankInformation || {};
      const kyc = employee.panAadhaarDetails || {};
      const payroll = employee.payrollInformation || {};
      const compensation = employee.payrollCompensation || {};
      return {
        employeeId: summary.employeeId || employee.empId || "",
        employeeName:
          summary.employeeName ||
          [employee.firstName, employee.middleName, employee.lastName]
            .filter(Boolean)
            .join(" "),
        email: employee.email || "",
        phone: employee.phone || "",
        designation: employee.designation || "",
        employeeType: employee.employeeType?.name || "",
        aadhaarNumber: kyc.aadhaarId || "",
        panNumber: kyc.pan || "",
        pfAccountNumber: kyc.pfAccountNumber || "",
        pfUan: kyc.pfUAN || "",
        esiAccountNumber: kyc.esiAccountNumber || "",
        bankName: bank.bankName || "",
        branchName: bank.branchName || "",
        nameOnAccount: bank.nameOnAccount || "",
        accountNumber: bank.accountNumber || "",
        bankIfsc: bank.bankIFSC || "",
        includeInPayroll: payroll.includeInPayroll ?? false,
        payrollBatch: payroll.payrollBatch || draft.batchName,
        professionTaxExemption: payroll.professionTaxExemption ?? false,
        includePf: payroll.includePF ?? false,
        pfContributionRate: payroll.pfContributionRate || "",
        employeePfRate: payroll.employeePF || "",
        employerPfRate: payroll.employerPf || "",
        includeEsi: payroll.includeEsi ?? false,
        esiContribution: payroll.esiContribution || "",
        hraType: payroll.hraType || "",
        hraPercentage: payroll.hraPercentage || "",
        tdsCalculationBasedOn: payroll.tdsCalculationBasedOn || "",
        taxPercentage: payroll.taxPercentage || "",
        incomeTaxRegime: payroll.incomeTaxRegime || "",
        paymentMethod: compensation.paymentMethod || "",
        annualCtc: getAnnualCtc(employee),
        payPeriod: getPayPeriodKey(draft.payPeriod),
        payrollStatus: draft.status,
        basicPay: numberValue(summary.basic),
        actualGross: numberValue(summary.actualGross),
        grossAfterLop: numberValue(summary.gross),
        allowances: numberValue(summary.allowances),
        allowanceDetails: formatItems(summary.allowanceItems),
        deductions: numberValue(summary.deductions),
        deductionDetails: formatItems(summary.deductionItems),
        lossOfPayDays: numberValue(summary.lossOfPayDays),
        lossOfPayAmount: numberValue(summary.lossOfPay),
        incomeTax: numberValue(summary.incomeTax),
        surcharge: numberValue(summary.surcharge),
        cess: numberValue(summary.cess),
        netAmount: numberValue(summary.netAmount),
        payrollNotes: summary.payrollNotes || "",
      };
    });
    res.status(200).json(exportRows);
  } catch (error) {
    next(error);
  }
};

const updatePayrollDraftEmployee = async (req, res, next) => {
  try {
    const { draftId, employeeId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(draftId) ||
      !mongoose.Types.ObjectId.isValid(employeeId)
    ) {
      return res.status(400).json({ message: "Invalid payroll draft or employee ID" });
    }

    const draft = await PayrollDraft.findOne({ _id: draftId, company: req.company });
    if (!draft) return res.status(404).json({ message: "Payroll draft not found" });
    if (draft.status !== "Draft") {
      return res.status(409).json({ message: "Only draft payroll can be edited" });
    }

    const summary = draft.employeeSummaries.find(
      (row) => String(row.employee) === employeeId && !row.isExcluded
    );
    if (!summary) {
      return res.status(404).json({ message: "Employee is not part of this payroll draft" });
    }
    const employee = await User.findOne({ _id: employeeId, company: req.company })
      .select("employeeType payrollInformation salaryPackage")
      .lean();
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const rawAllowances = Array.isArray(req.body.allowanceItems)
      ? req.body.allowanceItems
      : summary.allowanceItems;
    const rawDeductions = Array.isArray(req.body.deductionItems)
      ? req.body.deductionItems
      : summary.deductionItems;
    const hraType = String(employee.payrollInformation?.hraType || "")
      .trim()
      .toLowerCase();
    const canUseHra = Boolean(hraType) && hraType !== "custom";
    const validAllowanceOptions = canUseHra
      ? allowanceOptions
      : allowanceOptions.filter((label) => label !== "House Rent Allowance");
    const tdsWorker = isTdsWorker(employee);
    const validDeductionOptions = [
      ...(tdsWorker ? ["TDS"] : ["Provident Fund", "ESI"]),
      ...additionalDeductionOptions,
    ];
    const validateItems = (items, options, section) => {
      const normalized = items.map((item) => ({
        label: String(item.label || "").trim(),
        amount: numberValue(item.amount),
      }));
      if (
        normalized.some(
          (item) => !options.includes(item.label) || item.amount < 0
        ) ||
        new Set(normalized.map((item) => item.label)).size !== normalized.length
      ) {
        throw new Error(`Invalid or duplicate ${section} entries`);
      }
      return normalized;
    };

    let allowanceItems;
    let deductionItems;
    try {
      allowanceItems = validateItems(rawAllowances, validAllowanceOptions, "allowance");
      deductionItems = validateItems(rawDeductions, validDeductionOptions, "deduction");
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    if (canUseHra) {
      const hraAmount = numberValue(summary.basic) * 0.5;
      const hra = allowanceItems.find((item) => item.label === "House Rent Allowance");
      if (hra) hra.amount = hraAmount;
      else allowanceItems.push({ label: "House Rent Allowance", amount: hraAmount });
    }
    const allowanceTotal = allowanceItems.reduce(
      (total, item) => total + numberValue(item.amount),
      0
    );
    const actualGross = numberValue(summary.basic) + allowanceTotal;
    const annualCtc = getAnnualCtc(employee);
    const pfEnabled = isEnabled(employee.payrollInformation?.includePF);
    const esiEnabled =
      isEnabled(employee.payrollInformation?.includeEsi) &&
      annualCtc > 0 &&
      annualCtc / 12 < 21000;
    deductionItems = deductionItems.map((item) => ({
      ...item,
      amount:
        item.label === "Provident Fund"
          ? pfEnabled
            ? getEmployeePf(summary.basic)
            : 0
          : item.label === "ESI"
            ? esiEnabled
              ? actualGross * 0.0075
              : 0
            : item.label === "TDS"
              ? numberValue(summary.basic) * 0.1
              : item.amount,
    }));

    const lossOfPayDays = Math.max(0, numberValue(req.body.lossOfPayDays));
    const attendance = await MonthlyAttendanceSummary.findOne({
      company: req.company,
      employee: employeeId,
      month: getPayPeriodKey(draft.payPeriod),
    })
      .select("scheduledWorkingDays")
      .lean();
    const scheduledDays = numberValue(attendance?.scheduledWorkingDays);
    const lossOfPay = roundCurrency(
      scheduledDays > 0 && annualCtc > 0
        ? (annualCtc / 12 / scheduledDays) * lossOfPayDays
        : numberValue(req.body.lossOfPay ?? summary.lossOfPay)
    );
    const deductionTotal = deductionItems.reduce(
      (total, item) => total + numberValue(item.amount),
      0
    );
    const incomeTax = deductionItems
      .filter((item) => {
        const label = item.label.toLowerCase();
        return label.includes("tax") || label === "tds";
      })
      .reduce((total, item) => total + numberValue(item.amount), 0);
    const gross = Math.max(0, actualGross - lossOfPay);

    Object.assign(summary, {
      allowanceItems,
      deductionItems,
      allowances: allowanceTotal,
      deductions: deductionTotal,
      actualGross,
      gross,
      lossOfPayDays,
      lossOfPay,
      payrollNotes: String(req.body.payrollNotes || "").trim().slice(0, 2000),
      incomeTax,
      netAmount: Math.max(0, gross - deductionTotal),
      updatedBy: req.user,
      updatedAt: new Date(),
    });
    await recalculateDraftTotals(draft);
    await draft.save();
    res.status(200).json({ message: "Employee payroll updated", data: draft });
  } catch (error) {
    next(error);
  }
};

const excludePayrollDraftEmployees = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.draftId)) {
      return res.status(400).json({ message: "Invalid payroll draft ID" });
    }
    const employeeIds = Array.isArray(req.body.employeeIds)
      ? [...new Set(req.body.employeeIds.map(String))]
      : [];
    if (!employeeIds.length || employeeIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: "Select valid employees to delete" });
    }
    const draft = await PayrollDraft.findOne({
      _id: req.params.draftId,
      company: req.company,
    });
    if (!draft) return res.status(404).json({ message: "Payroll draft not found" });
    if (draft.status !== "Draft") {
      return res.status(409).json({ message: "Only draft payroll can be edited" });
    }
    let excludedCount = 0;
    draft.employeeSummaries.forEach((summary) => {
      if (employeeIds.includes(String(summary.employee)) && !summary.isExcluded) {
        summary.isExcluded = true;
        summary.updatedBy = req.user;
        summary.updatedAt = new Date();
        excludedCount += 1;
      }
    });
    if (!excludedCount) {
      return res.status(404).json({ message: "Selected employees were not found in the draft" });
    }
    await recalculateDraftTotals(draft);
    await draft.save();
    res.status(200).json({
      message: `${excludedCount} employee${excludedCount === 1 ? "" : "s"} deleted from payroll draft`,
      data: draft,
    });
  } catch (error) {
    next(error);
  }
};

const submitPayrollDraft = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.draftId)) {
      return res.status(400).json({ message: "Invalid payroll draft ID" });
    }
    const draft = await PayrollDraft.findOne({
      _id: req.params.draftId,
      company: req.company,
    });
    if (!draft) return res.status(404).json({ message: "Payroll draft not found" });
    if (draft.status !== "Draft") {
      return res.status(409).json({ message: "Payroll has already been processed" });
    }
    if (!draft.employeeSummaries.some((summary) => !summary.isExcluded)) {
      return res.status(400).json({ message: "Payroll must contain at least one employee" });
    }
    await recalculateDraftTotals(draft);
    draft.status = "Processed";
    draft.submittedBy = req.user;
    draft.submittedAt = new Date();
    draft.runDate = draft.submittedAt;
    await draft.save();
    res.status(200).json({ message: "Payroll processed successfully", data: draft });
  } catch (error) {
    next(error);
  }
};

const generatePayroll = async (req, res, next) => {
  const logPath = "payrolls/PayrollLog";
  const logAction = "Bulk Payroll Generation";
  const logSourceKey = "payroll";
  const { user, ip, company } = req;

  //payrolls = [{userId,totalSalary,month,reimbursement}]

  //earnings
  // basic: Number,
  //  hra: Number,
  // specialAllowance: Number,
  // bonus: Number,
  // otherAllowance: Number,

  //deductions
  // employeePf: Number,
  // employeesStateInsurance: Number,
  // professionTax: Number,
  // otherDeduction: Number,
  // reduceIncomeTax: Number,

  try {
    const payrolls = JSON.parse(req.body.payrolls);
    const files = req.files || [];

    if (!payrolls || !Array.isArray(payrolls)) {
      throw new CustomError(
        "Payrolls array required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (payrolls.length > 4) {
      throw new CustomError(
        "Maximum 4 payrolls can be processed at once",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const savedPayrolls = [];

    for (let i = 0; i < payrolls.length; i++) {
      const {
        userId,
        month,
        reimbursment = 0,
        //earnings
        basicPay = 0,
        hra = 0,
        netPay = 0,
        specialAllowance = 0,
        otherAllowance = 0,
        bonus = 0,
        //deductions
        employeePf = 0,
        employeesStateInsurance = 0,
        professionTax = 0,
        otherDeduction = 0,
        reduceIncomeTax = 0,
      } = payrolls[i];

      const file = files[i];

      if (!userId || !month || isNaN(netPay)) {
        throw new CustomError(
          `Missing required fields in payroll ${i + 1}`,
          logPath,
          logAction,
          logSourceKey
        );
      }

      if (!file) {
        throw new CustomError(
          `Missing payslip file for payroll ${i + 1}`,
          logPath,
          logAction,
          logSourceKey
        );
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new CustomError(
          `Invalid user ID in payroll ${i + 1}`,
          logPath,
          logAction,
          logSourceKey
        );
      }

      const existing = await Payroll.findOne({
        employee: userId,
        month: new Date(month),
      }).populate("employee", "firstName lastName");
      if (existing) {
        throw new CustomError(
          `Payroll already exists for user ${existing.employee.firstName} ${existing.employee.lastName} in ${month}`,
          logPath,
          logAction,
          logSourceKey,
          409
        );
      }

      const foundUser = await User.findById(userId).lean();
      const foundCompany = await Company.findById(company).lean();

      if (!foundUser)
        throw new CustomError(
          `User not found in payroll ${i + 1}`,
          logPath,
          logAction,
          logSourceKey
        );
      if (!foundCompany)
        throw new CustomError(
          "Company not found",
          logPath,
          logAction,
          logSourceKey
        );

      // Upload File
      const allowedMimeTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new CustomError(
          `Invalid file type in payroll ${i + 1}`,
          logPath,
          logAction,
          logSourceKey
        );
      }

      let processedBuffer = file.buffer;
      const originalFilename = file.originalname;

      if (file.mimetype === "application/pdf") {
        const pdfDoc = await PDFDocument.load(file.buffer);
        pdfDoc.setTitle(originalFilename.split(".")[0] || "Untitled");
        processedBuffer = await pdfDoc.save();
      }

      const uploadResponse = await handleDocumentUpload(
        processedBuffer,
        `${foundCompany.companyName}/payrolls/${foundUser.firstName} ${foundUser.lastName}`,
        originalFilename
      );

      if (!uploadResponse?.public_id) {
        throw new CustomError(
          `Failed to upload payslip in payroll ${i + 1}`,
          logPath,
          logAction,
          logSourceKey
        );
      }

      // Save Payslip
      const payslip = new Payslip({
        employee: userId,
        month: new Date(month),
        basicPay,
        hra,
        netPay,
        specialAllowance,
        otherAllowance,
        bonus,
        employeePf,
        employeesStateInsurance,
        professionTax,
        otherDeduction,
        reduceIncomeTax,
        reimbursment,
        payslipName: originalFilename,
        payslipLink: uploadResponse.secure_url,
        payslipId: uploadResponse.public_id,
        company,
      });

      const savedPayslip = await payslip.save();

      // Save Payroll
      const payroll = new Payroll({
        employee: userId,
        month: new Date(month),
        totalSalary: netPay,
        payslip: savedPayslip._id,
        status: "Completed",
        company,
      });

      const savedPayroll = await payroll.save();
      savedPayrolls.push(savedPayroll);

      // Log
      await createLog({
        path: logPath,
        action: logAction,
        remarks: `Payroll ${i + 1} generated successfully`,
        status: "Success",
        user,
        ip,
        company,
        sourceKey: logSourceKey,
        sourceId: savedPayroll._id,
        changes: payroll,
      });
    }

    return res.status(200).json({
      message: `${savedPayrolls.length} payroll(s) generated successfully`,
      data: savedPayrolls,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

const fetchPayrolls = async (req, res, next) => {
  const { company } = req;

  try {
    const currentMonthStart = startOfMonth(new Date()).toISOString();

    // Fetch all users
    const allUsers = await User.find({ company, isActive: true })
      .populate("departments")
      .populate("role")
      .select(
        "firstName lastName empId email departments role payrollInformation payrollCompensation salaryPackage"
      )
      .lean();

    // Fetch all payrolls
    const allPayrolls = await Payroll.find({}).populate("payslip").lean();

    // Group payrolls by employee
    const payrollMap = {};
    for (const payroll of allPayrolls) {
      const empId = payroll.employee.toString();
      if (!payrollMap[empId]) payrollMap[empId] = [];

      payrollMap[empId].push({
        month: payroll.month,
        totalSalary: payroll.salary,
        reimbursment: payroll.reimbursment,
        deductions: payroll.deductions,
        status: payroll.status || "Completed",
        payslip: payroll.payslip
          ? {
              payslipName: payroll.payslip.payslipName,
              payslipLink: payroll.payslip.payslipLink,
              earnings: payroll.payslip.earnings,
              createdAt: payroll.payslip.createdAt,
            }
          : null,
      });
    }

    // Final flattened list
    const flattenedResponse = [];

    for (const user of allUsers) {
      const userId = user._id.toString();
      const userPayrolls = payrollMap[userId] || [];

      // const hasCurrentMonth = userPayrolls.some((entry) =>

      //   isSameMonth(
      //     startOfMonth(new Date(entry.month)).toISOString(),
      //     currentMonthStart
      //   )
      // );

      const hasCurrentMonth = userPayrolls.some((entry) => {
        const payrollMonthStart = startOfMonth(
          new Date(entry.month)
        ).toISOString();
        return payrollMonthStart === currentMonthStart;
      });

      if (!hasCurrentMonth) {
        userPayrolls.push({
          month: currentMonthStart,
          totalSalary: 0,
          reimbursment: 0,
          deductions: [],
          status: "Pending",
          payslip: null,
        });
      }

      // Now push individual objects per month
      for (const payroll of userPayrolls) {
        flattenedResponse.push({
          employeeId: userId,
          empId: user.empId,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          departments: user.departments,
          role: user.role,
          payrollBatch: user.payrollInformation?.payrollBatch || "",
          payrollCompensation: user.payrollCompensation || {},
          annualCtc:
            user.salaryPackage?.grossAnnual ?? user.salaryPackage?.amount ?? 0,
          month: payroll.month,
          totalSalary: payroll.totalSalary,
          reimbursment: payroll.reimbursment,
          deductions: payroll.deductions,
          status: payroll.status,
          payslip: payroll.payslip,
        });
      }
    }

    res.status(200).json(flattenedResponse);
  } catch (error) {
    next(error);
  }
};

const fetchUserPayroll = async (req, res, next) => {
  const { company } = req;
  const { userId } = req.params;
  const { month } = req.query;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID provided" });
    }

    if (!month) {
      return res.status(400).json({ message: "Month query is required" });
    }

    const monthStart = new Date(month);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const attendances = await Attendance.find({
      user: userId,
      inTime: { $gte: monthStart, $lt: monthEnd },
    }).populate({
      path: "user",
      select: "firstName lastName empId email departments role",
      populate: [{ path: "departments" }, { path: "role" }],
    });

    const attendancesRequests = await AttendanceCorrection.find({
      user: userId,
      company,
      status: "Pending",
    }).lean();

    let transformedAttendances = attendances.map((attendance) => ({
      ...attendance._doc,
      correctionId: null,
    }));

    if (attendancesRequests?.length > 0) {
      transformedAttendances = attendances.map((attendance) => {
        const matchingRequest = attendancesRequests.find((request) => {
          const isPending = attendance.status === "Pending";
          const matchedAttendance =
            new Date(attendance.inTime).toString() ===
              new Date(request.originalInTime).toString() ||
            new Date(attendance.outTime).toString() ===
              new Date(request.originalOutTime).toString();
          return matchedAttendance && isPending;
        });

        return {
          ...attendance._doc,
          correctionId: matchingRequest ? matchingRequest._id : null,
        };
      });
    }

    const leaves = await Leave.find({
      takenBy: userId,
      fromDate: { $gte: monthStart, $lt: monthEnd },
    }).populate({
      path: "takenBy",
      select: "firstName lastName empId email departments role",
      populate: [{ path: "departments" }, { path: "role" }],
    });

    const payslip = await Payslip.findOne({
      employee: userId,
      month: { $gte: monthStart, $lt: monthEnd },
    });

    const earnings = {
      basicPay: payslip?.basicPay || 0,
      hra: payslip?.hra || 0,
      netPay: payslip?.netPay || 0,
      specialAllowance: payslip?.specialAllowance || 0,
      otherAllowance: payslip?.otherAllowance || 0,
      bonus: payslip?.bonus || 0,
    };
    const deductions = {
      employeePf: payslip?.employeePf || 0,
      employeesStateInsurance: payslip?.employeesStateInsurance || 0,
      professionTax: payslip?.professionTax || 0,
      reduceIncomeTax: payslip?.reduceIncomeTax || 0,
      otherDeduction: payslip?.otherDeduction || 0,
      adjustments: payslip?.adjustments || 0,
      additionalIncomeTax: payslip?.additionalIncomeTax || 0,
      voluntaryProvidentFund: payslip?.voluntaryProvidentFund || 0,
      lwf: payslip?.lwf || 0,
      recovery: payslip?.recovery || 0,
    };

    res.status(200).json({
      attendances: transformedAttendances,
      leaves,
      earnings,
      deductions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generatePayroll,
  fetchPayrolls,
  fetchUserPayroll,
  createPayrollDraft,
  fetchPayrollDrafts,
  fetchPayrollDraft,
  fetchPayrollDraftExport,
  updatePayrollDraftEmployee,
  excludePayrollDraftEmployees,
  submitPayrollDraft,
};
