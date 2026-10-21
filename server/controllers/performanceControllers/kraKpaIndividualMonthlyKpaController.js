const mongoose = require("mongoose");
const Department = require("../../models/Departments");
const UserData = require("../../models/hr/UserData");
const IndividualMonthlyKpa = require("../../models/performances/KraKpaIndividualMonthlyKpa");
const Event = require("../../models/events/Events");
const isDepartmentManager = require("../../utils/kraKpaDepartmentManager");
const {
  calculateDelayedWorkingDays,
} = require("../../utils/kraKpaDelayedDays");

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const FISCAL_YEAR_PATTERN = /^\d{4}-\d{2}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DETAIL_POPULATION = [
  { path: "employee", select: "firstName middleName lastName" },
  { path: "department", select: "name" },
  { path: "createdBy", select: "firstName middleName lastName" },
  { path: "approvedBy", select: "firstName middleName lastName" },
  { path: "rejectedBy", select: "firstName middleName lastName" },
  { path: "completionHistory.completedBy", select: "firstName middleName lastName" },
  { path: "managerReviewedBy", select: "firstName middleName lastName" },
  { path: "managerReviewHistory.reviewedBy", select: "firstName middleName lastName" },
  { path: "editHistory.editedBy", select: "firstName middleName lastName" },
  { path: "verifiedBy", select: "firstName middleName lastName" },
];
const EDIT_HISTORY_FIELDS = {
  target: "KPA",
  deadline: "Deadline",
  status: "KPA Status",
  closingDate: "Closing Date",
  managerComments: "Manager Comments",
  kpaRating: "Manager Rating",
  managerRatingDate: "Manager Rating Date",
  hrComments: "HR Comments",
  hrRating: "HR Rating",
  hrRatingDate: "HR Rating Date",
  verification: "Review Status",
  verificationClosedDate: "Closed On",
};

const serializeHistoryValue = (value) => {
  if (value === undefined || value === null || value === "") return null;
  if (value instanceof Date) return value.toISOString();
  return value;
};

const getEditHistorySnapshot = (record) =>
  Object.fromEntries(
    Object.keys(EDIT_HISTORY_FIELDS).map((field) => [
      field,
      serializeHistoryValue(record[field]),
    ]),
  );

const getEditHistoryChanges = (before, record) =>
  Object.entries(EDIT_HISTORY_FIELDS).flatMap(([field, label]) => {
    const oldValue = before[field];
    const newValue = serializeHistoryValue(record[field]);
    return JSON.stringify(oldValue) === JSON.stringify(newValue)
      ? []
      : [{ field, label, oldValue, newValue }];
  });
const getFiscalYear = (month) => {
  const [year, calendarMonth] = month.split("-").map(Number);
  const startYear = calendarMonth >= 4 ? year : year - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
};

const parseDate = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? date
    : undefined;
};

const getAccess = async (req) => {
  const roles = (req.roles || []).map((role) => String(role).toLowerCase());
  const departmentIds = (req.departments || [])
    .map((department) => String(department?._id || department))
    .filter((id) => mongoose.isValidObjectId(id));
  const isHr = roles.some((role) => /^hr(?:\s|$)/.test(role));
  const isManager = roles.some((role) => role.includes("manager"));
  const isTopManagement = roles.includes("top management") || Boolean(
    departmentIds.length && await Department.exists({
      _id: { $in: departmentIds },
      name: /^top management$/i,
    }),
  );
  const allDepartments = isHr || isTopManagement || roles.some((role) =>
    ["master admin", "super admin"].includes(role),
  );
  const canViewOthers = allDepartments || roles.some((role) =>
    role.includes("manager") || role.endsWith("admin"),
  );

  return {
    allDepartments,
    canViewOthers,
    departmentIds,
    isHr,
    isManager,
    isTopManagement,
  };
};

const getScopedFilter = (req, access) => ({
    company: req.company,
    isDeleted: { $ne: true },
    ...(!access.allDepartments && { department: { $in: access.departmentIds } }),
    ...(!access.canViewOthers && { employee: req.user }),
});

const canDeleteKraKpa = async (req, departmentId, access) =>
  access.isTopManagement || await isDepartmentManager(req, departmentId, access);

const parseRating = (value) => {
  if (value === "" || value === null) return null;
  if (value === 0 || value === "0") return 0;
  if (value === 1 || value === "1") return 1;
  return undefined;
};

