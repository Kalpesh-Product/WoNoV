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

    let userPermissions = await Permissions.findOne({ user: userId })
      .lean()
      .exec();

    if (!userPermissions) {
      userPermissions = new Permissions({
        user: userId,
        permissions,
      });
    } else {
      userPermissions.permissions = permissions;
    }

    await userPermissions.save();

    return res.status(200).json({
      message: "Permissions granted successfully",
      data: userPermissions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPermissions, updatePermissions };
