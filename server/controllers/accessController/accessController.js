const Permissions = require("../../models/Permissions");
const masterPermissions = require("../../config/masterPermissions");
const Company = require("../../models/hr/Company");
const CustomError = require("../../utils/customErrorlogs");
const UserData = require("../../models/hr/UserData");
const { createLog } = require("../../utils/moduleLogs");

const userPermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.company;

    const company = await Company.findById(companyId).populate(
      "selectedDepartments"
    );
    if (!company) return res.status(404).json({ error: "Company not found" });

    const selectedDepartments = company.selectedDepartments.map((dept) =>
      dept.department.toString()
    );

    // Step 2: Fetch user's granted permissions
    const userPermissions = await Permissions.findOne({
      user: id,
      company: companyId,
    });

    let grantedPermissionsMap = {};

    if (userPermissions) {
      userPermissions.deptWisePermissions.forEach((deptPerm) => {
        const deptId = deptPerm.department.toString();
        grantedPermissionsMap[deptId] = {};

        deptPerm.modules.forEach((mod) => {
          grantedPermissionsMap[deptId][mod.moduleName] = {};

          mod.submodules.forEach((sub) => {
            grantedPermissionsMap[deptId][mod.moduleName][sub.submoduleName] =
              sub.actions;
          });
        });
      });
    }

    // Step 3: Prepare the response JSON
    let permissionResponse = [];

    masterPermissions.forEach((dept) => {
      // Only process if the department is selected by the company
      if (selectedDepartments.includes(dept.departmentId)) {
        let deptData = {
          departmentId: dept.departmentId,
          departmentName: dept.departmentName,
          modules: [],
        };

        dept.modules.forEach((mod) => {
          let moduleData = {
            name: mod.name,
            submodules: [],
          };

          mod.submodules.forEach((sub) => {
            const grantedActions =
              grantedPermissionsMap[dept.departmentId]?.[mod.name]?.[
                sub.submoduleName
              ] || [];
            const availableActions =
              grantedActions.length > 0
                ? sub.actions.filter(
                    (action) => !grantedActions.includes(action)
                  )
                : sub.actions; // If no granted actions, all actions are available

            moduleData.submodules.push({
              submoduleName: sub.submoduleName,
              grantedActions,
              availableActions,
            });
          });

          deptData.modules.push(moduleData);
        });

        permissionResponse.push(deptData);
      }
    });

    if (!userPermissions) {
      permissionResponse = masterPermissions
        .filter((dept) => selectedDepartments.includes(dept.departmentId))
        .map((dept) => ({
          departmentId: dept.departmentId,
          departmentName: dept.departmentName,
          modules: dept.modules.map((mod) => ({
            name: mod.name,
            submodules: mod.submodules.map((sub) => ({
              submoduleName: sub.submoduleName,
              grantedActions: [],
              availableActions: sub.actions,
            })),
          })),
        }));
    }

    return res.status(200).json(permissionResponse);
  } catch (error) {
    next(error);
  }
};

// const modifyUserPermissions = async (req, res, next) => {
//   try {
//     const { userId, permissions } = req.body;
//     const companyId = req.company;

//     if (!userId || !companyId || !Array.isArray(permissions)) {
//       return res.status(400).json({ error: "Invalid request data" });
//     }

//     const foundUser = await UserData.findOne({ _id: userId })
//       .select("permissions")
//       .lean()
//       .exec();
//     if (!foundUser) return res.status(404).json({ error: "User not found" });

//     // Fetch Company & Validate Departments
//     const company = await Company.findById(companyId).populate(
//       "selectedDepartments"
//     );
//     if (!company) return res.status(404).json({ error: "Company not found" });

//     const selectedDepartments = new Set(
//       company.selectedDepartments.map((dept) => dept.department.toString())
//     );

//     // Fetch Existing Permissions or Create a New Entry
//     let userPermission = await Permissions.findOne({
//       user: userId,
//       company: companyId,
//     });
//     if (!userPermission) {
//       userPermission = new Permissions({
//         company: companyId,
//         user: userId,
//         deptWisePermissions: [],
//       });
//     }