const validateReviewFields = (body) => {
  const fields = [
    "managerComments",
    "kpaRating",
    "managerRatingDate",
    "hrComments",
    "hrRating",
    "hrRatingDate",
  ];
  const hasReviewFields = fields.some((field) => Object.hasOwn(body, field));
  if (!hasReviewFields) return { value: null };

  const value = {};
  if (Object.hasOwn(body, "managerComments")) {
    if (typeof body.managerComments !== "string" || body.managerComments.length > 5000) {
      return { error: "Manager Comments must be at most 5000 characters" };
    }
    value.managerComments = body.managerComments.trim();
  }
  if (Object.hasOwn(body, "hrComments")) {
    if (typeof body.hrComments !== "string" || body.hrComments.length > 5000) {
      return { error: "HR Comments must be at most 5000 characters" };
    }
    value.hrComments = body.hrComments.trim();
  }
  for (const field of ["kpaRating", "hrRating"]) {
    if (!Object.hasOwn(body, field)) continue;
    const rating = parseRating(body[field]);
    if (rating === undefined) return { error: `${field} must be 0 or 1` };
    value[field] = rating;
  }
  for (const field of ["managerRatingDate", "hrRatingDate"]) {
    if (!Object.hasOwn(body, field)) continue;
    const ratingDate = parseDate(body[field]);
    if (ratingDate === undefined) {
      return { error: `${field} must be a valid YYYY-MM-DD date` };
    }
    value[field] = ratingDate;
  }
  return { value };
};

const validateVerificationFields = (body, record) => {
  const hasVerificationFields = ["verification", "verificationDate"].some((field) =>
    Object.hasOwn(body, field),
  );
  if (!hasVerificationFields) return { value: null };

  const verification = body.verification ?? record.verification ?? "Pending";
  if (Object.hasOwn(body, "verification") && verification === "Pending") {
    return { error: "Pending review status is set automatically" };
  }
  if (!["Changes Required", "Closed"].includes(verification)) {
    return { error: "Review Status must be Changes Required or Closed" };
  }
  const verificationDate = verification === "Closed"
    ? body.verificationDate === undefined
      ? record.verificationClosedDate
      : parseDate(body.verificationDate)
    : null;
  if (verification === "Closed" && verificationDate === undefined) {
    return { error: "Closed On must be a valid YYYY-MM-DD date" };
  }
  return {
    value: {
      verification,
      reviewDate: verificationDate,
    },
  };
};

const validateFields = (body, { create = false } = {}) => {
  const month = String(body.month || "").trim();
  const target = String(body.target || "").trim();
  const resourceComment = String(body.resourceComment || "").trim();
  const deadline = parseDate(body.deadline);

  if (!MONTH_PATTERN.test(month)) return { error: "Month must be YYYY-MM" };
  if (!target || target.length > 2000) {
    return { error: "KPA target must be 1–2000 characters" };
  }
  if (resourceComment.length > 5000) {
    return { error: "Resource comment is too long" };
  }
  if (deadline === undefined) {
    return { error: "Deadline must be a valid YYYY-MM-DD date" };
  }
  if (create && deadline === null) {
    return { error: "Deadline is required" };
  }
  if (create && (!mongoose.isValidObjectId(body.department) ||
    !mongoose.isValidObjectId(body.employee))) {
    return { error: "Valid department and employee IDs are required" };
  }

  return {
    value: {
      month,
      fiscalYear: getFiscalYear(month),
      target,
      deadline,
      resourceComment,
    },
  };
};

