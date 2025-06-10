const Budget = require("../../models/budget/Budget");
const User = require("../../models/hr/UserData");
const Company = require("../../models/hr/Company");
const CustomError = require("../../utils/customErrorlogs");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const { createLog } = require("../../utils/moduleLogs");
const Unit = require("../../models/locations/Unit");
const { default: mongoose } = require("mongoose");
const { PDFDocument } = require("pdf-lib");
const {
  handleDocumentUpload,
  handleFileDelete,
} = require("../../config/cloudinaryConfig");

const requestBudget = async (req, res, next) => {
  const logPath = "/budget/BudgetLog";
  const logAction = "Request Budget";
  const logSourceKey = "budget";
  const { user, ip, company } = req;

  try {
    const {
      projectedAmount,
      expanseName,
      dueDate,
      expanseType,
      paymentType,
      unitId,
      invoiceAttached,
      preApproved,
      emergencyApproval,
      budgetApproval,
      l1Approval,
      invoiceDate,
      reimbursementDate,
      srNo,
      particulars,
    } = req.body;
    const { departmentId } = req.params;

    if (!projectedAmount || !expanseName || !expanseType || !unitId) {
      throw new CustomError(
        "Invalid budget data",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const parsedDueDate =
      expanseType !== "Reimbursement" ? new Date(dueDate) : new Date();
    const parsedInvoiceDate = invoiceDate ? new Date(invoiceDate) : null;
    const parsedReimbursementDate = reimbursementDate
      ? new Date(reimbursementDate)
      : null;

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
      dueDate: parsedDueDate,
      invoiceDate: parsedInvoiceDate,
      reimbursementDate: parsedReimbursementDate,
      expanseType,
      paymentType,
      unit: unitId,
      status: "Pending",
      invoiceAttached,
      preApproved,
      emergencyApproval,
      budgetApproval,
      l1Approval,
      srNo,
      particulars,
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
        expanseName,
        dueDate,
        expanseType,
        paymentType,
        isExtraBudget: false,
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
      .populate([
        { path: "department", select: "name" },
        { path: "unit", populate: { path: "building", model: "Building" } },
      ])
      .lean()
      .exec();

    // const transformbudgets = allBudgets.map((budget)=>{
    //   const particularsTotalAmount = 0
    //   if(budget.particulars.length > 0){
    //     particularsTotalAmount =
    //   }
    //   return {
    //     ...budget
    //   }
    // })

    res.status(200).json({ allBudgets });
  } catch (error) {
    next(error);
  }
};

const fetchLandlordPayments = async (req, res, next) => {
  try {
    const { unit } = req.query;
    const { user, company } = req;
    const query = { company, expanseType: "Monthly Rent" };

    let foundUnit;

    if (unit) {
      const foundUnit = await Unit.findOne({ unitNo: unit });

      if (!foundUnit) {
        return res.status(400).json({ message: "No unit found" });
      }
      query.unit = foundUnit._id;
    }

    const allBudgets = await Budget.find(query)
      .populate([
        { path: "department", select: "name" },
        { path: "unit", populate: { path: "building", model: "Building" } },
      ])
      .lean()
      .exec();

    res.status(200).json({ allBudgets });
  } catch (error) {
    next(error);
  }
};

const approveBudget = async (req, res, next) => {
  const logPath = "budget/BudgetLog";
  const logAction = "Approve Budget";
  const logSourceKey = "budget";

  try {
    const { budgetId } = req.params;
    console.log("budget id:", budgetId);
    const { user, ip, company } = req;

    const foundUser = await User.findOne({ _id: user })
      .select("company")
      .populate([{ path: "company", select: "companyName" }])
      .lean()
      .exec();

    if (!foundUser) {
      throw new CustomError("No user found", logPath, logAction, logSourceKey);
    }

    const approvedBudget = await Budget.findByIdAndUpdate(
      { _id: budgetId },
      { status: "Approved" },
      { new: true }
    );

    if (!approvedBudget) {
      throw new CustomError(
        "Failed to approve the budget,please try again",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Budget Approved",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: approvedBudget._id,
      changes: { status: "Approved" },
    });

    res.status(200).json({ message: "Budget Approved" });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500)
    );
  }
};

