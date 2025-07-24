const Permissions = require("../../models/Permissions");
const masterPermissions = require("../../config/masterPermissions");
const Company = require("../../models/hr/Company");
const CustomError = require("../../utils/customErrorlogs");
const UserData = require("../../models/hr/UserData");
const { createLog } = require("../../utils/moduleLogs");

const getPermissions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const permissions = await Permissions.findOne({ user: userId })
      .lean()
      .exec();

    if (!permissions) {
      return res.status(200).json([]);
    }

    return res.status(200).json(permissions);
  } catch (error) {
    next(error);
  }
};

const updatePermissions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid array of permissions" });
    }

    const uniquePermissions = [...new Set(permissions)];

    let userPermissions = await Permissions.findOne({ user: userId });

    if (!userPermissions) {
      userPermissions = new Permissions({
        user: userId,
        permissions: uniquePermissions,
      });
    } else {
      userPermissions.permissions = uniquePermissions;
    }

    const savedPermissions = await userPermissions.save();

    await UserData.findByIdAndUpdate(userId, {
      permissions: savedPermissions._id,
    });

    return res.status(200).json({
      message: "Permissions updated successfully",
      data: savedPermissions,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = { getPermissions, updatePermissions };