const listIndividualMonthlyKpa = async (req, res, next) => {
  try {
    const { department, employee, fiscalYear, month, status } = req.query;
    if (department && !mongoose.isValidObjectId(department)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }
    if (employee && !mongoose.isValidObjectId(employee)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }
    if (fiscalYear && !FISCAL_YEAR_PATTERN.test(fiscalYear)) {
      return res.status(400).json({ message: "Invalid fiscal year" });
    }
    if (month && !MONTH_PATTERN.test(month)) {
      return res.status(400).json({ message: "Invalid month" });
    }
    if (status && !["Pending", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const access = await getAccess(req);
    if (department && !access.allDepartments &&
      !access.departmentIds.includes(String(department))) {
      return res.status(403).json({ message: "Department access denied" });
    }
    if (employee && !access.canViewOthers && String(employee) !== String(req.user)) {
      return res.status(403).json({ message: "Employee access denied" });
    }

    const records = await IndividualMonthlyKpa.find({
      ...getScopedFilter(req, access),
      ...(department && { department }),
      ...(employee && { employee }),
      ...(fiscalYear && { fiscalYear }),
      ...(month && { month }),
      ...(status && { status }),
    })
      .sort({ month: 1, deadline: 1, createdAt: 1 })
      .populate(DETAIL_POPULATION)
      .lean();

    const holidays = await Event.find({
      company: req.company,
      type: { $regex: /^holidays?$/i },
      active: { $ne: false },
    })
      .select("start end")
      .lean();

    return res.json(
      records.map((record) => ({
        ...record,
        delayedDays: calculateDelayedWorkingDays(
          record.deadline,
          record.closingDate,
          holidays,
        ),
      })),
    );
  } catch (error) {
    return next(error);
  }
};

const getIndividualMonthlyKpaReviewAccess = async (req, res, next) => {
  try {
    const { department } = req.query;
    if (!mongoose.isValidObjectId(department)) {
      return res.status(400).json({ message: "Valid department ID is required" });
    }
    const access = await getAccess(req);
    if (!access.allDepartments && !access.departmentIds.includes(String(department))) {
      return res.status(403).json({ message: "Department access denied" });
    }
    const departmentManager = await isDepartmentManager(req, department, access);
    const canEditManagerReview =
      access.isTopManagement || access.isHr || departmentManager;
    const canEditHrRating = access.isHr;
    return res.json({
      canApproveKpa: access.isTopManagement || access.isHr || departmentManager,
      canEditReview: canEditManagerReview || canEditHrRating,
      canEditManagerReview,
      canEditHrRating,
    });
  } catch (error) {
    return next(error);
  }
};

const listPendingKpaApprovals = async (req, res, next) => {
  try {
    const { department, employee } = req.query;
    if (!mongoose.isValidObjectId(department)) {
      return res.status(400).json({ message: "Valid department ID is required" });
    }
    if (!mongoose.isValidObjectId(employee)) {
      return res.status(400).json({ message: "Valid employee ID is required" });
    }
    const access = await getAccess(req);
    const departmentManager = await isDepartmentManager(req, department, access);
    if (!access.isTopManagement && !access.isHr && !departmentManager) {
      return res.status(403).json({
        message: "Only the department manager, HR or Top Management can view pending approvals",
      });
    }
    const records = await IndividualMonthlyKpa.find({
      company: req.company,
      department,
      employee,
      approvalStatus: "Pending Approval",
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: 1, deadline: 1 })
      .populate(DETAIL_POPULATION)
      .lean();
    return res.json(records);
  } catch (error) {
    return next(error);
  }
};

const approveIndividualMonthlyKpa = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid KPA ID" });
    }
    const access = await getAccess(req);
    const existing = await IndividualMonthlyKpa.findOne({
      _id: req.params.id,
      company: req.company,
      isDeleted: { $ne: true },
    }).select("department approvalStatus");
    if (!existing) return res.status(404).json({ message: "KPA not found" });
    const departmentManager = await isDepartmentManager(
      req,
      existing.department,
      access,
    );
    if (!access.isTopManagement && !access.isHr && !departmentManager) {
      return res.status(403).json({
        message: "Only the department manager, HR or Top Management can approve this KPA",
      });
    }
    if (existing.approvalStatus !== "Pending Approval") {
      return res.status(409).json({ message: "Only pending KPAs can be approved" });
    }
    const approved = await IndividualMonthlyKpa.findOneAndUpdate(
      { _id: existing._id, company: req.company, isDeleted: { $ne: true }, approvalStatus: "Pending Approval" },
      { $set: { approvalStatus: "Approved", approvedBy: req.user, approvedAt: new Date(), updatedBy: req.user } },
      { new: true, runValidators: true },
    ).populate(DETAIL_POPULATION);
    if (!approved) {
      return res.status(409).json({ message: "KPA is no longer pending approval" });
    }
    return res.json(approved);
  } catch (error) {
    return next(error);
  }
};

