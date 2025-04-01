const Company = require("../../models/hr/Company");
const mongoose = require("mongoose");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");

const addShift = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Add Shift";
  const logSourceKey = "companyData";
  const { user, ip, company } = req;
  const { shiftName, startTime, endTime } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(company)) {
      throw new CustomError(
        "Invalid company Id provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundCompany = await Company.findOne({ _id: company }).lean().exec();
    if (!foundCompany) {
      throw new CustomError(
        "No such company exists",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const updatedCompany = await Company.updateOne(
      { _id: company },
      {
        $push: {
          shifts: {
            name: shiftName,
            startTime,
            endTime,
          },
        },
      }
    );

    if (!updatedCompany) {
      throw new CustomError(
        "Failed to add shifts",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Work shift added successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updatedCompany._id,
      changes: { shift: shiftName },
    });

    return res.status(200).json({ message: "Work shift added successfully" });
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

module.exports = { addShift };
