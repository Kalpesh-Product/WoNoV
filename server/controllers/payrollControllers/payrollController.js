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

    const employees = await User.find({
      company,
      isActive: true,
      "payrollInformation.payrollBatch": batchName,
    })
      .select(
        "firstName lastName empId payrollInformation payrollCompensation salaryPackage"
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
          return label.includes("tax")
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
        const employeeLossOfPay =
          scheduledDays > 0 ? (annualCtc / 12 / scheduledDays) * lopDays : 0;
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
          lossOfPay: employeeLossOfPay,
          incomeTax,
          surcharge: 0,
          cess: 0,
          netAmount,
        });

        summary.grossAmount += gross;
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
};
