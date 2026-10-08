const mongoose = require("mongoose");
const Company = require("../../models/hr/Company");
const Department = require("../../models/Departments");
const UserData = require("../../models/hr/UserData");
const SelfKra = require("../../models/performances/KraKpaSelfKra");
const SelfKraCompletion = require("../../models/performances/KraKpaSelfKraCompletion");

const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const toOccurrenceDate = (value = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
const isValidOccurrenceDate = (value) => {
  if (!DATE_PATTERN.test(value || "")) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const DETAIL_POPULATION = [
  { path: "employee", select: "firstName middleName lastName" },
  { path: "department", select: "name" },
  { path: "lead", select: "firstName middleName lastName empId" },
  { path: "createdBy", select: "firstName middleName lastName empId" },
];
const COMPLETION_POPULATION = [
  { path: "employee", select: "firstName middleName lastName" },
  { path: "department", select: "name" },
  { path: "lead", select: "firstName middleName lastName empId" },
  { path: "createdBy", select: "firstName middleName lastName empId" },
  { path: "completedBy", select: "firstName middleName lastName empId" },
];

const getAccess = async (req) => {
  const roles = (req.roles || []).map((role) => String(role).toLowerCase());
  const departmentIds = (req.departments || [])
    .map((department) => String(department?._id || department))
    .filter((id) => mongoose.isValidObjectId(id));
  const isHr = roles.some((role) => /^hr(?:\s|$)/.test(role));
  const isTopManagement = roles.includes("top management") || Boolean(
    departmentIds.length && await Department.exists({
      _id: { $in: departmentIds },
      name: /^top management$/i,
    }),
  );
  const isManager = roles.some((role) => role.includes("manager"));
  const allDepartments = isHr || isTopManagement || roles.some((role) =>
    ["master admin", "super admin"].includes(role),
  );
  const canViewOthers = allDepartments || roles.some((role) =>
    role.includes("manager") || role.endsWith("admin"),
  );
  return {
    allDepartments,
    canViewOthers,
    canSelectLead: isManager || isTopManagement,
    departmentIds,
    isTopManagement,
  };
};

const canDeleteKraKpa = async (req, departmentId, access) => {
  if (access.isTopManagement) return true;
  if (!access.departmentIds.includes(String(departmentId))) return false;
  const company = await Company.findById(req.company)
    .select("selectedDepartments.department selectedDepartments.admin")
    .lean();
  const assignment = company?.selectedDepartments?.find(
    (item) => String(item.department) === String(departmentId),
  );
  if (!assignment?.admin) return false;
  return Boolean(await UserData.exists({
    _id: req.user,
    company: req.company,
    departments: departmentId,
    role: assignment.admin,
  }));
};

const getScopedFilter = (req, access) => ({
  company: req.company,
  isDeleted: { $ne: true },
  ...(!access.allDepartments && { department: { $in: access.departmentIds } }),
  ...(!access.canViewOthers && { employee: req.user }),
});

const validateKra = (kra) => {
  const title = typeof kra?.title === "string" ? kra.title.trim() : "";
  const description = typeof kra?.description === "string"
    ? kra.description.trim()
    : "";
  if (!title || !description) {
    return { error: "Every KRA requires a title and description" };
  }
  if (title.length > 300) return { error: "KRA title is too long" };
  if (description.length > 3000) return { error: "KRA description is too long" };
  return {
    value: {
      title,
      description,
    },
  };
};

const validateSelectedLead = (lead) => {
  if (!lead || !mongoose.isValidObjectId(lead)) {
    return { error: "Select a valid KRA lead" };
  }
  return { value: lead };
};

const isActiveDepartmentLead = (req, lead, department) => UserData.exists({
  _id: lead,
  company: req.company,
  departments: department,
  isActive: true,
});

const validateScope = async (req, department, employee) => {
  if (!mongoose.isValidObjectId(department) || !mongoose.isValidObjectId(employee)) {
    return { status: 400, message: "Valid department and employee IDs are required" };
  }
  const access = await getAccess(req);
  if (!access.allDepartments && !access.departmentIds.includes(String(department))) {
    return { status: 403, message: "Department access denied" };
  }
  if (!access.canViewOthers && String(employee) !== String(req.user)) {
    return { status: 403, message: "Employee access denied" };
  }
  const validEmployee = await UserData.exists({
    _id: employee,
    company: req.company,
    departments: department,
  });
  if (!validEmployee) {
    return { status: 400, message: "Employee is not in this department" };
  }
  return { access };
};

const listSelfKra = async (req, res, next) => {
  try {
    const { department, employee } = req.query;
    const occurrenceDate = req.query.date || toOccurrenceDate();
    if (!isValidOccurrenceDate(occurrenceDate)) {
      return res.status(400).json({ message: "A valid date in YYYY-MM-DD format is required" });
    }
    if (department && !mongoose.isValidObjectId(department)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }
    if (employee && !mongoose.isValidObjectId(employee)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }
    const access = await getAccess(req);
    if (department && !access.allDepartments &&
      !access.departmentIds.includes(String(department))) {
      return res.status(403).json({ message: "Department access denied" });
    }
    if (employee && !access.canViewOthers && String(employee) !== String(req.user)) {
      return res.status(403).json({ message: "Employee access denied" });
    }
    const templateScope = {
      ...getScopedFilter(req, access),
      ...(department && { department }),
      ...(employee && { employee }),
    };
    const templates = await SelfKra.find({
      ...templateScope,
      title: { $exists: true },
      isActive: { $ne: false },
    })
      .sort({ createdAt: -1 })
      .populate(DETAIL_POPULATION)
      .lean();
    const completions = await SelfKraCompletion.find({
      company: req.company,
      occurrenceDate,
      ...(department && { department }),
      ...(employee && { employee }),
      ...(!access.allDepartments && { department: { $in: access.departmentIds } }),
      ...(!access.canViewOthers && { employee: req.user }),
    })
      .sort({ completedAt: -1 })
      .populate(COMPLETION_POPULATION)
      .lean();

    const completionByTemplate = new Map(
      completions.map((completion) => [String(completion.kraTemplate), completion]),
    );
    const rows = [];
    for (const template of templates) {
      const startsOn = template.startsOn || toOccurrenceDate(template.createdAt);
      if (startsOn > occurrenceDate) continue;
      const completion = completionByTemplate.get(String(template._id));
      if (completion) {
        rows.push({
          ...completion,
          _id: template._id,
          completionId: completion._id,
          closingDate: completion.completedAt,
        });
        completionByTemplate.delete(String(template._id));
        continue;
      }
      const isLegacyCompletion =
        template.status === "Completed" &&
        template.closingDate &&
        toOccurrenceDate(template.closingDate) === occurrenceDate;
      rows.push({
        ...template,
        startsOn,
        status: isLegacyCompletion ? "Completed" : "Pending",
        closingDate: isLegacyCompletion ? template.closingDate : null,
      });
    }
    for (const completion of completionByTemplate.values()) {
      rows.push({
        ...completion,
        _id: completion.kraTemplate,
        completionId: completion._id,
        closingDate: completion.completedAt,
      });
    }
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
};

const listSelfKraLeadOptions = async (req, res, next) => {
  try {
    const { department } = req.query;
    if (!mongoose.isValidObjectId(department)) {
      return res.status(400).json({ message: "A valid department ID is required" });
    }
    const access = await getAccess(req);
    if (!access.canSelectLead) {
      return res.status(403).json({ message: "Lead selection is restricted to managers and Top Management" });
    }
    if (!access.allDepartments && !access.departmentIds.includes(String(department))) {
      return res.status(403).json({ message: "Department access denied" });
    }

    const users = await UserData.find({
      company: req.company,
      departments: department,
      isActive: true,
    })
      .select("firstName middleName lastName empId")
      .sort({ firstName: 1, middleName: 1, lastName: 1 })
      .lean();
    return res.json(users);
  } catch (error) {
    return next(error);
  }
};

const createSelfKra = async (req, res, next) => {
  try {
    const scope = await validateScope(req, req.body.department, req.body.employee);
    if (scope.message) return res.status(scope.status).json({ message: scope.message });
    const validation = validateKra(req.body);
    if (validation.error) return res.status(400).json({ message: validation.error });

    let lead = req.user;
    if (scope.access.canSelectLead) {
      const leadValidation = validateSelectedLead(req.body.lead);
      if (leadValidation.error) {
        return res.status(400).json({ message: leadValidation.error });
      }
      lead = leadValidation.value;
      if (!await isActiveDepartmentLead(req, lead, req.body.department)) {
        return res.status(400).json({ message: "Lead must be an active user in this department" });
      }
    }
    const record = await SelfKra.create({
      ...validation.value,
      lead,
      company: req.company,
      department: req.body.department,
      employee: req.body.employee,
      status: "Pending",
      startsOn: toOccurrenceDate(),
      isActive: true,
      createdBy: req.user,
      updatedBy: req.user,
    });
    await record.populate(DETAIL_POPULATION);
    return res.status(201).json(record);
  } catch (error) {
    return next(error);
  }
};

const updateSelfKra = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid Self KRA ID" });
    }
    if (Object.hasOwn(req.body, "status")) {
      return res.status(400).json({ message: "Use Mark as Done to complete a Self KRA" });
    }
    const occurrenceDate = req.body?.occurrenceDate;
    if (!isValidOccurrenceDate(occurrenceDate) || occurrenceDate !== toOccurrenceDate()) {
      return res.status(400).json({
        message: "A Self KRA can only be edited for today",
      });
    }
    const validation = validateKra(req.body);
    if (validation.error) return res.status(400).json({ message: validation.error });
    const access = await getAccess(req);
    const filter = { _id: req.params.id, ...getScopedFilter(req, access) };
    const existing = await SelfKra.findOne(filter).select("department").lean();
    if (!existing) return res.status(404).json({ message: "Self KRA not found" });

    const changes = { ...validation.value, updatedBy: req.user };
    if (access.canSelectLead) {
      const leadValidation = validateSelectedLead(req.body.lead);
      if (leadValidation.error) {
        return res.status(400).json({ message: leadValidation.error });
      }
      if (!await isActiveDepartmentLead(req, leadValidation.value, existing.department)) {
        return res.status(400).json({ message: "Lead must be an active user in this department" });
      }
      changes.lead = leadValidation.value;
    }
    const record = await SelfKra.findOneAndUpdate(
      filter,
      changes,
      { new: true, runValidators: true },
    ).populate(DETAIL_POPULATION);
    if (!record) return res.status(404).json({ message: "Self KRA not found" });
    return res.json(record);
  } catch (error) {
    return next(error);
  }
};

