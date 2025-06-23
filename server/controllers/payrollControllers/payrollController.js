const { default: mongoose } = require("mongoose");
const Payroll = require("../../models/Payroll");
const User = require("../../models/hr/UserData");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const { PDFDocument } = require("pdf-lib");
const { handleDocumentUpload } = require("../../config/cloudinaryConfig");
const Payslip = require("../../models/Payslip");
const Company = require("../../models/hr/Company");

// const generatePayroll = async (req, res, next) => {
//   const logPath = "hr/HrLog";
//   const logAction = "Generate Payroll";
//   const logSourceKey = "payroll";
//   const { user, ip, company } = req;
//   try {
//     const { totalSalary, reimbursment } = req.body;
//     const { userId } = req.params;
//     const file = req.file;

//     if (!totalSalary || !userId) {
//       throw new CustomError(
//         "Missing required fields",
//         logPath,
//         logAction,
//         logSourceKey
//       );
//     }

//     if (!req.file) {
//       throw new CustomError(
//         "Payslip required",
//         logPath,
//         logAction,
//         logSourceKey
//       );
//     }

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       throw new CustomError(
//         "Invalid user ID",
//         logPath,
//         logAction,
//         logSourceKey
//       );
//     }

//     const foundUser = await User.findOne({ _id: userId }).lean().exec();
//     if (!foundUser) {
//       throw new CustomError(
//         "No such user found",
//         logPath,
//         logAction,
//         logSourceKey
//       );
//     }

//     const foundCompany = await Company.findById({ _id: company }).lean().exec();

//     if (!foundCompany) {
//       throw new CustomError(
//         "Company not found",
//         logPath,
//         logAction,
//         logSourceKey
//       );
//     }

//     //Upload payslip
//     const allowedMimeTypes = [
//       "application/pdf",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     ];

//     if (!allowedMimeTypes.includes(file.mimetype)) {
//       throw new CustomError(
//         "Invalid file type",
//         logPath,
//         logAction,
//         logSourceKey
//       );
//     }

//     let processedBuffer = file.buffer;
//     const originalFilename = file.originalname;

//     if (file.mimetype === "application/pdf") {
//       const pdfDoc = await PDFDocument.load(file.buffer);
//       pdfDoc.setTitle(originalFilename.split(".")[0] || "Untitled");
//       processedBuffer = await pdfDoc.save();
//     }

//     const response = await handleDocumentUpload(
//       processedBuffer,
//       `${foundCompany.companyName}/payrolls/${foundUser.empId}`,
//       originalFilename
//     );

//     if (!response.public_id) {
//       throw new CustomError(
//         "Failed to upload payslip",
//         logPath,
//         logAction,
//         logSourceKey
//       );
//     }

//     const payslip = {
//       name: originalFilename,
//       link: response.secure_url,
//       id: response.public_id,
//     };

//     const employeePayslips = await Payslip({ employee: userId });

//     const payslips = employeePayslips.payslips || [];

//     payslips.push(payslip);
//     const newPayslip = new Payslip({
//       employee: userId,
//       payslips,
//     });

//     const savedPayslip = await newPayslip.save();

//     if (!savedPayslip) {
//       throw new CustomError(
//         "Failed to save payslip",
//         logPath,
//         logAction,
//         logSourceKey
//       );
//     }

//     const newPayroll = new Payroll({
//       employee: userId,
//       reimbursment: reimbursment || 0,
//       totalSalary,
//       payslip: savedPayslip._id,
//       status: "Completed",
//     });

//     const savedPayroll = await newPayroll.save();

//     if (!savedPayroll) {
//       throw new CustomError(
//         "Failed to save payroll",
//         logPath,
//         logAction,
//         logSourceKey
//       );
//     }

//     await createLog({
//       path: logPath,
//       action: logAction,
//       remarks: "Payroll generated successfully",
//       status: "Success",
//       user: user,
//       ip: ip,
//       company: company,
//       sourceKey: logSourceKey,
//       sourceId: savedPayroll._id,
//       changes: newPayroll,
//     });

//     return res.status(200).json({ message: "Payroll generated successfully" });
//   } catch (error) {
//     if (error instanceof CustomError) {
//       next(error);
//     } else {
//       next(
//         new CustomError(error.message, logPath, logAction, logSourceKey, 500)
//       );
//     }
//   }
// };

const generatePayroll = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Bulk Payroll Generation";
  const logSourceKey = "payroll";
  const { user, ip, company } = req;

  //payroll = [{userId,totalSalary,deductions:[],month}]
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

      if (!userId || !month || !totalSalary) {
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
        `${foundCompany.companyName}/payrolls/${foundUser.empId}`,
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

module.exports = { generatePayroll };
