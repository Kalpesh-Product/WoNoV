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
const Department = require("../../models/Departments");

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
      preApproved,
      emergencyApproval,
      budgetApproval,
      l1Approval,
      srNo,
      particulars,
      gstIn,
    } = req.body;
    const { departmentId } = req.params;

    if (!expanseName || !expanseType || !unitId) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (expanseType === "Reimbursement" && !req.file) {
      throw new CustomError(
        "Voucher file isn't uploaded",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      throw new CustomError(
        "Invalid department Id provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const parsedDueDate =
      expanseType !== "Reimbursement" ? new Date(dueDate) : new Date();
    const parsedReimbursementDate =
      expanseType === "Reimbursement" ? new Date() : null;

    const foundCompany = await Company.findById({
      _id: company,
    })
      .lean()
      .exec();

    const departmentExists = await Department.findById({
      _id: departmentId,
    })
      .lean()
      .exec();

    if (!departmentExists) {
      throw new CustomError(
        "Department not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const budgetData = {
      expanseName,
      projectedAmount: projectedAmount || 0,
      department: departmentId,
      company: company,
      dueDate: parsedDueDate,
      reimbursementDate: parsedReimbursementDate,
      expanseType,
      paymentType,
      unit: unitId,
      status: "Pending",
      preApproved,
      emergencyApproval,
      budgetApproval,
      l1Approval,
      srNo,
      particulars: JSON.parse(particulars),
      gstIn: gstIn || "",
    };

    // Handle invoice file upload
    if (req.file) {
      const allowedMimeTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      const file = req.file;

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new CustomError(
          "Invalid file type",
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

      const response = await handleDocumentUpload(
        processedBuffer,
        `${foundCompany.companyName}/departments/${departmentExists.name}/budget/invoice`,
        originalFilename
      );

      if (!response.public_id) {
        throw new CustomError(
          "Failed to upload invoice",
          logPath,
          logAction,
          logSourceKey
        );
      }

      budgetData.invoice = {
        name: originalFilename,
        link: response.secure_url,
        id: response.public_id,
        date: new Date(),
      };

      budgetData.invoiceAttached = true;
    }

    const newBudgetRequest = new Budget(budgetData);
    const savedBudget = await newBudgetRequest.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: `Budget requested for ${departmentExists.name}`,
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: savedBudget._id,
      changes: newBudgetRequest,
    });

    return res.status(200).json({
      message: `Budget requested for ${departmentExists.name}`,
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

    const budgets = await Budget.find(query)
      .populate([
        { path: "department", select: "name" },
        { path: "unit", populate: { path: "building", model: "Building" } },
      ])
      .lean()
      .exec();

    const allBudgets = budgets.map((budget) => {
      let particularsTotalAmount = 0;
      if (budget?.particulars && budget.particulars.length > 0) {
        particularsTotalAmount = budget.particulars.reduce(
          (acc, curr) => acc + curr.particularAmount,
          0
        );
        return {
          ...budget,
          projectedAmount: particularsTotalAmount,
        };
      }
      return {
        ...budget,
      };
    });

    res.status(200).json({ allBudgets });
  } catch (error) {
    next(error);
  }
};

const fetchPendingApprovals = async (req, res, next) => {
  try {
    const { company } = req;

    const budgets = await Budget.find({ company, status: "Pending" })
      .populate([
        { path: "department", select: "name" },
        { path: "unit", populate: { path: "building", model: "Building" } },
      ])
      .lean()
      .exec();

    const allBudgets = budgets.map((budget) => {
      let particularsTotalAmount = 0;
      if (budget?.particulars && budget.particulars.length > 0) {
        particularsTotalAmount = budget.particulars.reduce(
          (acc, curr) => acc + curr.particularAmount,
          0
        );
        return {
          ...budget,
          projectedAmount: particularsTotalAmount,
        };
      }
      return {
        ...budget,
      };
    });

    res.status(200).json({ allBudgets });
  } catch (error) {
    next(error);
  }
};

const fetchApprovedbudgets = async (req, res, next) => {
  try {
    const { company } = req;

    const budgets = await Budget.find({ company, status: "Approved" })
      .populate([
        { path: "department", select: "name" },
        { path: "unit", populate: { path: "building", model: "Building" } },
      ])
      .lean()
      .exec();

    const allBudgets = budgets.map((budget) => {
      let particularsTotalAmount = 0;
      if (budget?.particulars && budget.particulars.length > 0) {
        particularsTotalAmount = budget.particulars.reduce(
          (acc, curr) => acc + curr.particularAmount,
          0
        );
        return {
          ...budget,
          projectedAmount: particularsTotalAmount,
        };
      }
      return {
        ...budget,
      };
    });

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
    const { user, ip, company } = req;

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

const approveFinanceBudget = async (req, res, next) => {
  const logPath = "/budget/BudgetLog";
  const logAction = "Approve Budget";
  const logSourceKey = "budget";
  const { user, ip, company } = req;
  const file = req.file;

  try {
    const {
      fSrNo,
      budgetId,
      modeOfPayment,
      chequeNo,
      chequeDate,
      advanceAmount,
      expectedDateInvoice,
      particulars,
    } = req.body;

    const requiredFields = {
      fSrNo,
      particulars,
      modeOfPayment,
      chequeNo,
      chequeDate,
      advanceAmount,
      expectedDateInvoice,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value === undefined || value === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      throw new CustomError(
        `Missing required fields: ${missingFields.join(", ")}`,
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundCompany = await Company.findById({ _id: company });

    const budget = await Budget.findById({ _id: budgetId }).populate(
      "department"
    );
    if (!budget) {
      throw new CustomError(
        "Budget not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // ====== VOUCHER UPLOAD LOGIC =======
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!file || !allowedMimeTypes.includes(file.mimetype)) {
      throw new CustomError(
        "Invalid or missing file. Allowed types: PDF, DOC, DOCX",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (budget.voucher && budget.voucher.id) {
      await handleFileDelete(budget.voucher.id);
    }

    let processedBuffer = file.buffer;
    const originalFilename = file.originalname;

    if (file.mimetype === "application/pdf") {
      const pdfDoc = await PDFDocument.load(file.buffer);
      pdfDoc.setTitle(originalFilename?.split(".")[0] || "Voucher");
      processedBuffer = await pdfDoc.save();
    }

    const response = await handleDocumentUpload(
      processedBuffer,
      `${foundCompany.companyName}/departments/${budget.department.name}/budget/voucher`,
      originalFilename
    );

    if (!response.public_id) {
      throw new CustomError(
        "Failed to upload voucher document",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // ========== APPROVE FIELDS ============
    budget.status = "Approved";

    budget.finance = {
      fSrNo,
      chequeNo,
      chequeDate,
      advanceAmount,
      expectedDateInvoice,
      modeOfPayment,
      particulars: JSON.parse(particulars),
      approvedAt: new Date(),
      voucher: {
        name: originalFilename,
        link: response.secure_url,
        id: response.public_id,
        date: new Date(),
      },
    };

    await budget.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: `Budget approved with voucher`,
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: budget._id,
      changes: {
        fSrNo,
        chequeNo,
        chequeDate,
        advanceAmount,
        expectedDateInvoice,
        modeOfPayment,
        particulars,
        approvedAt: new Date(),
        status: "Approved",
        voucherName: originalFilename,
        voucherLink: response.secure_url,
        voucherId: response.public_id,
      },
    });

    return res.status(200).json({
      message: "Budget approved with voucher uploaded",
    });
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
  const { departmentName } = req.body;
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
            name: originalFilename,
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
        invoiceName: originalFilename,
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
  fetchPendingApprovals,
  fetchApprovedbudgets,
  approveFinanceBudget,
};
