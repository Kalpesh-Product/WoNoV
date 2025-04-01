const Company = require("../../models/hr/Company");
const mongoose = require("mongoose");
const { createLog } = require("../../utils/moduleLogs");
const CustomError = require("../../utils/customErrorlogs");

const addLeaveType = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Add Leave Type";
  const logSourceKey = "companyData";
  const { leaveType } = req.body;
  const { user, ip, company } = req;

  try {
    if (!company || !leaveType) {
      throw new CustomError(
        "All fields are required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(company)) {
      throw new CustomError(
        "Invalid company provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      { _id: company },
      {
        $push: {
          leaveTypes: { name: leaveType },
        },
      },
      { new: true }
    );

    if (!updatedCompany) {
      throw new CustomError(
        "Couldn't add leave type",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Leave type added successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updatedCompany._id,
      changes: { leaveType },
    });

    return res.status(200).json({ message: "Leave type added successfully" });
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

module.exports = { addLeaveType };