const rejectIndividualMonthlyKpa = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid KPA ID" });
    }
    const access = await getAccess(req);
    const scope = { _id: req.params.id, company: req.company, isDeleted: { $ne: true } };
    const existing = await IndividualMonthlyKpa.findOne(scope)
      .select("department approvalStatus").lean();
    if (!existing) return res.status(404).json({ message: "KPA not found" });
    const departmentManager = await isDepartmentManager(req, existing.department, access);
    if (!access.isTopManagement && !access.isHr && !departmentManager) {
      return res.status(403).json({
        message: "Only the department manager, HR or Top Management can reject this KPA",
      });
    }
    const rejected = await IndividualMonthlyKpa.findOneAndUpdate(
      { ...scope, approvalStatus: "Pending Approval" },
      { $set: { approvalStatus: "Rejected", rejectedBy: req.user, rejectedAt: new Date(), updatedBy: req.user } },
      { new: true, runValidators: true },
    ).populate(DETAIL_POPULATION);
    if (!rejected) {
      return res.status(409).json({ message: "Only pending KPAs can be rejected" });
    }
    return res.json(rejected);
  } catch (error) {
    return next(error);
  }
};

const getKraKpaDeleteAccess = async (req, res, next) => {
  try {
    const { department } = req.query;
    if (!mongoose.isValidObjectId(department)) {
      return res.status(400).json({ message: "Valid department ID is required" });
    }
    const access = await getAccess(req);
    if (!access.allDepartments && !access.departmentIds.includes(String(department))) {
      return res.status(403).json({ message: "Department access denied" });
    }
    return res.json({ canDelete: await canDeleteKraKpa(req, department, access) });
  } catch (error) {
    return next(error);
  }
};

const createIndividualMonthlyKpa = async (req, res, next) => {
  try {
    if (Object.hasOwn(req.body, "status")) {
      return res.status(400).json({ message: "New KPAs are Pending by default" });
    }
    const validation = validateFields(req.body, { create: true });
    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }

    const { department, employee } = req.body;
    const access = await getAccess(req);
    if (!access.allDepartments && !access.departmentIds.includes(String(department))) {
      return res.status(403).json({ message: "Department access denied" });
    }
    if (!access.canViewOthers && String(employee) !== String(req.user)) {
      return res.status(403).json({ message: "Employee access denied" });
    }

    const validEmployee = await UserData.exists({
      _id: employee,
      company: req.company,
      departments: department,
    });
    if (!validEmployee) {
      return res.status(400).json({ message: "Employee is not in this department" });
    }

    const record = await IndividualMonthlyKpa.create({
      ...validation.value,
      company: req.company,
      department,
      employee,
      approvalStatus:
        access.isManager || access.isTopManagement || access.isHr
          ? "Approved"
          : "Pending Approval",
      ...((access.isManager || access.isTopManagement || access.isHr) && {
        approvedBy: req.user,
        approvedAt: new Date(),
      }),
      createdBy: req.user,
      updatedBy: req.user,
    });
    await record.populate(DETAIL_POPULATION);
    return res.status(201).json(record);
  } catch (error) {
    return next(error);
  }
};

