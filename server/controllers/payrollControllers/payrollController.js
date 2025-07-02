const { default: mongoose } = require("mongoose");
const Payroll = require("../../models/payrolls/Payroll");
const User = require("../../models/hr/UserData");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const { PDFDocument } = require("pdf-lib");
const { handleDocumentUpload } = require("../../config/cloudinaryConfig");
const Payslip = require("../../models/Payslip");
const Company = require("../../models/hr/Company");
const { startOfMonth, isSameMonth } = require("date-fns");
const Leave = require("../../models/hr/Leaves");
const Attendance = require("../../models/hr/Attendance");

const generatePayroll = async (req, res, next) => {
  const logPath = "payrolls/PayrollLog";
  const logAction = "Bulk Payroll Generation";
  const logSourceKey = "payroll";
  const { user, ip, company } = req;

  //payrolls = [{userId,totalSalary,deductions:[],month}]
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
        totalSalary,
        reimbursment = 0,
        deductions = [],
        earnings = {}, // { basicPay, hra, netPay }
      } = payrolls[i];

      const file = files[i];

      if (!userId || !month || isNaN(totalSalary)) {
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
      });
      if (existing) {
        throw new CustomError(
          `Payroll already exists for user ${userId} in ${month}`,
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
        earnings: {
          basicPay: earnings.basicPay || 0,
          hra: earnings.hra || 0,
          netPay: earnings.netPay,
        },
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
        salary: totalSalary,
        reimbursment,
        deductions,
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

// const fetchPayrolls = async (req, res, next) => {
//   const { company } = req;

//   try {
//     const currentMonthStart = startOfMonth(new Date());

//     // Fetch all users
//     const allUsers = await User.find({ company, isActive: true })
//       .populate("departments")
//       .populate("role")
//       .select("firstName lastName empId email departments role")
//       .lean();

//     // Fetch all payrolls
//     const allPayrolls = await Payroll.find({}).populate("payslip").lean();

//     const payrollMap = {};

//     for (const payroll of allPayrolls) {
//       const empId = payroll.employee.toString();

//       if (!payrollMap[empId]) {
//         payrollMap[empId] = [];
//       }

//       payrollMap[empId].push({
//         month: payroll.month,
//         totalSalary: payroll.salary,
//         reimbursment: payroll.reimbursment,
//         deductions: payroll.deductions,
//         status: payroll.status || "Completed",
//         payslip: payroll.payslip
//           ? {
//               payslipName: payroll.payslip.payslipName,
//               payslipLink: payroll.payslip.payslipLink,
//               earnings: payroll.payslip.earnings,
//               createdAt: payroll.payslip.createdAt,
//             }
//           : null,
//       });
//     }

//     // Build response per user
//     const transformedResponse = allUsers.map((user) => {
//       const userId = user._id.toString();
//       const userPayrolls = payrollMap[userId] || [];

//       // Check if current month already exists
//       const hasCurrentMonth = userPayrolls.some((entry) =>
//         isSameMonth(startOfMonth(new Date(entry.month)), currentMonthStart)
//       );

//       if (!hasCurrentMonth) {
//         userPayrolls.push({
//           month: currentMonthStart,
//           totalSalary: 0,
//           reimbursment: 0,
//           deductions: [],
//           status: "Pending",
//           payslip: null,
//         });
//       }

//       return {
//         employeeId: userId,
//         name: `${user.firstName} ${user.lastName}`,
//         empId: user.empId,
//         email: user.email,
//         departments: user.departments,
//         role: user.role,
//         months: userPayrolls,
//       };
//     });

//     res.status(200).json(transformedResponse);
//   } catch (error) {
//     next(error);
//   }
// };

const fetchPayrolls = async (req, res, next) => {
  const { company } = req;

  try {
    const currentMonthStart = startOfMonth(new Date());

    // Fetch all users
    const allUsers = await User.find({ company, isActive: true })
      .populate("departments")
      .populate("role")
      .select("firstName lastName empId email departments role")
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

      const hasCurrentMonth = userPayrolls.some((entry) =>
        isSameMonth(startOfMonth(new Date(entry.month)), currentMonthStart)
      );

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
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID provided" });
    }

    const attendances = await Attendance.find({ user: userId }).populate({
      path: "user",
      select: "firstName lastName empId email departments role",
      populate: [{ path: "departments" }, { path: "role" }],
    });

    const leaves = await Leave.find({ takenBy: userId }).populate({
      path: "takenBy",
      select: "firstName lastName empId email departments role",
      populate: [{ path: "departments" }, { path: "role" }],
    });

    const paymentBreakup = {
      basicPay: 28000,
      pf: 4000,
    };

    const transformedResponse = { attendances, leaves, paymentBreakup };

    res.status(200).json(transformedResponse);
  } catch (error) {
    next(error);
  }
};

module.exports = { generatePayroll, fetchPayrolls, fetchUserPayroll };
