const buildHierarchy = (users) => {
  const roleToUserMap = new Map();

  // Step 1: Map roles to users
  users.forEach((user) => {
    user.role.forEach((r) => {
      if (!roleToUserMap.has(r.roleTitle)) {
        roleToUserMap.set(r.roleTitle, []);
      }
      roleToUserMap.get(r.roleTitle).push(user._id.toString());
    });
  });

  const userMap = new Map();

  // Step 2: Populate userMap with user details
  users.forEach((user) => {
    userMap.set(user._id.toString(), {
      _id: user._id,
      empId: user.empId,
      name: `${user.firstName} ${user.middleName || ""} ${
        user.lastName
      }`.trim(),
      email: user.email,
      phone: user.phone,
      departments: user.departments.map((dept) => dept.name), // Multiple departments
      designation: user.designation,
      workLocation: user.workLocation,
      roles: user.role.map((r) => r.roleTitle), // Multiple roles
      reportsTo: user.reportsTo ? user.reportsTo.roleTitle : null,
      status: user.isActive,
      subordinates: [],
    });
  });

  let roots = [];

  // Step 3: Assign subordinates based on reporting roles
  userMap.forEach((user) => {
    if (user.reportsTo && roleToUserMap.has(user.reportsTo)) {
      const managers = roleToUserMap.get(user.reportsTo);
      managers.forEach((managerId) => {
        if (userMap.has(managerId)) {
          userMap.get(managerId).subordinates.push(user);
        }
      });
    } else {
      roots.push(user); // If no valid manager, it's a root user
    }
  });

  return roots.length === 1 ? roots[0] : roots; // Return single root object or array
};

module.exports = buildHierarchy;
