const { default: mongoose } = require("mongoose");
const Payroll = require("../../models/Payroll");
const User = require("../../models/hr/UserData");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");

const generatePayroll = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Generate Payroll";
  const logSourceKey = "payroll";
  const { user, ip, company } = req;
  try {
    const { totalSalary, reimbursment } = req.body;
    const { userId } = req.params;

    if (!totalSalary) {
      throw new CustomError(
        "Invalid payroll data",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError(
        "Invalid user ID",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundUser = await User.findOne({ _id: userId }).lean().exec();
    if (!foundUser) {
      throw new CustomError(
        "No such user found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const newPayroll = new Payroll({
      empoloyee: userId, // Note: Ensure the field name is as intended. It might be "employee" if that's the schema.
      reimbursment,
      totalSalary,
    });

    await newPayroll.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Payroll generated successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: newPayroll._id,
      changes: { totalSalary, reimbursment },
    });

    return res.status(200).json({ message: "Payroll generated successfully" });
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
