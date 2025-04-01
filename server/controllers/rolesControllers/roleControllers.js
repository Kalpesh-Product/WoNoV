const Role = require("../../models/roles/Roles"); // Adjust path as needed
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");

const addRole = async (req, res, next) => {
  const { user, company, ip } = req;
  const logPath = "roles/RoleLog";
  const logAction = "Add Role";
  const logSourceKey = "role";

  try {
    const { roleTitle } = req.body;

    if (!roleTitle) {
      throw new CustomError(
        "Role title is required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const roleExists = await Role.findOne({ roleTitle }).lean().exec();
    if (roleExists) {
      throw new CustomError(
        "Role already exists",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const newRole = new Role({ roleTitle });
    await newRole.save();

    // Success log for role creation
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Role added successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: newRole._id,
      changes: { roleTitle },
    });

    return res.status(201).json({ message: "Role added successfully" });
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

const getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find().lean().exec();
    return res.status(200).json(roles);
  } catch (error) {
    next(error);
  }
};

module.exports = { addRole, getRoles };