//     // Create a map for quick lookup of existing permissions
//     const existingPermissions = new Map();
//     for (const dept of userPermission.deptWisePermissions) {
//       existingPermissions.set(dept.department.toString(), dept);
//     }

//     const updatedDeptWisePermissions = [];

//     // Process Each Permission
//     for (const { departmentId, modules } of permissions) {
//       if (!selectedDepartments.has(departmentId) || !Array.isArray(modules)) {
//         return res.status(400).json({ error: "Invalid permission data" });
//       }

//       // Fetch or initialize department permissions
//       let deptPermissions = existingPermissions.get(departmentId) || {
//         department: departmentId,
//         modules: [],
//       };

//       const updatedModules = [];

//       for (const { moduleName, submodules } of modules) {
//         if (!moduleName || !Array.isArray(submodules)) {
//           return res.status(400).json({ error: "Invalid module data" });
//         }

//         // Validate module against master permissions
//         const departmentPermissions = masterPermissions.find(
//           (dept) => dept.departmentId === departmentId
//         );
//         if (!departmentPermissions)
//           return res
//             .status(400)
//             .json({ error: "Invalid department permissions" });

//         const modulePermissions = departmentPermissions.modules.find(
//           (mod) => mod.name?.trim() === moduleName?.trim()
//         );
//         if (!modulePermissions)
//           return res.status(400).json({ error: "Invalid module" });

//         const updatedSubmodules = [];

//         for (const { submoduleName, actions } of submodules) {
//           if (!submoduleName || !Array.isArray(actions)) {
//             return res.status(400).json({ error: "Invalid submodule data" });
//           }

//           // Validate submodule and actions
//           const submodulePermissions = modulePermissions.submodules.find(
//             (sub) => sub.submoduleName?.trim() === submoduleName?.trim()
//           );
//           if (!submodulePermissions)
//             return res.status(400).json({ error: "Invalid submodule" });

//           const validActions = submodulePermissions.actions;
//           const filteredActions = actions.filter((action) =>
//             validActions.includes(action)
//           );

//           // Only add submodules with at least one valid action
//           if (filteredActions.length > 0) {
//             updatedSubmodules.push({ submoduleName, actions: filteredActions });
//           }
//         }

//         // Only add modules with at least one valid submodule
//         if (updatedSubmodules.length > 0) {
//           updatedModules.push({ moduleName, submodules: updatedSubmodules });
//         }
//       }

//       // Only add departments with at least one valid module
//       if (updatedModules.length > 0) {
//         deptPermissions.modules = updatedModules;
//         updatedDeptWisePermissions.push(deptPermissions);
//       }
//     }

//     // Update user permissions
//     userPermission.deptWisePermissions = updatedDeptWisePermissions;
//     const updatedUserPermission = await userPermission.save();

//     // If user has no existing permission reference, update it
//     if (!foundUser.permissions) {
//       await UserData.findOneAndUpdate(
//         { _id: userId },
//         { permissions: updatedUserPermission._id }
//       );
//     }

//     res
//       .status(200)
//       .json({ message: "Permissions updated successfully", userPermission });
//   } catch (error) {
//     next(error);
//   }
// };