const updateIndividualMonthlyKpa = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid KPA ID" });
    }
    if (Object.hasOwn(req.body, "status")) {
      return res.status(400).json({ message: "Use Mark as Done to complete a KPA" });
    }
    const access = await getAccess(req);
    const record = await IndividualMonthlyKpa.findOne({
      _id: req.params.id,
      ...getScopedFilter(req, access),
    });
    if (!record) return res.status(404).json({ message: "KPA not found" });
    if (
      Object.hasOwn(req.body, "month") &&
      String(req.body.month) !== String(record.month)
    ) {
      return res.status(400).json({ message: "KPA month cannot be changed" });
    }
    const hasKpaDetailFields = ["month", "target", "deadline"].some((field) =>
      Object.hasOwn(req.body, field),
    );
    if (hasKpaDetailFields && !access.canViewOthers) {
      return res.status(403).json({
        message: "Employees can only update KPA completion details",
      });
    }
    if (Object.hasOwn(req.body, "resourceComment")) {
      return res.status(400).json({
        message: "Resource Comment can only be added when marking the KPA as done",
      });
    }
    const review = validateReviewFields(req.body);
    if (review.error) return res.status(400).json({ message: review.error });
    const verification = validateVerificationFields(req.body, record);
    if (verification.error) return res.status(400).json({ message: verification.error });
    const departmentManager = await isDepartmentManager(req, record.department, access);
    const canEditManagerReview =
      access.isTopManagement || access.isHr || departmentManager;
    const canEditHrRating = access.isHr;
    const hasManagerReviewFields = [
      "managerComments",
      "kpaRating",
      "managerRatingDate",
      "verification",
      "verificationDate",
    ].some((field) => Object.hasOwn(req.body, field));
    const hasHrReviewFields = ["hrComments", "hrRating", "hrRatingDate"].some((field) =>
      Object.hasOwn(req.body, field),
    );
    if (hasManagerReviewFields && !canEditManagerReview) {
      return res.status(403).json({
        message: "Only HR, Top Management, or this department's manager can edit manager review fields",
      });
    }
    if (hasHrReviewFields && !canEditHrRating) {
      return res.status(403).json({
        message: "Only HR can edit HR rating fields",
      });
    }
    const nextHrRating = review.value && Object.hasOwn(review.value, "hrRating")
      ? review.value.hrRating
      : record.hrRating;
    const nextManagerRating = review.value && Object.hasOwn(review.value, "kpaRating")
      ? review.value.kpaRating
      : record.kpaRating;
    const isSubmittingHrComments = Boolean(
      review.value && Object.hasOwn(review.value, "hrComments"),
    );
    const nextVerification = verification.value?.verification || record.verification;
    const isSubmittingRating =
      (review.value &&
        Object.hasOwn(review.value, "kpaRating") &&
        review.value.kpaRating !== null) ||
      (review.value &&
        Object.hasOwn(review.value, "hrRating") &&
        review.value.hrRating !== null);
    if (isSubmittingRating && nextVerification !== "Closed") {
      return res.status(409).json({
        message: "Review Status must be Closed before adding ratings",
      });
    }
    if (
      (isSubmittingHrComments ||
        (nextHrRating !== null && nextHrRating !== undefined)) &&
      (nextManagerRating === null || nextManagerRating === undefined)
    ) {
      return res.status(409).json({
        message: "Manager Rating is required before HR Comments or HR Rating can be added",
      });
    }
    if (verification.value && record.status !== "Completed") {
      return res.status(409).json({
        message: "Complete the KPA before updating its Review Status",
      });
    }
    if (
      verification.value?.verification === "Changes Required" &&
      !(review.value?.managerComments || record.managerComments)?.trim()
    ) {
      return res.status(400).json({
        message: "Manager Comments are required when changes are requested",
      });
    }

    const validation = validateFields({
      month: req.body.month ?? record.month,
      target: req.body.target ?? record.target,
      deadline: req.body.deadline === undefined
        ? record.deadline?.toISOString().slice(0, 10) || null
        : req.body.deadline,
      resourceComment: req.body.resourceComment ?? record.resourceComment,
    });
    if (validation.error) {
      return res.status(400).json({ message: validation.error });
    }
    const editHistoryBefore = getEditHistorySnapshot(record);

    const previousManagerComments = record.managerComments || "";
    const nextManagerComments =
      review.value && Object.hasOwn(review.value, "managerComments")
        ? review.value.managerComments
        : previousManagerComments;
    const managerCommentsChanged =
      nextManagerComments !== previousManagerComments;

    Object.assign(record, validation.value, review.value || {}, {
      updatedBy: req.user,
    });
    // Capture submitted fields before review processing resets related values.
    const submittedChanges = { ...getEditHistorySnapshot(record) };
    if (verification.value && Object.hasOwn(req.body, "verification")) {
      submittedChanges.verification = verification.value.verification;
    }
    if (verification.value?.verification === "Closed" && Object.hasOwn(req.body, "verificationDate")) {
      submittedChanges.verificationClosedDate = verification.value.reviewDate;
    }
    const editHistoryChanges = getEditHistoryChanges(editHistoryBefore, submittedChanges)
      .filter(({ field }) => Object.hasOwn(
        req.body,
        field === "verificationClosedDate" ? "verificationDate" : field,
      ));
    if (verification.value) {
      const reviewStatusChanged =
        record.verification !== verification.value.verification;
      const repeatedChangesRequired =
        record.verification === "Changes Required" &&
        verification.value.verification === "Changes Required" &&
        record.status === "Completed";
      record.verification = verification.value.verification;
      if (
        reviewStatusChanged ||
        repeatedChangesRequired ||
        managerCommentsChanged
      ) {
        const reviewedAt = new Date();
        record.managerReviewedBy = req.user;
        record.managerReviewedAt = reviewedAt;
        record.verifiedBy = req.user;
        if (!Array.isArray(record.managerReviewHistory)) {
          record.managerReviewHistory = [];
        }
        record.managerReviewHistory.push({
          status: verification.value.verification,
          reviewedBy: req.user,
          reviewedAt,
          managerComments: nextManagerComments,
        });
      }
      const reviewDate = verification.value.reviewDate || new Date();

      if (record.verification === "Changes Required") {
        record.status = "Pending";
        record.closingDate = null;
        record.verificationClosedDate = null;
        record.kpaRating = null;
        record.managerRatingDate = null;
        record.hrRating = null;
        record.hrRatingDate = null;
      } else if (record.verification === "Closed") {
        record.verificationClosedDate = reviewDate;
      }
    }
    if (editHistoryChanges.length > 0) {
      if (!Array.isArray(record.editHistory)) record.editHistory = [];
      record.editHistory.push({
        editedBy: req.user,
        editedAt: new Date(),
        changes: editHistoryChanges,
      });
    }
    await record.save();
    await record.populate(DETAIL_POPULATION);
    return res.json(record);
  } catch (error) {
    return next(error);
  }
};

