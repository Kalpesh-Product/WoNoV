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
} = require("../../config/s3Config");
const Department = require("../../models/Departments");
const UserData = require("../../models/hr/UserData");
const Vendor = require("../../models/hr/Vendor");
const emitter = require("../../utils/eventEmitter");
const { parseAmount } = require("../../utils/parseAmount");
const { fetchBudgetVoucherService } = require("../../services/reports/finance");

const TECH_DEPARTMENT_ID = "6798ba9de469e809084e2494";
const normalizeAccessName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const FINANCE_MANAGED_DEPARTMENT_PREFIXES = [
  "finance",
  "legal",
  "cafe",
  "cafeteria",
  "admin",
  "administration",
];

const isFinanceManager = (roles = []) =>
  roles.some((role) => {
    const roleTitle = normalizeAccessName(role?.roleTitle || role);
    return (
      roleTitle.includes("finance") &&
      (roleTitle.includes("manager") || roleTitle.includes("admin"))
    );
  });

const isFinanceDepartment = (department) =>
  normalizeAccessName(department?.name).startsWith("finance");

const isFinanceManagerUser = (user) => {
  const roles = user?.role || [];
  const hasManagerRole = roles.some((role) => {
    const roleTitle = normalizeAccessName(role?.roleTitle || role);
    return (
      (roleTitle.includes("manager") || roleTitle.includes("admin")) &&
      !roleTitle.includes("employee")
    );
  });

  return (
    isFinanceManager(roles) ||
    (hasManagerRole && (user?.departments || []).some(isFinanceDepartment))
  );
};

const isGlobalBudgetAdmin = (roles = []) =>
  roles.some((role) =>
    ["masteradmin", "superadmin"].includes(
      normalizeAccessName(role?.roleTitle || role),
    ),
  );

const isFinanceManagedDepartment = (department) =>
  FINANCE_MANAGED_DEPARTMENT_PREFIXES.some((prefix) =>
    normalizeAccessName(department?.name).startsWith(prefix),
  );

const getBudgetApprovalAccess = (budget, user) => {
  const amount = budget.particulars?.length
    ? budget.particulars.reduce((sum, item) => sum + Number(item.particularAmount || 0), 0)
    : Number(budget.projectedAmount);
  const level = amount <= 10000 ? "Level 3" : amount <= 500000 ? "Level 2" : "Level 1";
  const departments = user?.departments || [];
  const roles = (user?.role || []).map((role) => String(role.roleTitle || role).trim().toLowerCase());
  const inDepartment = (name) => departments.some((department) => String(department.name || "").trim().toLowerCase() === name);
  const name = String(user?.firstName || "").trim().toLowerCase();
  const finance = departments.some((department) => String(department._id || department) === "6798bab0e469e809084e249a") || inDepartment("finance department") || inDepartment("finance");
  const topManagement = inDepartment("top management");
  const kashif = name === "kashif" && topManagement && roles.includes("super admin");
  const abrar = name === "abrar" && topManagement && roles.some((role) => ["master admin", "super admin"].includes(role));
  // Retain existing tech bulk approval access within the Level 3 limit.
  const tech = departments.some((department) => String(department._id || department) === TECH_DEPARTMENT_ID) || inDepartment("tech department");
  return {
    approvalLevel: level,
    approvalDepartment: level === "Level 3" ? "Finance" : "Top Management",
    requiredApprover: level === "Level 3" ? "Narshiva Naik" : level === "Level 2" ? "Kashif Saikh" : "Abrar Shaikh",
    canApproveBudget: Number.isFinite(amount) && amount >= 0 && (tech || (level === "Level 3" ? finance || kashif || abrar : level === "Level 2" ? kashif || abrar : abrar)),
  };
};
const fetchBudgetApprover = (userId) => User.findById(userId).select("firstName role departments").populate([{ path: "role", select: "roleTitle" }, { path: "departments", select: "name" }]).lean();
const PERMANENT_DELETE_DEPARTMENTS = new Set([
  "top management",
  "tech department",
]);

const belongsToPermanentDeleteDepartment = (departments = []) =>
  departments.some(
    (department) =>
      String(department?._id || department) === TECH_DEPARTMENT_ID ||
      PERMANENT_DELETE_DEPARTMENTS.has(
        department?.name?.trim().toLowerCase(),
      ),
  );

const canManageBudgetDeletes = (roles = []) =>
  roles.some((role) => {
    const roleTitle = String(role?.roleTitle || role).trim().toLowerCase();
    return (
      !roleTitle.includes("employee") &&
      ["manager", "admin", "top management"].some((title) =>
        roleTitle.includes(title),
      )
    );
  });

const setBudgetAuditContext = (req, action, budget, deletionType) => {
  req.logContext = {
    performedBy: req.user,
    company: req.company,
    action,
    payload: {
      budgetId: String(budget._id),
      expenseName: budget.expanseName,
      deletionType,
    },
  };
};

const normalizeMonth = (value) => {
  if (!value) return null;

  return String(value).trim().slice(0, 3).toLowerCase();
};

