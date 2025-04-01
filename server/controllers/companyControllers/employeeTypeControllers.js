const Company = require("../../models/hr/Company");
const mongoose = require("mongoose");
const { createLog } = require("../../utils/moduleLogs");
const CustomError = require("../../utils/customErrorlogs");

const addEmployeeType = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Add Employee Type";
  const logSourceKey = "companyData";
  const { employeeType } = req.body;
  const { user, ip, company } = req;

  try {
    if (!company || !employeeType) {
      throw new CustomError(
        "Missing fields (company or employeeType)",
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

    const updateEmployeeType = await Company.findByIdAndUpdate(
      { _id: company },
      {
        $push: {
          employeeTypes: { name: employeeType },
        },
      },
      { new: true }
    );

    if (!updateEmployeeType) {
      throw new CustomError(
        "Couldn't add employee type",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Employee type added successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updateEmployeeType._id,
      changes: { employeeType },
    });

    return res
      .status(200)
      .json({ message: "Employee type added successfully" });
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

module.exports = { addEmployeeType };
