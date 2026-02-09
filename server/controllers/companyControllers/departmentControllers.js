const Department = require("../../models/Departments");
const User = require("../../models/hr/UserData");
const Role = require("../../models/roles/Roles");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const mongoose = require("mongoose");
const crypto = require("crypto");
const Company = require("../../models/hr/Company");

// const createDepartment = async (req, res, next) => {
//   try {
//     const deptName = req.body?.deptName?.trim();

//     if (!deptName) {
//       return res.status(400).json({
//         message: "Department name is required",
//       });
//     }

//     // Prevent duplicate departments (case-insensitive)
//     const existingDepartment = await Department.findOne({
//       name: { $regex: `^${deptName}$`, $options: "i" },
//     }).lean();

//     if (existingDepartment) {
//       return res.status(409).json({
//         message: "Department already exists",
//       });
//     }

//     const departmentId = `D-000${crypto.randomInt(100)}`;

//     await Department.create({
//       name: deptName,
//       departmentId,
//     });

//     return res.status(201).json({
//       message: "Department created successfully",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const createDepartment = async (req, res, next) => {
  try {
    const deptName = req.body?.deptName?.trim();
    const companyId = req.userData.company;

    if (!deptName) {
      return res.status(400).json({ message: "Department name is required" });
    }

    // 1️⃣ Prevent duplicate departments (case-insensitive)
    const existingDepartment = await Department.findOne({
      name: { $regex: `^${deptName}$`, $options: "i" },
    }).lean();

    if (existingDepartment) {
      return res.status(409).json({ message: "Department already exists" });
    }

    // 2️⃣ Create Department
    const departmentId = `D-000${crypto.randomInt(100)}`;
    const department = await Department.create({
      name: deptName,
      departmentId,
    });

    // 3️⃣ Create roles
    const normalizedDept = deptName.toUpperCase().replace(/\s+/g, "_");

    const adminRolePayload = {
      roleTitle: `${deptName} Admin`,
      roleID: `ROLE_${normalizedDept}_ADMIN`,
    };

    const employeeRolePayload = {
      roleTitle: `${deptName} Employee`,
      roleID: `ROLE_${normalizedDept}_EMPLOYEE`,
    };

    const [adminRole, employeeRole] = await Role.insertMany([
      adminRolePayload,
      employeeRolePayload,
    ]);

    // 4️⃣ Add department to company.selectedDepartments
    await Company.updateOne(
      { _id: companyId },
      {
        $push: {
          selectedDepartments: {
            department: department._id,
            admin: adminRole._id,
            assetCategories: [],
            ticketIssues: [],
            policies: [],
            sop: [],
          },
        },
      },
    );

    return res.status(201).json({
      message: "Department created successfully",
      data: {
        department,
        roles: {
          admin: adminRole,
          employee: employeeRole,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDepartments = async (req, res, next) => {
  try {
    // Fetch all departments
    const departments = await Department.find()
      //  .populate("company", "companyName") // Populate company reference with selected fields
      //.populate("admin", "name email") // Populate admin reference with selected fields
      //.populate("designations", "title responsibilities") // Populate admin reference with selected fields
      .exec();

    return res.status(200).json(departments);
  } catch (error) {
    next(error);
  }
};

const editDepartment = async (req, res, next) => {
  const { company } = req.userData;

  const { departmentId, name, managerId, roleId } = req.body;

  try {
    if (!departmentId) {
      return res.status(400).json({ message: "Department ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }

    if (!name && !managerId) {
      return res.status(400).json({ message: "No update fields provided" });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const departmentNameExists = await Department.findOne({
      name,
      _id: { $ne: departmentId },
    });

    if (name && departmentNameExists) {
      return res.status(400).json({ message: "Department name exists" });
    }

    if (name) {
      department.name = name;
    }

    const updatedDepartment = await department.save();

    let updatedManager = null;
    if (managerId) {
      if (!mongoose.Types.ObjectId.isValid(managerId)) {
        return res.status(400).json({ message: "Invalid manager ID" });
      }

      const departmentName = (name || department.name || "").trim();
      if (!departmentName) {
        return res
          .status(400)
          .json({ message: "Department name is required to assign a manager" });
      }

      const [manager, role] = await Promise.all([
        User.findById(managerId),
        Role.findOne({
          _id: roleId,
        }),
      ]);

      if (!manager) {
        return res.status(404).json({ message: "Manager not found" });
      }

      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      const currentAdmin = await User.findOne({
        company,
        departments: department._id,
        role: role._id,
      });

      if (currentAdmin && currentAdmin._id.toString() !== managerId) {
        await User.updateOne(
          { _id: currentAdmin._id },
          {
            $pull: {
              departments: department._id,
              role: role._id,
            },
          },
        );
      }

      updatedManager = await User.findByIdAndUpdate(
        managerId,
        {
          $addToSet: {
            departments: department._id,
            role: role._id,
          },
        },
        { new: true },
      );
    }

    return res.status(200).json({
      message: "Department updated successfully",
      department: updatedDepartment,
      manager: updatedManager,
    });
  } catch (error) {
    next(error);
  }
};

const markDepartmentStatus = async (req, res, next) => {
  const { departmentId, isActive } = req.body;

  try {
    if (!departmentId) {
      return res.status(400).json({ message: "Department ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }

    if (typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ message: "isActive must be a boolean value" });
    }

    const updatedDepartment = await Department.findByIdAndUpdate(
      departmentId,
      { isActive },
      { new: true },
    );

    if (!updatedDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }

    return res.status(200).json({
      message: "Department status updated successfully",
      department: updatedDepartment,
    });
  } catch (error) {
    next(error);
  }
};

const assignAdmin = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Assign Admin";
  const logSourceKey = "department";
  const { departmentId, adminId } = req.body;
  const { user, ip, company } = req;

  try {
    if (!departmentId || !adminId) {
      throw new CustomError(
        "Department and Admin IDs are required",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Validate the admin reference
    const admin = await User.findById(adminId);
    if (!admin) {
      throw new CustomError("User not found", logPath, logAction, logSourceKey);
    }

    // Validate the department reference
    const department = await Department.findById(departmentId);
    if (!department) {
      throw new CustomError(
        "Department not found",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Update the department's admin field
    department.admin = admin._id;
    const updatedDepartment = await department.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Admin assigned successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updatedDepartment._id,
      changes: { admin: updatedDepartment.admin },
    });

    return res.status(200).json({
      message: "Admin assigned successfully",
      department: updatedDepartment,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500),
      );
    }
  }
};

module.exports = {
  createDepartment,
  assignAdmin,
  getDepartments,
  editDepartment,
  markDepartmentStatus,
};