const getMonthDate = (monthValue) => {
  const normalizedMonth = normalizeMonth(monthValue);

  const monthIndex = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ].indexOf(normalizedMonth);

  if (monthIndex === -1) return null;

  const currentYear = new Date().getFullYear();
  const fiscalYear = monthIndex <= 2 ? currentYear + 1 : currentYear;

  // Last day of the month (UTC)
  return new Date(Date.UTC(fiscalYear, monthIndex + 1, 0));
};

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
      vendor,
    } = req.body;
    const { departmentId } = req.params;
    const invoiceFile = req.files?.invoice?.[0];
    const voucherFile = req.files?.voucher?.[0];

    const allowedPaymentTypes = ["One Time", "Recurring"];
    const allowedPaymentModes = [
      "Cash",
      "Cheque",
      "NEFT",
      "RTGS",
      "IMPS",
      "Credit Card",
      "ETC",
    ];
    const gstInRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const chequeNoRegex = /^[0-9]{6,9}$/;

    if (!expanseName || !expanseType || !unitId) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (expanseType === "Reimbursement" && !voucherFile) {
      throw new CustomError(
        "Voucher file isn't uploaded",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (expanseType === "Reimbursement" && !invoiceFile) {
      throw new CustomError(
        "Invoice file isn't uploaded",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      throw new CustomError(
        "Invalid department Id provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // ✅ Enum Validations
    if (paymentType && !allowedPaymentTypes.includes(paymentType)) {
      throw new CustomError(
        "Invalid payment type",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // ✅ GSTIN Regex Match
    if (gstIn && !gstInRegex.test(gstIn)) {
      throw new CustomError(
        "Invalid GSTIN format",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (
      req.body.finance?.modeOfPayment &&
      !allowedPaymentModes.includes(req.body.finance.modeOfPayment)
    ) {
      throw new CustomError(
        "Invalid mode of payment",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (
      req.body.finance?.chequeNo &&
      !chequeNoRegex.test(req.body.finance.chequeNo)
    ) {
      throw new CustomError(
        "Invalid cheque number",
        logPath,
        logAction,
        logSourceKey,
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
        logSourceKey,
      );
    }

    if (vendor) {
      if (!mongoose.Types.ObjectId.isValid(vendor)) {
        throw new CustomError(
          "Invalid vendor",
          logPath,
          logAction,
          logSourceKey,
        );
      }
      const vendorExists = await Vendor.exists({
        _id: vendor,
        company,
        departmentId,
        status: "Active",
      });
      if (!vendorExists) {
        throw new CustomError(
          "Select an active vendor from this department",
          logPath,
          logAction,
          logSourceKey,
        );
      }
    }

    const budgetData = {
      expanseName,
      projectedAmount: projectedAmount || 0,
      actualAmount: 0,
      department: departmentId,
      vendor: vendor || null,
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
      particulars: particulars ? JSON.parse(particulars) : [],
      gstIn: gstIn || "",
    };

    // Handle invoice file upload
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (invoiceFile) {
      if (!allowedMimeTypes.includes(invoiceFile.mimetype)) {
        throw new CustomError(
          "Invalid invoice file type",
          logPath,
          logAction,
          logSourceKey,
        );
      }

      let processedBuffer = invoiceFile.buffer;
      const originalFilename = invoiceFile.originalname;

      if (invoiceFile.mimetype === "application/pdf") {
        const pdfDoc = await PDFDocument.load(invoiceFile.buffer);
        pdfDoc.setTitle(originalFilename.split(".")[0] || "Untitled");
        processedBuffer = await pdfDoc.save();
      }

      const response = await handleDocumentUpload(
        processedBuffer,
        `${foundCompany.companyName}/departments/${departmentExists.name}/budget/invoice`,
        originalFilename,
      );

      if (!response.public_id) {
        throw new CustomError(
          "Failed to upload invoice",
          logPath,
          logAction,
          logSourceKey,
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

    if (voucherFile) {
      if (!allowedMimeTypes.includes(voucherFile.mimetype)) {
        throw new CustomError(
          "Invalid voucher file type",
          logPath,
          logAction,
          logSourceKey,
        );
      }

      let processedBuffer = voucherFile.buffer;
      const originalFilename = voucherFile.originalname;

      if (voucherFile.mimetype === "application/pdf") {
        const pdfDoc = await PDFDocument.load(voucherFile.buffer);
        pdfDoc.setTitle(originalFilename.split(".")[0] || "Untitled");
        processedBuffer = await pdfDoc.save();
      }

      const response = await handleDocumentUpload(
        processedBuffer,
        `${foundCompany.companyName}/departments/${departmentExists.name}/budget/voucher`,
        originalFilename,
      );

      if (!response.public_id) {
        throw new CustomError(
          "Failed to upload voucher",
          logPath,
          logAction,
          logSourceKey,
        );
      }

      budgetData.voucher = {
        name: originalFilename,
        link: response.secure_url,
        id: response.public_id,
        date: new Date(),
      };
    }

    const newBudgetRequest = new Budget(budgetData);
    const savedBudget = await newBudgetRequest.save();

    // Notification for budget request
    const foundDepartment =
      await Department.findById(departmentId).select("name");

    const userDetails = await UserData.findById({
      _id: user,
    });

    const deptEmployees = await UserData.find({
      departments: { $in: departmentId },
    });

    // * Emit notification event for task creation *
    emitter.emit("notification", {
      initiatorData: user, // user._id is expected if used downstream
      users: deptEmployees.map((emp) => ({
        userActions: {
          whichUser: emp._id, // send to department admin or fallback to self
          hasRead: false,
        },
      })),
      type: "Request Budget",
      module: "Finance",
      message: `A new Budget was requested by ${foundDepartment.name} department.`,
    });

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
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500),
    );
  }
};

const updateBudget = async (req, res, next) => {
  const logPath = "/budget/BudgetLog";
  const logAction = "Update Budget";
  const logSourceKey = "budget";
  const { user, ip, company } = req;

  try {
    const { budgetId } = req.params;
    const updateFields = req.body;
    // const allowedFields = ["gstIn", "expanseType", "actualAmount"]; // Add more fields here later
    const allowedFields = [
      "gstIn",
      "expanseName",
      "expanseType",
      "paymentType",
      "unit",
      "dueDate",
      "actualAmount",
      "vendor",
    ];
    // Filter only allowed fields from incoming data
    const filteredFields = Object.keys(updateFields).reduce((acc, key) => {
      if (allowedFields.includes(key)) {
        acc[key] = updateFields[key];
      }
      return acc;
    }, {});

    if (Object.keys(filteredFields).length === 0) {
      return res.status(400).json({
        message:
          "Allowed fields include only: gstIn, expanseName, expanseType, paymentType, unit, dueDate, actualAmount, vendor",
        // message: "Allowed fields include only: gstIn, expanseType,actualAmount",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(budgetId)) {
      return res.status(400).json({ message: "Invalid budget ID provided" });
    }

    const [foundBudget, requestingUser] = await Promise.all([
      Budget.findOne({ _id: budgetId, company }).populate(
        "department",
        "name",
      ),
      User.findById(user)
        .select("departments role")
        .populate("departments", "name")
        .populate("role", "roleTitle")
        .lean(),
    ]);
    if (!foundBudget) {
      return res.status(400).json({ message: "Budget not found" });
    }

    const userRoles = requestingUser?.role || req.roles || [];
    const departmentIds = (
      requestingUser?.departments ||
      req.departments ||
      []
    ).map((department) =>
      typeof department === "string"
        ? department
        : department?._id?.toString?.() || department?.toString?.(),
    );
    const budgetDepartmentId = String(
      foundBudget.department?._id || foundBudget.department,
    );
    const hasFinanceManagerAccess =
      isFinanceManagerUser(
        requestingUser || {
          role: userRoles,
          departments: req.departments || [],
        },
      ) &&
      isFinanceManagedDepartment(foundBudget.department);

    if (
      !departmentIds.includes(budgetDepartmentId) &&
      !isGlobalBudgetAdmin(userRoles) &&
      !hasFinanceManagerAccess
    ) {
      return res
        .status(403)
        .json({ message: "You don't have permission to update this budget" });
    }

    const missingFields = Object.entries({ paymentType: "Payment Type", unit: "Unit" })
      .filter(([key]) => key in filteredFields && !String(filteredFields[key] ?? "").trim())
      .map(([, label]) => label);

    if (missingFields.length) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    if (Object.hasOwn(filteredFields, "vendor")) {
      if (!mongoose.Types.ObjectId.isValid(filteredFields.vendor)) {
        return res.status(400).json({ message: "Invalid vendor" });
      }
      const vendorExists = await Vendor.exists({
        _id: filteredFields.vendor,
        company,
        departmentId: budgetDepartmentId,
        status: "Active",
      });
      if (!vendorExists) {
        return res.status(400).json({
          message: "Select an active vendor from this department",
        });
      }
    }

    const originalData = foundBudget.toObject();

    if (filteredFields.actualAmount !== undefined) {
      const amount = Number(filteredFields.actualAmount);

      if (isNaN(amount)) {
        return res
          .status(400)
          .json({ message: "Actual amount must be a number" });
      }

      filteredFields.actualAmount = amount;

      filteredFields.actualAmountDate = new Date();
    }

    // Apply updates
    for (const key in filteredFields) {
      if (typeof filteredFields[key] === "string") {
        foundBudget[key] = filteredFields[key].trim();
      } else {
        foundBudget[key] = filteredFields[key];
      }
    }

    const updatedBudget = await foundBudget.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: `Budget updated: ${budgetId}`,
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: updatedBudget._id,
      changes: { before: originalData, after: updatedBudget.toObject() },
    });

    return res.status(200).json({
      message: "Budget updated successfully",
      updatedBudget,
    });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500),
    );
  }
};

const updateFinanceAmount = async (req, res, next) => {
  const logPath = "/budget/BudgetLog";
  const logAction = "Update Finance Amount";
  const logSourceKey = "budget";
  const { user, ip, company } = req;

  try {
    const { budgetId } = req.params;
    const { financeAmount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(budgetId)) {
      return res.status(400).json({ message: "Invalid budget ID provided" });
    }

    if (
      financeAmount === undefined ||
      financeAmount === null ||
      String(financeAmount).trim() === ""
    ) {
      return res.status(400).json({ message: "Finance amount is required" });
    }

    const amount = Number(financeAmount);

    if (Number.isNaN(amount) || amount < 0) {
      return res
        .status(400)
        .json({ message: "Finance amount must be a valid positive number" });
    }

    const foundBudget = await Budget.findOne({ _id: budgetId, company });

    if (!foundBudget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    const previousFinanceAmount = foundBudget.financeAmount ?? 0;
    foundBudget.financeAmount = amount;
    foundBudget.financeAmountDate = new Date();

    const updatedBudget = await foundBudget.save({ validateModifiedOnly: true });

    await createLog({
      path: logPath,
      action: logAction,
      remarks: `Finance amount updated for budget: ${budgetId}`,
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: updatedBudget._id,
      changes: {
        before: { financeAmount: previousFinanceAmount },
        after: { financeAmount: updatedBudget.financeAmount },
      },
    });

    return res.status(200).json({
      message: "Finance amount updated successfully",
      updatedBudget,
    });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500),
    );
  }
};

// const fetchBudget = async (req, res, next) => {
//   try {
//     const { departmentId } = req.query;
//     const { user } = req;

//     const foundUser = await User.findOne({ _id: user })
//       .select("company")
//       .populate([{ path: "company", select: "companyName" }])
//       .lean()
//       .exec();

//     if (!foundUser) {
//       return res.status(400).json({ message: "No user found" });
//     }

//     const query = { company: foundUser.company };
//     if (departmentId) {
//       query.department = departmentId;
//     }

//     const budgets = await Budget.find(query)
//       .populate([
//         { path: "department", select: "name" },
//         { path: "unit", populate: { path: "building", model: "Building" } },
//       ])
//       .lean()
//       .exec();

//     const allBudgets = budgets.map((budget) => {
//       let particularsTotalAmount = 0;
//       if (budget?.particulars && budget.particulars.length > 0) {
//         particularsTotalAmount = budget.particulars.reduce(
//           (acc, curr) => acc + curr.particularAmount,
//           0,
//         );
//         return {
//           ...budget,
//           projectedAmount: particularsTotalAmount,
//         };
//       }
//       return {
//         ...budget,
//       };
//     });

//     res.status(200).json({ allBudgets });
//   } catch (error) {
//     next(error);
//   }
// };

const fetchBudget = async (req, res, next) => {
  try {
    const { departmentId, view, includeDeleted } = req.query;
    const { company } = req;
    const user = await User.findById(req.user)
      .populate("departments", "name")
      .populate("role", "roleTitle")
      .lean()
      .exec();
    const canViewDeleted =
      includeDeleted === "true" &&
      belongsToPermanentDeleteDepartment(user?.departments);


    let scopedDepartmentIds = departmentId ? [departmentId] : [];
    if (departmentId && isFinanceManagerUser(user)) {
      const requestedDepartment = await Department.findById(departmentId)
        .select("name")
        .lean();

      if (
        isFinanceDepartment(requestedDepartment)
      ) {
        const managedDepartments = await Department.find()
          .select("name")
          .lean();
        scopedDepartmentIds = managedDepartments
          .filter(isFinanceManagedDepartment)
          .map((managedDepartment) => managedDepartment._id);
      }
    }

    const departmentFilter = scopedDepartmentIds.length
      ? { $in: scopedDepartmentIds }
      : undefined;

    const currentMonthStart = new Date();
    currentMonthStart.setUTCHours(0, 0, 0, 0);
    currentMonthStart.setUTCDate(1);

    // Older bulk uploads were saved as Approved automatically. Move only those
    // unreviewed current/future records into the Finance approval workflow.
    await Budget.updateMany(
      {
        company,
        ...(departmentFilter ? { department: departmentFilter } : {}),
        isExtraBudget: false,
        status: "Approved",
        "finance.approvedAt": null,
        $or: [
          { dueDate: { $gte: currentMonthStart } },
          { dueDate: null, month: { $gte: currentMonthStart } },
        ],
      },
      { $set: { status: "Pending", isPaid: "Unpaid" } },
    );


    const result = await fetchBudgetVoucherService({
      company: company,
      departmentId,
      departmentIds: scopedDepartmentIds,
      dashboardView: view === "dashboard",
      profitLossView: view === "profit-loss",
      includeDeleted: canViewDeleted,
    });

    const approver = await fetchBudgetApprover(req.user);
    const approverIds = (result.allBudgets || []).flatMap((budget) => [budget.finance?.approvedBy, budget.rejectedBy]).filter(Boolean);
    const recordedApprovers = await User.find({ _id: { $in: approverIds }, company }).select("firstName lastName").lean();
    const approverNames = new Map(recordedApprovers.map((person) => [String(person._id), [person.firstName, person.lastName].filter(Boolean).join(" ")]));
    result.allBudgets = (result.allBudgets || []).map((budget) => {
      const access = getBudgetApprovalAccess(budget, approver);
      const recordedName = approverNames.get(String(budget.finance?.approvedBy));
      return { ...budget, ...access, approverName: recordedName || (access.approvalLevel === "Level 3" ? "--" : access.requiredApprover), rejectedByName: approverNames.get(String(budget.rejectedBy)) || "" };
    });
    return res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return next(error);
  }
};

const deleteBudget = async (req, res, next) => {
  try {
    const { budgetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(budgetId)) {
      return res.status(400).json({ message: "Invalid budget ID provided" });
    }

    const [budget, user] = await Promise.all([
      Budget.findOne({ _id: budgetId, company: req.company }).exec(),
      User.findById(req.user)
        .populate("departments", "name")
        .populate("role", "roleTitle")
        .lean()
        .exec(),
    ]);

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    if (!canManageBudgetDeletes(user?.role)) {
      return res.status(403).json({
        message: "Only department managers can delete budgets",
      });
    }

    if (budget.status !== "Pending") {
      return res.status(403).json({
        message: "Only pending budgets can be deleted",
      });
    }

    if (belongsToPermanentDeleteDepartment(user?.departments)) {
      await budget.deleteOne();
      setBudgetAuditContext(
        req,
        "Permanently Delete Budget",
        budget,
        "permanent",
      );
      return res.status(200).json({
        message: "Budget permanently deleted successfully",
        deletionType: "permanent",
      });
    }

    if (budget.isDeleted) {
      return res.status(403).json({
        message:
          "Only Top Management or Tech Department users can permanently delete this budget",
      });
    }

    budget.isDeleted = true;
    budget.deletedAt = new Date();
    budget.deletedBy = req.user;
    await budget.save();

    setBudgetAuditContext(req, "Delete Budget", budget, "soft");

    return res.status(200).json({
      message: "Budget deleted successfully",
      deletionType: "soft",
    });
  } catch (error) {
    return next(error);
  }
};

const restoreBudget = async (req, res, next) => {
  try {
    const { budgetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(budgetId)) {
      return res.status(400).json({ message: "Invalid budget ID provided" });
    }

    const user = await User.findById(req.user)
      .populate("departments", "name")
      .populate("role", "roleTitle")
      .lean()
      .exec();

    if (
      !canManageBudgetDeletes(user?.role) ||
      !belongsToPermanentDeleteDepartment(user?.departments)
    ) {
      return res.status(403).json({
        message: "Only Top Management or Tech Department users can restore this budget",
      });
    }

    const budget = await Budget.findOneAndUpdate(
      { _id: budgetId, company: req.company, isDeleted: true },
      { $set: { isDeleted: false }, $unset: { deletedAt: 1, deletedBy: 1 } },
      { new: true },
    ).lean();

    if (!budget) {
      return res.status(404).json({ message: "Deleted budget not found" });
    }

    setBudgetAuditContext(req, "Restore Budget", budget, "restore");

    return res.status(200).json({ message: "Budget restored successfully" });
  } catch (error) {
    return next(error);
  }
};

const fetchPendingApprovals = async (req, res, next) => {
  try {
    const { company } = req;
    const approver = await fetchBudgetApprover(req.user);

    const budgets = await Budget.find({
      company,
      status: "Pending",
      isDeleted: { $ne: true },
    })
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
          0,
        );
        return {
          ...budget,
          ...getBudgetApprovalAccess(budget, approver),
          projectedAmount: particularsTotalAmount,
        };
      }
      return {
        ...budget,
        ...getBudgetApprovalAccess(budget, approver),
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
          0,
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

// const fetchLandlordPayments = async (req, res, next) => {
//   try {
//     const { unit } = req.query;
//     const { user, company } = req;
//     const query = { company, expanseType: "Monthly Rent" };

//     let foundUnit;

//     if (unit) {
//       const foundUnit = await Unit.findOne({ unitNo: unit });

//       if (!foundUnit) {
//         return res.status(400).json({ message: "No unit found" });
//       }
//       query.unit = foundUnit._id;
//     }

//     const allBudgets = await Budget.find(query)
//       .populate([
//         { path: "department", select: "name" },
//         { path: "unit", populate: { path: "building", model: "Building" } },
const fetchLandlordPayments = async (req, res, next) => {
  try {
    const { unitId, unit, building } = req.query;
    const { company } = req;
    const query = {
      company,
      expanseType: {
        $regex: /^\s*(monthly rent|rent|landlord payments?)\s*$/i,
      },
    };

    let foundUnit;

    if (unitId && mongoose.Types.ObjectId.isValid(unitId)) {
      foundUnit = await Unit.findOne({ _id: unitId, company });
    } else if (unit) {
      const unitCandidates = await Unit.find({ unitNo: unit, company })
        .populate({ path: "building", select: "buildingName" })
        .lean();
      const normalizedBuilding = String(building || "").trim().toLowerCase();

      foundUnit = normalizedBuilding
        ? unitCandidates.find(
            (candidate) =>
              String(candidate.building?.buildingName || "")
                .trim()
                .toLowerCase() === normalizedBuilding,
          )
        : unitCandidates[0];
    }

    if (!foundUnit) {
      return res.status(404).json({ message: "No unit found" });
    }
    query.unit = foundUnit._id;

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
      { new: true },
    );

    if (!approvedBudget) {
      throw new CustomError(
        "Failed to approve the budget,please try again",
        logPath,
        logAction,
        logSourceKey,
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
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500),
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
      advanceAmount,
      expectedDateInvoice,
    };

    const budget = await Budget.findById({ _id: budgetId }).populate(
      "department",
    );
    if (!budget) {
      throw new CustomError(
        "Budget not found",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (budget.expanseType !== "Reimbursement") {
      if (String(budget.company) !== String(company) || budget.isDeleted) return res.status(404).json({ message: "Budget not found" });
      const approver = await fetchBudgetApprover(user);
      const access = getBudgetApprovalAccess(budget, approver);
      if (!access.canApproveBudget) return res.status(403).json({ message: `${access.approvalLevel} approval required from ${access.requiredApprover}` });
      if (budget.status !== "Pending") return res.status(409).json({ message: "Only pending budgets can be approved" });
      budget.status = "Approved";
        budget.finance.approvedAt = new Date();
      budget.finance.approvedBy = user;
      await budget.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: "Approved" });
    }

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value === undefined || value === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      throw new CustomError(
        `Missing required fields: ${missingFields.join(", ")}`,
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (
      modeOfPayment &&
      modeOfPayment === "Cheque" &&
      (!chequeDate || !chequeNo)
    ) {
      throw new CustomError(
        "Missing cheque number or cheque date",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const foundCompany = await Company.findById({ _id: company });

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
        logSourceKey,
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
      originalFilename,
    );

    if (!response.public_id) {
      throw new CustomError(
        "Failed to upload voucher document",
        logPath,
        logAction,
        logSourceKey,
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
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500),
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

    const requestedBudget = await Budget.findOne({ _id: budgetId, company, isDeleted: { $ne: true } });
    if (!requestedBudget) return res.status(404).json({ message: "Budget not found" });
    if (requestedBudget.expanseType !== "Reimbursement") {
      const access = getBudgetApprovalAccess(requestedBudget, await fetchBudgetApprover(user));
      if (!access.canApproveBudget) return res.status(403).json({ message: `${access.approvalLevel} approval required from ${access.requiredApprover}` });
      if (requestedBudget.status !== "Pending") return res.status(409).json({ message: "Only pending budgets can be rejected" });
    }
    const rejectedBudget = await Budget.findByIdAndUpdate(
      { _id: budgetId },
      { status: "Rejected", rejectedBy: user },
      { new: true },
    );

    if (!rejectedBudget) {
      throw new CustomError(
        "Failed to reject the budget,please try again",
        logPath,
        logAction,
        logSourceKey,
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
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500),
    );
  }
};

const unapproveBudget = async (req, res, next) => {
  const logPath = "budget/BudgetLog";
  const logAction = "Unapprove Budget";
  const logSourceKey = "budget";

  try {
    const { budgetId } = req.params;
    const { user, ip, company } = req;

    const budget = await Budget.findById(budgetId);

    if (!budget) {
      throw new CustomError(
        "Budget not found",
        logPath,
        logAction,
        logSourceKey,
        404,
      );
    }

    if (budget.status !== "Approved") {
      throw new CustomError(
        "Only approved budgets can be unapproved",
        logPath,
        logAction,
        logSourceKey,
        400,
      );
    }

    budget.status = "Pending";
    budget.isPaid = "Unpaid";
    budget.finance = budget.finance || {};
    budget.finance.approvedAt = undefined;
    budget.finance.approvedBy = undefined;

    await budget.save({ validateModifiedOnly: true });

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Budget returned to pending approvals",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: budget._id,
      changes: { status: "Pending", isPaid: "Unpaid" },
    });

    res.status(200).json({ message: "Budget returned to pending approvals" });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500),
    );
  }
};


const uploadInvoice = async (req, res, next) => {
  const logPath = "budget/BudgetLog";
  const logAction = "Upload Invoice";
  const logSourceKey = "budget";
  const { departmentName } = req.body;
  let retainedInvoices = [];
  try {
    retainedInvoices = JSON.parse(req.body.retainedInvoices || "[]");
    if (!Array.isArray(retainedInvoices)) retainedInvoices = [];
  } catch {
    retainedInvoices = [];
  }
  const files = req.files || [];
  const { user, ip, company } = req;
  const { budgetId } = req.params;

  try {
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/bmp",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "application/csv",
    ];

    if (!mongoose.Types.ObjectId.isValid(budgetId)) {
      throw new CustomError("Invalid budget Id provided", logPath, logAction, logSourceKey);
    }
    const invalidFile = files.find((file) =>
      !allowedMimeTypes.includes(file.mimetype) &&
      !(file.originalname.toLowerCase().endsWith(".csv") &&
        ["text/plain", "application/octet-stream", ""].includes(file.mimetype))
    );
    if (invalidFile) {
      throw new CustomError(
        `${invalidFile.originalname}: invalid file type. Allowed types: Images, PDF, Word, Excel, and CSV`,
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const foundCompany = await Company.findById({ _id: company });
    if (!foundCompany) {
      throw new CustomError("Company not found", logPath, logAction, logSourceKey);
    }

    const foundBudget = await Budget.findById({ _id: budgetId });
    if (!foundBudget) {
      throw new CustomError("No such budget found", logPath, logAction, logSourceKey);
    }
    if (foundBudget.status !== "Approved") {
      throw new CustomError(
        "Invoice can only be uploaded after finance approval",
        logPath,
        logAction,
        logSourceKey,
      );
    }
    // Previous one-time upload restriction retained for reference. Re-uploading
    // now replaces the saved invoice files through the existing $set below.
    // if (foundBudget.invoiceAttached) {
    //   throw new CustomError(
    //     "Invoice has already been uploaded",
    //     logPath,
    //     logAction,
    //     logSourceKey,
    //   );
    // }

    const savedInvoices = foundBudget.invoices?.length
      ? foundBudget.invoices.map((invoice) =>
          typeof invoice.toObject === "function" ? invoice.toObject() : invoice,
        )
      : foundBudget.invoice?.link
        ? [
            typeof foundBudget.invoice.toObject === "function"
              ? foundBudget.invoice.toObject()
              : foundBudget.invoice,
          ]
        : [];
    const retainedKeys = new Set(
      retainedInvoices.flatMap((invoice) =>
        [invoice?.id, invoice?.link].filter(Boolean).map(String),
      ),
    );
    const verifiedRetainedInvoices = savedInvoices.filter(
      (invoice) =>
        retainedKeys.has(String(invoice.id)) ||
        retainedKeys.has(String(invoice.link)),
    );

    if (verifiedRetainedInvoices.length + files.length > 15) {
      throw new CustomError(
        "You can attach a maximum of 15 files",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const uploadedInvoices = await Promise.all(
      files.map(async (file) => {
        let processedBuffer = file.buffer;
        if (file.mimetype === "application/pdf") {
          const pdfDoc = await PDFDocument.load(file.buffer);
          pdfDoc.setTitle(file.originalname.split(".")[0] || "Untitled");
          processedBuffer = await pdfDoc.save();
        }
        const response = await handleDocumentUpload(
          processedBuffer,
          `${foundCompany.companyName}/departments/${departmentName}/budget/invoice`,
          file.originalname,
        );
        if (!response.public_id) throw new Error(`Failed to upload ${file.originalname}`);
        return {
          name: file.originalname,
          link: response.secure_url,
          id: response.public_id,
          date: new Date(),
        };
      }),
    );
    const nextInvoices = [...verifiedRetainedInvoices, ...uploadedInvoices];

    const updatedBudget = await Budget.findByIdAndUpdate(
      budgetId,
      {
        ...(nextInvoices.length > 0
          ? { $set: { invoices: nextInvoices, invoice: nextInvoices[0], invoiceAttached: true } }
          : {
              $set: { invoices: [], invoiceAttached: false },
              $unset: { invoice: 1 },
            }),
      },
      { new: true },
    ).exec();
    if (!updatedBudget) {
      throw new CustomError("Failed to update budget invoices", logPath, logAction, logSourceKey);
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: `${nextInvoices.length} invoice(s) saved successfully for ${departmentName} department`,
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: updatedBudget._id,
      changes: { invoices: nextInvoices },
    });

    return res.status(200).json({
      message: `${nextInvoices.length} invoice(s) saved successfully`,
    });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500),
    );
  }
};

// const uploadInvoice = async (req, res, next) => {
//   const logPath = "budget/BudgetLog";
//   const logAction = "Upload Invoice";
//   const logSourceKey = "budget";
//   const { departmentName } = req.body;
//   const file = req.file;
//   const { user, ip, company } = req;
//   const { budgetId } = req.params;

//   try {
//     const allowedMimeTypes = [
//       "application/pdf",
//       "application/msword", // .doc
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
//     ];

//     if (!mongoose.Types.ObjectId.isValid(budgetId)) {
//       throw new CustomError(
//         "Invalid budget Id provided",
//         logPath,
//         logAction,
//         logSourceKey,
//       );
//     }

//  if (!file) {
//       throw new CustomError(
//         "Invoice file was not provided",
//         logPath,
//         logAction,
//         logSourceKey,
//       );
//     }


//     if (!allowedMimeTypes.includes(file.mimetype)) {
//       throw new CustomError(
//         "Invalid file type. Allowed types: PDF, DOC, DOCX",
//         logPath,
//         logAction,
//         logSourceKey,
//       );
//     }

//     const foundCompany = await Company.findById({ _id: company });

//     if (!foundCompany) {
//       throw new CustomError(
//         "Company not found",
//         logPath,
//         logAction,
//         logSourceKey,
//       );
//     }

//     const foundBudget = await Budget.findById({ _id: budgetId });

//     if (!foundBudget) {
//       throw new CustomError(
//         "No such budget found",
//         logPath,
//         logAction,
//         logSourceKey,
//       );
//     }

//     // if (foundBudget.invoice && foundBudget.invoice.id) {
//     //   await handleFileDelete(foundBudget.invoice.id);
//      if (foundBudget.status !== "Approved") {
//       throw new CustomError(
//         "Invoice can only be uploaded after finance approval",
//         logPath,
//         logAction,
//         logSourceKey,
//       );
//     }

//     if (foundBudget.invoiceAttached) {
//       throw new CustomError(
//         "Invoice has already been uploaded",
//         logPath,
//         logAction,
//         logSourceKey,
//       );
//     }

//     let processedBuffer = file.buffer;
//     const originalFilename = file.originalname;

//     // Process PDF: set document title
//     if (file.mimetype === "application/pdf") {
//       const pdfDoc = await PDFDocument.load(file.buffer);
//       pdfDoc.setTitle(
//         file.originalname ? file.originalname.split(".")[0] : "Untitled",
//       );
//       processedBuffer = await pdfDoc.save();
//     }

//     const response = await handleDocumentUpload(
//       processedBuffer,
//       `${foundCompany.companyName}/departments/${departmentName}/budget/invoice`,
//       originalFilename,
//     );

//     if (!response.public_id) {
//       throw new CustomError(
//         "Failed to upload document",
//         logPath,
//         logAction,
//         logSourceKey,
//       );
//     }

//     const updatedBudget = await Budget.findOneAndUpdate(
//       {
//         _id: budgetId,
//       },
//       {
//         $set: {
//           invoice: {
//             name: originalFilename,
//             link: response.secure_url,
//             id: response.public_id,
//             date: new Date(),
//           },
//         },
//         invoiceAttached: true,
//       },
//       { new: true },
//     ).exec();

//     if (!updatedBudget) {
//       throw new CustomError(
//         "Failed to update company document field",
//         logPath,
//         logAction,
//         logSourceKey,
//       );
//     }

//     await createLog({
//       path: logPath,
//       action: logAction,
//       remarks: `Invoice uploaded successfully for ${departmentName} department`,
//       status: "Success",
//       user: user,
//       ip: ip,
//       company: company,
//       sourceKey: logSourceKey,
//       sourceId: updatedBudget._id,
//       changes: {
//         invoiceName: originalFilename,
//         invoiceLink: response.secure_url,
//         invoiceId: response.public_id,
//       },
//     });

//     return res.status(200).json({
//       message: `Invoice uploaded successfully for ${departmentName} department`,
//     });
//   } catch (error) {
//     if (error instanceof CustomError) {
//       next(error);
//     } else {
//       next(
//         new CustomError(error.message, logPath, logAction, logSourceKey, 500),
//       );
//     }
//   }
// };

const bulkInsertBudgets = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const { company } = req;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "CSV file was not provided" });
    }

    const csvData = req.file.buffer.toString("utf-8").trim();
    if (!csvData) {
      return res
        .status(400)
        .json({ success: false, message: "CSV file is empty" });
    }

    const units = await Unit.find({ company }).lean();
    const unitsMap = new Map(units.map((u) => [u.unitNo, u._id]));

    const departments = await Department.find().select("name").lean();

    const normalize = (value) =>
      String(value || "")
        .trim()
        .toLowerCase();

    const departmentMap = new Map(
      departments.map((dept) => [normalize(dept.name), dept._id]),
    );

    const budgets = [];
    const invalidRows = [];
    const invalidRowNos = [];
    let rowNumber = 1;
    Readable.from(csvData)
      .pipe(csvParser())
      .on("data", (row) => {
        rowNumber++;
        const projectedAmt = parseAmount(row["Projected Amount"]);
        const actualAmt = parseAmount(row["Actual Amount"]);

        const rawDueDate = row["Due Date"]?.trim();
        const rawMonth = row["Month"]?.trim();

        const normalizedMonth = normalizeMonth(rawMonth);
        const month = getMonthDate(normalizedMonth);

        const dueDate = rawDueDate ? new Date(rawDueDate) : month;

        const department = departmentMap.get(normalize(row["Department"]));

        if (
          isNaN(projectedAmt) ||
          (month && isNaN(month.getTime())) ||
          !department
        ) {
          invalidRowNos.push(rowNumber);
          invalidRows.push({
            row,
            reason: !department
              ? `Invalid department: ${row["Department"]}`
              : "Invalid amount or date",
          });
          return;
        }

         const budgetMonth = dueDate || month;
        const currentMonth = new Date();
        currentMonth.setUTCHours(0, 0, 0, 0);
        currentMonth.setUTCDate(1);
        const requiresApproval =
          budgetMonth && budgetMonth.getTime() >= currentMonth.getTime();

        budgets.push({
          company,
          department,
          expanseName: row["Expense Name"],
          projectedAmount: projectedAmt,
          actualAmount: actualAmt,
          unit: row["Unit"] ? (unitsMap.get(row["Unit"].trim()) ?? null) : null,
          // status: row["Status"] || "Pending",
        //  status: "Approved",
          status: requiresApproval ? "Pending" : "Approved",
          month,
          dueDate: dueDate || null,
          expanseType: row["Expanse Type"],
          category: row["Expanse Category"],
          // isPaid: row["Status"] === "Approved" ? "Paid" : "Unpaid",
          //isPaid: "Paid",
           isPaid: requiresApproval ? "Unpaid" : "Paid",
          isExtraBudget: false,
        });
      })
      .on("end", async () => {
        if (invalidRows.length > 0) {
          return res.status(400).json({
            message: "Invalid rows found in CSV",
            invalidRowNos,
            rowNumberLen: invalidRowNos.length,
            invalidRows,
            invalidRowsLen: invalidRows.length,
          });
        }

        if (budgets.length === 0) {
          return res.status(400).json({
            success: false,
            message: "No valid budgets found in CSV",
          });
        }

        await Budget.insertMany(budgets);

        return res.status(201).json({
          success: true,
          message: "Budgets uploaded successfully",
          uploadCount: budgets.length,
        });
      })
      .on("error", (streamErr) => {
        console.error(streamErr);
        return res
          .status(500)
          .json({ success: false, message: streamErr.message });
      });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  requestBudget,
  approveBudget,
  rejectBudget,
  updateBudget,
  updateFinanceAmount,
  deleteBudget,
  restoreBudget,
  fetchBudget,
  fetchLandlordPayments,
  bulkInsertBudgets,
  uploadInvoice,
  fetchPendingApprovals,
  fetchApprovedbudgets,
  approveFinanceBudget,
  unapproveBudget,
};
