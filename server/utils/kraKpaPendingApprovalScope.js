// Use the same department-manager check as individual approve/reject actions.
const getPendingApprovalScope = async (req, access, { isDepartmentManager, isValidObjectId }) => {
  const { department, employee } = req.query;
  if (department && !isValidObjectId(department)) return { status: 400, message: "Invalid department ID" };
  if (employee && !isValidObjectId(employee)) return { status: 400, message: "Invalid employee ID" };
  const filter = { company: req.company, approvalStatus: "Pending Approval", isDeleted: { $ne: true } };
  if (employee) filter.employee = employee;
  if (access.isTopManagement || access.isHr) {
    if (department) filter.department = department;
    return { filter };
  }
  const candidates = department ? [String(department)] : access.departmentIds;
  const managed = (await Promise.all(candidates.map(async (id) =>
    await isDepartmentManager(req, id, access) ? id : null))).filter(Boolean);
  if (!managed.length) return { status: 403, message: "Only the department manager, HR or Top Management can view pending approvals" };
  filter.department = department || { $in: managed };
  return { filter };
};

module.exports = { getPendingApprovalScope };
