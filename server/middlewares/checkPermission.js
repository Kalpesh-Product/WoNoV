const Permission = require("../models/Permissions");
const User = require("../models/hr/UserData");

const checkPermissions = (requiredPermissions, requiredRole) => {
  return async (req, res, next) => {
    try {
      const { user: userId, company: companyId } = req;

      const user = await User.findById(userId).populate({
        path: "role",
        select: "roleTitle",
      });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      //Check if User Has the Required Role
      const userRoles = new Set(user.role.map((r) => r.roleID)); 

      if (
        userRoles.has(requiredRole) ||
        userRoles.has("ROLE_MASTER_ADMIN") ||
        userRoles.has("ROLE_SUPER_ADMIN")
      ) {
        return next();
      }

      const userPermissions = await Permission.findOne({
        user: userId,
        company: companyId,
      });

      if (!userPermissions) {
        return res
          .status(403)
          .json({ error: "Access Denied: No permissions assigned" });
      }

      let hasPermission = false;

      // Step 4: Check if User Has Required Permissions
      userPermissions.deptWisePermissions.forEach((dept) => {
        dept.modules.forEach((mod) => {
          mod.submodules.forEach((sub) => {
            sub.actions.forEach((action) => {
              if (
                requiredPermissions.includes(
                  `${mod.name}.${sub.submoduleName}.${action}`
                )
              ) {
                hasPermission = true;
              }
            });
          });
        });
      });

      if (hasPermission) {
        return next();
      } else {
        return res
          .status(403)
          .json({ error: "Access Denied: Insufficient permissions" });
      }
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
};

module.exports = checkPermissions;
