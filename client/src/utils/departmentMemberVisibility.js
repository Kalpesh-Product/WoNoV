const normalize = (value) => String(value || "").trim().replace(/\s+/g, " ").toLowerCase();

export const getVisibleDepartmentMembers = (department) => {
  const departmentName = normalize(department?.name);
  const excludedAdmin = ["administration", "administration department"].includes(departmentName)
    ? "finance admin"
    : departmentName === "top management" ? "tech admin" : null;
  return (department?.employees || []).filter((member) => {
    if (!member || member.isActive === false) return false;
    if (!excludedAdmin) return true;
    const roles = Array.isArray(member.role) ? member.role : [member.role];
    const fullName = normalize([member.firstName, member.lastName].filter(Boolean).join(" "));
    return fullName !== excludedAdmin && !roles.some((role) =>
      normalize(typeof role === "string" ? role : role?.roleTitle) === excludedAdmin,
    );
  });
};

export const getVisibleDepartments = (departments = []) => departments
  .filter((department) => department && department.isActive !== false)
  .map((department) => ({ ...department, employees: getVisibleDepartmentMembers(department) }));