const completeIndividualMonthlyKpa = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid KPA ID" });
    }
    const access = await getAccess(req);
    const scope = { _id: req.params.id, ...getScopedFilter(req, access) };
    const existing = await IndividualMonthlyKpa.findOne(scope)
      .select("status createdBy employee verification approvalStatus")
      .lean();
    if (!existing) return res.status(404).json({ message: "KPA not found" });
    if (existing.approvalStatus && existing.approvalStatus !== "Approved") {
      return res.status(409).json({
        message: "KPA must be approved before it can be marked as done",
      });
    }
    const canComplete = String(existing.employee) === String(req.user);
    if (!canComplete) {
      return res.status(403).json({
        message: "Only the assigned employee can mark the KPA as done",
      });
    }
    if (existing.status !== "Pending") {
      return res.status(409).json({ message: "KPA is already completed" });
    }

    const resourceComment = typeof req.body?.resourceComment === "string"
      ? req.body.resourceComment.trim()
      : "";
    if (resourceComment.length > 5000) {
      return res.status(400).json({ message: "Resource Comment is too long" });
    }
    const completedAt = new Date();
    const statusChanges = [{
      field: "status",
      label: EDIT_HISTORY_FIELDS.status,
      oldValue: existing.status,
      newValue: "Completed",
    }];
    const record = await IndividualMonthlyKpa.findOneAndUpdate(
      {
        ...scope,
        status: "Pending",
        employee: req.user,
        verification: existing.verification,
      },
      {
        $set: {
          status: "Completed",
          closingDate: completedAt,
          resourceComment,
          ...(existing.verification === "Changes Required" && {
            verification: "Pending",
          }),
          updatedBy: req.user,
        },
        $push: {
          editHistory: {
            editedBy: req.user,
            editedAt: completedAt,
            changes: statusChanges,
          },
          completionHistory: {
            completedBy: req.user,
            completedAt,
            resourceComment,
          },
        },
      },
      { new: true, runValidators: true },
    ).populate(DETAIL_POPULATION);
    if (record) return res.json(record);
    return res.status(409).json({ message: "KPA could not be completed" });
  } catch (error) {
    return next(error);
  }
};

const deleteIndividualMonthlyKpa = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid KPA ID" });
    }
    const access = await getAccess(req);
    const existing = await IndividualMonthlyKpa.findOne({
      _id: req.params.id,
      ...getScopedFilter(req, access),
    }).select("department").lean();
    if (!existing) return res.status(404).json({ message: "KPA not found" });
    if (!await canDeleteKraKpa(req, existing.department, access)) {
      return res.status(403).json({
        message: "Only Top Management or this department's manager can delete a KPA",
      });
    }
    const record = await IndividualMonthlyKpa.findOneAndUpdate(
      { _id: req.params.id, ...getScopedFilter(req, access) },
      { isDeleted: true, updatedBy: req.user },
      { new: true },
    );
    if (!record) return res.status(404).json({ message: "KPA not found" });
    return res.json({ message: "Individual Monthly KPA deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listIndividualMonthlyKpa,
  listPendingKpaApprovals,
  getIndividualMonthlyKpaReviewAccess,
  getKraKpaDeleteAccess,
  createIndividualMonthlyKpa,
  approveIndividualMonthlyKpa,
  rejectIndividualMonthlyKpa,
  updateIndividualMonthlyKpa,
  completeIndividualMonthlyKpa,
  deleteIndividualMonthlyKpa,
};
