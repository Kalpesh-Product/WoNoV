const isEmployeeRoleUser = (user) =>
  (Array.isArray(user?.role) ? user.role : []).some((role) =>
    /employee\s*$/i.test(String(role?.roleTitle || role).trim()),
  );

export default isEmployeeRoleUser;
