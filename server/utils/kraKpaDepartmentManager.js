const Company = require("../models/hr/Company");
const UserData = require("../models/hr/UserData");

const isDepartmentManager = async (req, departmentId, access) => {
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

module.exports = isDepartmentManager;
