const mongoose = require("mongoose");
const Department = require("../../models/Departments");
const UserData = require("../../models/hr/UserData");
const SelfKra = require("../../models/performances/KraKpaSelfKra");

const DETAIL_POPULATION = [
  { path: "employee", select: "firstName middleName lastName" },
  { path: "department", select: "name" },
  { path: "lead", select: "firstName middleName lastName empId" },
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
  };
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
  return { value: { title, description } };
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
    const records = await SelfKra.find({
      ...getScopedFilter(req, access),
      title: { $exists: true },
      ...(department && { department }),
      ...(employee && { employee }),
    })
      .sort({ createdAt: -1 })
      .populate(DETAIL_POPULATION)
      .lean();
    return res.json(records);
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
    const record = await SelfKra.findOneAndUpdate(
      { ...scope, status: "Pending" },
      { status: "Completed", closingDate: new Date(), updatedBy: req.user },
      { new: true, runValidators: true },
    ).populate(DETAIL_POPULATION);
    if (record) return res.json(record);
    const existing = await SelfKra.findOne(scope).select("status").lean();
    if (!existing) return res.status(404).json({ message: "Self KRA not found" });
    return res.status(409).json({ message: "Self KRA is already completed" });
  } catch (error) {
    return next(error);
  }
};

const deleteSelfKra = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid Self KRA ID" });
    }
    const access = await getAccess(req);
    const record = await SelfKra.findOneAndUpdate(
      { _id: req.params.id, ...getScopedFilter(req, access) },
      { isDeleted: true, updatedBy: req.user },
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