const completeSelfKra = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid Self KRA ID" });
    }
    const access = await getAccess(req);
    const scope = { _id: req.params.id, ...getScopedFilter(req, access) };
    const occurrenceDate = req.body?.occurrenceDate || toOccurrenceDate();
    if (!isValidOccurrenceDate(occurrenceDate)) {
      return res.status(400).json({ message: "A valid occurrence date is required" });
    }
    if (occurrenceDate !== toOccurrenceDate()) {
      return res.status(400).json({
        message: "A Self KRA can only be marked as done for today",
      });
    }
    const existing = await SelfKra.findOne(scope)
      .select("company department employee title description lead createdBy startsOn createdAt isActive")
      .lean();
    if (!existing) return res.status(404).json({ message: "Self KRA not found" });
    if (existing.isActive === false) {
      return res.status(409).json({ message: "This Self KRA is no longer active" });
    }
    const startsOn = existing.startsOn || toOccurrenceDate(existing.createdAt);
    if (occurrenceDate < startsOn) {
      return res.status(400).json({ message: "KRA cannot be completed before its start date" });
    }
    const canComplete = String(existing.lead) === String(req.user);
    if (!canComplete) {
      return res.status(403).json({
        message: "Only the assigned lead can mark this Self KRA as done",
      });
    }
    const completion = await SelfKraCompletion.create({
      company: existing.company,
      department: existing.department,
      employee: existing.employee,
      kraTemplate: existing._id,
      occurrenceDate,
      title: existing.title,
      description: existing.description,
      lead: existing.lead,
      createdBy: existing.createdBy || existing.employee,
      completedAt: new Date(),
      completedBy: req.user,
    });
    await completion.populate(COMPLETION_POPULATION);
    return res.json(completion);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "This Self KRA is already completed for the selected date" });
    }
    return next(error);
  }
};

const deleteSelfKra = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid Self KRA ID" });
    }
    const access = await getAccess(req);
    const existing = await SelfKra.findOne({
      _id: req.params.id,
      ...getScopedFilter(req, access),
    }).select("department").lean();
    if (!existing) return res.status(404).json({ message: "Self KRA not found" });
    if (!await canDeleteKraKpa(req, existing.department, access)) {
      return res.status(403).json({
        message: "Only Top Management or this department's manager can delete a Self KRA",
      });
    }
    const record = await SelfKra.findOneAndUpdate(
      { _id: req.params.id, ...getScopedFilter(req, access) },
      { isDeleted: true, isActive: false, updatedBy: req.user },
      { new: true },
    );
    if (!record) return res.status(404).json({ message: "Self KRA not found" });
    return res.json({ message: "Self KRA deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listSelfKra,
  listSelfKraLeadOptions,
  createSelfKra,
  updateSelfKra,
  completeSelfKra,
  deleteSelfKra,
};
