const Asset = require("../../models/assets/Assets");
const User = require("../../models/hr/UserData");
const AssignAsset = require("../../models/assets/AssignAsset");
const { createLog } = require("../../utils/moduleLogs");
const CustomError = require("../../utils/customErrorlogs");
const Room = require("../../models/meetings/Rooms");

const getAssetRequests = async (req, res, next) => {
  try {
    // Get logged-in user
    const userId = req.user;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const companyId = user.company;

    // Fetch assigned assets for the user's company
    const assignedAssets = await AssignAsset.find({
      company: companyId,
      status: "Pending",
    })
      .populate("asset company")
      .populate("assignee.person")
      .populate("assignee.room") // Populate referenced fields
      .sort({ dateOfAssigning: -1 }); // Sort by latest assignments

    res.status(200).json(assignedAssets);
  } catch (error) {
    next(error);
  }
};

const assignAsset = async (req, res, next) => {
  const logPath = "assets/AssetLog";
  const logAction = "Assign Asset";
  const logSourceKey = "assignAsset";
  const { assetId, userId, departmentId, assignType, location, roomId } =
    req.body;
  const requester = req.user;
  const { ip } = req;

  try {
    if (!assetId || !userId || !departmentId || !assignType || !location) {
      throw new CustomError(
        "All fields are required.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      throw new CustomError(
        "Asset not found.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError(
        "User not found.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Create a new asset assignment request
    const assignEntry = new AssignAsset({
      asset: assetId,
      assignee: {
        room: roomId,
        person: userId,
      },
      company: user.company,
      location,
      status: "Pending",
      assignType,
      dateOfAssigning: new Date(),
      approvalStatus: "Pending",
    });

    await assignEntry.save();

    // Log successful asset assignment request creation
    await createLog({
      path: logPath,
      action: logAction,
      remarks:
        "Asset assignment request created successfully. Pending approval.",
      status: "Success",
      user: requester,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: assignEntry._id,
      changes: assignEntry.doc,
    });

    return res.status(200).json({
      message:
        "Asset assignment request created successfully. Pending approval.",
      assignEntry,
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

const processAssetRequest = async (req, res, next) => {
  const logPath = "assets/AssetLog";
  const logAction = "Process Asset Request";
  const logSourceKey = "assignAsset";
  const { user, ip, company } = req;

  try {
    const { requestId, action } = req.body;

    if (!requestId || !action) {
      throw new CustomError(
        "Request ID and action are required.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!["Approved", "Rejected"].includes(action)) {
      throw new CustomError(
        "Invalid action. Use 'Approved' or 'Rejected'.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const request = await AssignAsset.findById(requestId);
    if (!request) {
      throw new CustomError(
        "Assignment request not found.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const asset = await Asset.findById(request.asset);
    if (!asset) {
      throw new CustomError(
        "Asset not found.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (action === "Approved") {
      if (asset.assignedTo.room || asset.assignedTo.person) {
        throw new CustomError(
          "Asset is already assigned",
          logPath,
          logAction,
          logSourceKey
        );
      }
      request.status = "Approved";
      asset.assignedTo = request.assignee;

      await User.findByIdAndUpdate(
        request.assignee,
        { $addToSet: { assignedAsset: asset._id } },
        { new: true }
      );

      await asset.save();
    } else {
      request.status = "Rejected";
    }

    await request.save();

    // Log the successful processing of the asset request.
    await createLog({
      path: logPath,
      action: logAction,
      remarks: `Asset assignment request ${action.toLowerCase()} successfully.`,
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: request._id,
      changes: { action },
    });

    return res.status(200).json({
      message: `Asset assignment request ${action.toLowerCase()} successfully.`,
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

const revokeAsset = async (req, res, next) => {
  const logPath = "assets/AssetLog";
  const logAction = "Revoke Asset";
  const logSourceKey = "assignAsset";
  const { assetId } = req.body;
  const { user, ip, company } = req;

  let removedFrom = null;

  try {
    if (!assetId) {
      throw new CustomError(
        "Asset ID is required.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      throw new CustomError(
        "Asset not found.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!asset.assignedTo) {
      throw new CustomError(
        "Asset is not assigned to any person or room.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (asset.assignedTo.person) {
      const assignedUser = await User.findById(asset.assignedTo.person);
      if (!assignedUser) {
        throw new CustomError(
          "User not found.",
          logPath,
          logAction,
          logSourceKey
        );
      }
      // Remove the asset from the user's assignedAsset array
      await User.findByIdAndUpdate(assignedUser._id, {
        $pull: { assignedAsset: asset._id },
      });
      removedFrom = "person";
    }

    if (asset.assignedTo.room) {
      const assignedToRoom = await Room.findById(asset.assignedTo.room);
      if (!assignedToRoom) {
        throw new CustomError(
          "Room not found.",
          logPath,
          logAction,
          logSourceKey
        );
      }
      await Room.findOneAndUpdate(
        { _id: asset.assignedTo.room },
        {
          $pull: {
            assignedAssets: asset._id,
          },
        }
      );
      removedFrom = "room";
    }

    // Remove the assigned user from the asset's assignedTo field
    removedFrom === "person"
      ? (asset.assignedTo.person = null)
      : (asset.assignedTo.room = null);
    await asset.save();

    // Log the successful revocation
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Asset successfully revoked",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: asset._id,
      changes: { revokedFrom: assignedUser._id, assetId: asset._id },
    });

    return res.status(200).json({ message: "Asset successfully revoked" });
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

module.exports = {
  assignAsset,
  processAssetRequest,
  revokeAsset,
  getAssetRequests,
};