const modifyUserPermissions = async (req, res, next) => {
  const logPath = "AccessLog";
  const logAction = "Modify User Permissions";
  const logSourceKey = "permissions";

  try {
    const { userId, permissions } = req.body;
    const companyId = req.company;

    // Validate input data
    if (!userId || !companyId || !Array.isArray(permissions)) {
      throw new CustomError(
        "Invalid request data",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundUser = await UserData.findOne({ _id: userId })
      .select("permissions")
      .lean()
      .exec();
    if (!foundUser) {
      throw new CustomError("User not found", logPath, logAction, logSourceKey);
    }

    // Fetch Company & Validate Departments
    const company = await Company.findById(companyId).populate(
      "selectedDepartments"
    );
    if (!company) {
      throw new CustomError(
        "Company not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const selectedDepartments = new Set(
      company.selectedDepartments.map((dept) => dept.department.toString())
    );

    // Fetch Existing Permissions or Create a New Entry
    let userPermission = await Permissions.findOne({
      user: userId,
      company: companyId,
    });
    if (!userPermission) {
      userPermission = new Permissions({
        company: companyId,
        user: userId,
        deptWisePermissions: [],
      });
    }

    // Create a map for quick lookup of existing permissions by department
    const existingPermissions = new Map();
    for (const dept of userPermission.deptWisePermissions) {
      existingPermissions.set(dept.department.toString(), dept);
    }

    const updatedDeptWisePermissions = [];

    // Process each permission provided in the request
    for (const { departmentId, modules } of permissions) {
      if (!selectedDepartments.has(departmentId) || !Array.isArray(modules)) {
        throw new CustomError(
          "Invalid permission data",
          logPath,
          logAction,
          logSourceKey
        );
      }

      // Retrieve or initialize department permissions
      let deptPermissions = existingPermissions.get(departmentId) || {
        department: departmentId,
        modules: [],
      };

      const updatedModules = [];

      for (const { moduleName, submodules } of modules) {
        if (!moduleName || !Array.isArray(submodules)) {
          throw new CustomError(
            "Invalid module data",
            logPath,
            logAction,
            logSourceKey
          );
        }

        // Validate module against master permissions (assuming masterPermissions is in scope)
        const departmentPermissions = masterPermissions.find(
          (dept) => dept.departmentId === departmentId
        );
        if (!departmentPermissions) {
          throw new CustomError(
            "Invalid department permissions",
            logPath,
            logAction,
            logSourceKey
          );
        }

        const modulePermissions = departmentPermissions.modules.find(
          (mod) => mod.name?.trim() === moduleName?.trim()
        );
        if (!modulePermissions) {
          throw new CustomError(
            "Invalid module",
            logPath,
            logAction,
            logSourceKey
          );
        }

        const updatedSubmodules = [];

        for (const { submoduleName, actions } of submodules) {
          if (!submoduleName || !Array.isArray(actions)) {
            throw new CustomError(
              "Invalid submodule data",
              logPath,
              logAction,
              logSourceKey
            );
          }

          // Validate submodule and actions
          const submodulePermissions = modulePermissions.submodules.find(
            (sub) => sub.submoduleName?.trim() === submoduleName?.trim()
          );
          if (!submodulePermissions) {
            throw new CustomError(
              "Invalid submodule",
              logPath,
              logAction,
              logSourceKey
            );
          }

          const validActions = submodulePermissions.actions;
          const filteredActions = actions.filter((action) =>
            validActions.includes(action)
          );

          // Only add submodules if at least one valid action remains
          if (filteredActions.length > 0) {
            updatedSubmodules.push({ submoduleName, actions: filteredActions });
          }
        }

        // Only add modules with at least one valid submodule
        if (updatedSubmodules.length > 0) {
          updatedModules.push({ moduleName, submodules: updatedSubmodules });
        }
      }

      // Only add departments with at least one valid module
      if (updatedModules.length > 0) {
        deptPermissions.modules = updatedModules;
        updatedDeptWisePermissions.push(deptPermissions);
      }
    }

    // Update user permissions document
    userPermission.deptWisePermissions = updatedDeptWisePermissions;
    const updatedUserPermission = await userPermission.save();

    // If user has no existing permission reference in their profile, update it
    if (!foundUser.permissions) {
      await UserData.findOneAndUpdate(
        { _id: userId },
        { permissions: updatedUserPermission._id }
      );
    }

    // Log the successful update of user permissions
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Permissions updated successfully",
      status: "Success",
      user: req.user,
      ip: req.ip,
      company: companyId,
      sourceKey: logSourceKey,
      sourceId: updatedUserPermission._id,
      changes: { deptWisePermissions: updatedDeptWisePermissions },
    });

    return res.status(200).json({
      message: "Permissions updated successfully",
      userPermission: updatedUserPermission,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

module.exports = { userPermissions, modifyUserPermissions };