const rejectBudget = async (req, res, next) => {
  const logPath = "budget/BudgetLog";
  const logAction = "Reject Budget";
  const logSourceKey = "budget";

  try {
    const { budgetId } = req.params;
    const { user, ip, company } = req;

    const foundUser = await User.findOne({ _id: user })
      .select("company")
      .populate([{ path: "company", select: "companyName" }])
      .lean()
      .exec();

    if (!foundUser) {
      throw new CustomError("No user found", logPath, logAction, logSourceKey);
    }

    const rejectedBudget = await Budget.findByIdAndUpdate(
      { _id: budgetId },
      { status: "Rejected" },
      { new: true }
    );

    if (!rejectedBudget) {
      throw new CustomError(
        "Failed to reject the budget,please try again",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Budget Rejected",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: rejectedBudget._id,
      changes: { status: "Rejected" },
    });

    res.status(200).json({ message: "Budget Rejected" });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500)
    );
  }
};

const uploadInvoice = async (req, res, next) => {
  const logPath = "budget/BudgetLog";
  const logAction = "Upload Invoice";
  const logSourceKey = "budget";
  const { invoiceName, departmentName } = req.body;
  const file = req.file;
  const { user, ip, company } = req;
  const { budgetId } = req.params;

  try {
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    ];

    if (!mongoose.Types.ObjectId.isValid(budgetId)) {
      throw new CustomError(
        "Invalid budget Id provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new CustomError(
        "Invalid file type. Allowed types: PDF, DOC, DOCX",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundCompany = await Company.findById({ _id: company });

    if (!foundCompany) {
      throw new CustomError(
        "Company not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundBudget = await Budget.findById({ _id: budgetId });

    if (!foundBudget) {
      throw new CustomError(
        "No such budget found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (foundBudget.invoice && foundBudget.invoice.id) {
      console.log("Invoice exists", foundBudget.invoice.id);
      await handleFileDelete(foundBudget.invoice.id);
    }

    let processedBuffer = file.buffer;
    const originalFilename = file.originalname;

    // Process PDF: set document title
    if (file.mimetype === "application/pdf") {
      const pdfDoc = await PDFDocument.load(file.buffer);
      pdfDoc.setTitle(
        file.originalname ? file.originalname.split(".")[0] : "Untitled"
      );
      processedBuffer = await pdfDoc.save();
    }

    const response = await handleDocumentUpload(
      processedBuffer,
      `${foundCompany.companyName}/departments/${departmentName}/budget/invoice`,
      originalFilename
    );

    if (!response.public_id) {
      throw new CustomError(
        "Failed to upload document",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const updatedBudget = await Budget.findOneAndUpdate(
      {
        _id: budgetId,
      },
      {
        $set: {
          invoice: {
            name: invoiceName,
            link: response.secure_url,
            id: response.public_id,
            date: new Date(),
          },
        },
        invoiceAttached: true,
      },
      { new: true }
    ).exec();

    if (!updatedBudget) {
      throw new CustomError(
        "Failed to update company document field",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: `Invoice uploaded successfully for ${departmentName} department`,
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updatedBudget._id,
      changes: {
        invoiceName: invoiceName,
        invoiceLink: response.secure_url,
        invoiceId: response.public_id,
      },
    });

    return res.status(200).json({
      message: `Invoice uploaded successfully for ${departmentName} department`,
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

const bulkInsertBudgets = async (req, res, next) => {
  try {
    const logPath = "BulkInsertLogs";
    const logAction = "Bulk insert for Budget";
    const logSourceKey = "budget";
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

    const csvData = req.file.buffer.toString("utf-8").trim();
    if (!csvData) {
      throw new CustomError(
        "CSV file is empty",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const budgets = [];
    const stream = Readable.from(csvData);

    const units = await Unit.find({ company }).lean().exec();

    const unitsMap = new Map(units.map((unit) => [unit._id, unit.unitNo]));

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
          console.warn(`Skipping invalid row: ${JSON.stringify(row)}`);
          return; // Skip invalid rows
        }

        budgets.push({
          company,
          department: departmentId,
          expanseName: row["Expanse Name"],
          projectedAmount: projectedAmt,
          actualAmount: actualAmt,
          unit: row["Unit"] ? unitsMap.get(row["Unit"].trim()) : null,
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

        try {
          await Budget.insertMany(budgets);
        } catch (dbError) {
          return next(
            new CustomError(
              dbError.message,
              logPath,
              logAction,
              logSourceKey,
              500
            )
          );
        }

        await createLog({
          path: logPath,
          action: logAction,
          remarks: "Bulk inserted budgets in the database",
          status: "Success",
          user,
          ip,
          company,
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
  approveBudget,
  rejectBudget,
  fetchBudget,
  fetchLandlordPayments,
  bulkInsertBudgets,
  uploadInvoice,
};
