const Budget = require("../../models/budget/Budget");
const User = require("../../models/hr/UserData");
const Company = require("../../models/hr/Company");
const CustomError = require("../../utils/customErrorlogs");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const { createLog } = require("../../utils/moduleLogs");

const requestBudget = async (req, res, next) => {
  const logPath = "/budget/BudgetLog";
  const logAction = "Request Budget";
  const logSourceKey = "budget";
  const { user, ip, company } = req;

  try {
    const { projectedAmount, expanseName, month, typeOfBudget, isExtraBudget } =
      req.body;
    const { departmentId } = req.params;

    if (!projectedAmount || !expanseName || !month || !typeOfBudget) {
      throw new CustomError(
        "Invalid budget data",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundUser = await User.findOne({ _id: user })
      .select("company")
      .lean()
      .exec();
    if (!foundUser) {
      throw new CustomError("Unauthorized", logPath, logAction, logSourceKey);
    }

    const companyDoc = await Company.findOne({ _id: foundUser.company })
      .select("selectedDepartments")
      .populate([{ path: "selectedDepartments.department", select: "name" }])
      .lean()
      .exec();
    if (!companyDoc) {
      throw new CustomError(
        "Company not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const departmentExists = companyDoc.selectedDepartments.find(
      (dept) => dept.department._id.toString() === departmentId
    );
    if (!departmentExists) {
      throw new CustomError(
        "You haven't selected this department",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const newBudgetRequest = new Budget({
      expanseName,
      projectedAmount,
      department: departmentId,
      company: companyDoc._id,
      month,
      typeOfBudget,
      isExtraBudget: isExtraBudget || false, // Default to false
      status: "Pending",
    });

    await newBudgetRequest.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: `Budget requested for ${departmentExists.department.name}`,
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: newBudgetRequest._id,
      changes: {
        projectedAmount,
        actualAmount,
        expanseName,
        month,
        typeOfBudget,
        isExtraBudget,
      },
    });

    return res.status(200).json({
      message: `Budget requested for ${departmentExists.department.name}`,
    });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500)
    );
  }
};

const fetchBudget = async (req, res, next) => {
  try {
    const { departmentId } = req.query;
    const { user } = req;

    const foundUser = await User.findOne({ _id: user })
      .select("company")
      .populate([{ path: "company", select: "companyName" }])
      .lean()
      .exec();

    if (!foundUser) {
      return res.status(400).json({ message: "No user found" });
    }

    const query = { company: foundUser.company };
    if (departmentId) {
      query.department = departmentId;
    }

    const allBudgets = await Budget.find(query)
      .populate([{ path: "department", select: "name" }])
      .lean()
      .exec();

    res.status(200).json({ allBudgets });
  } catch (error) {
    next(error);
  }
};

const bulkInsertBudgets = async (req, res, next) => {
  try {
    const logPath = "BulkInsertLogs";
    const logAction = "Bulk insert for Budget";
    const { user, ip, company } = req;
    const { departmentId } = req.params;

    if (!req.file) {
      throw new CustomError(
        "CSV file was not provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const budgets = [];
    const stream = Readable.from(req.file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const projectedAmt = parseFloat(row["Projected Amount"]);
        const actualAmt = row["Actual Amount"]
          ? parseFloat(row["Actual Amount"])
          : 0;
        const parsedMonth = new Date(row["Month"]);

        if (
          isNaN(projectedAmt) ||
          isNaN(actualAmt) ||
          isNaN(parsedMonth.getTime())
        ) {
          return; // Skip invalid rows
        }

        budgets.push({
          company,
          department: departmentId,
          expanseName: row["Expanse Name"],
          projectedAmount: projectedAmt,
          actualAmount: actualAmt,
          status: row["Status"] || "Pending",
          month: parsedMonth,
          typeOfBudget: row["Type Of Budget"],
        });
      })
      .on("end", async () => {
        if (budgets.length === 0) {
          return next(
            new CustomError(
              "No valid budgets found in CSV file",
              logPath,
              logAction,
              logSourceKey
            )
          );
        }

        await Budget.insertMany(budgets);
        await createLog({
          path: logPath,
          action: logAction,
          remarks: "Bulk inserted budgets in the database",
          status: "Success",
          user: user,
          ip: ip,
          company: company,
        });
    

        res.status(201).json({
          success: true,
          message: "Budgets uploaded successfully",
          data: budgets,
        });
      });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(
            error.message,
            "BudgetLogs",
            "Request Budget",
            "budget",
            500
          )
    );
  }
};
module.exports = {
  requestBudget,
  fetchBudget,
  bulkInsertBudgets,
};
