const Department = require("../../models/Departments");
const User = require("../../models/hr/UserData");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");

const createDepartment = async (req, res, next) => {
  const { deptId, deptName } = req.body;
  const user = req.user;
  const ip = req.ip;
  const company = req.company;
  const logPath = "hr/HrLog";
  const logAction = "Create Department";
  const logSourceKey = "department";

  try {
    if (!deptId || !deptName) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (mongoose.Types.ObjectId.isValid(deptId)) {
      throw new CustomError(
        "Invalid department ID",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const deptExists = await Department.findOne({ departmentId: deptId })
      .lean()
      .exec();
    if (deptExists) {
      throw new CustomError(
        "Department already exists",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const newDept = new Department({
      departmentId: deptId,
      name: deptName,
    });

    await newDept.save();

    // Log the successful department creation
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "New department created",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: newDept._id,
      changes: { deptId, deptName },
    });

    return res.status(201).json({ message: "New department created" });
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

const getDepartments = async (req, res, next) => {
  try {
    // Fetch all departments
    const departments = await Department.find()
      .populate("company", "companyName") // Populate company reference with selected fields
      .populate("admin", "name email") // Populate admin reference with selected fields
      .populate("designations", "title responsibilities") // Populate admin reference with selected fields
      .exec();

    res.status(200).json({
      message: "Departments fetched successfully",
      departments,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
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
        logSourceKey
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
        logSourceKey
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
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

module.exports = { createDepartment, assignAdmin, getDepartments };
