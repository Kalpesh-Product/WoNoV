const GLOBAL_REPORT_ROLES = new Set(["Master Admin", "Super Admin"]);

const getRoleTitle = (role) => {
  if (typeof role === "string") return role;
  return role?.roleTitle || role?.title || role?.name || "";
};

const hasGlobalReportAccess = (roles = []) =>
  (Array.isArray(roles) ? roles : [roles]).some((role) =>
    GLOBAL_REPORT_ROLES.has(getRoleTitle(role)),
  );

const hasDepartmentAdminAccess = (roles = []) =>
  (Array.isArray(roles) ? roles : [roles]).some((role) => {
    const roleTitle = getRoleTitle(role);

    return roleTitle.endsWith(" Admin") && !GLOBAL_REPORT_ROLES.has(roleTitle);
  });

module.exports = {
  hasDepartmentAdminAccess,
  hasGlobalReportAccess,
};
