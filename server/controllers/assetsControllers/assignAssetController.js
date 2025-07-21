const Asset = require("../../models/assets/Assets");
const User = require("../../models/hr/UserData");
const AssignAsset = require("../../models/assets/AssignAsset");
const { createLog } = require("../../utils/moduleLogs");
const CustomError = require("../../utils/customErrorlogs");

const getAssetRequests = async (req, res, next) => {
  try {
    const { user, company } = req;

    // Fetch assigned assets for the user's company
    const assignedAssets = await AssignAsset.find({
      company,
      status: "Pending",
    })
      .populate([
        {
          path: "asset",
          populate: { path: "subCategory", populate: "category" },
        },
        { path: "department", select: "name" },
        {
          path: "location",
          select: "unitName unitNo",
          populate: { path: "building" },
        },
        { path: "assignee", select: "firstName lastName empId" },
      ])
      .sort({ dateOfAssigning: -1 }); // Sort by latest assignments

    res.status(200).json(assignedAssets);
  } catch (error) {
    next(error);
  }
};

const requestAsset = async (req, res, next) => {
  const logPath = "assets/AssetLog";
  const logAction = "Assign Asset";
  const logSourceKey = "assignAsset";
  const { assetId, departmentId, location } = req.body;
  const { ip, user, company } = req;

  try {
    if (!assetId || !user || !departmentId || !location) {
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

    // Create a new asset assignment request
    const assignEntry = new AssignAsset({
      asset: assetId,
      department: departmentId,
      assignee: user,
      company: company,
      location,
      status: "Pending",
    });

    await assignEntry.save();

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
    const { requestedAssetId, action } = req.body;

    if (!requestedAssetId || !action) {
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

    const request = await AssignAsset.findById(requestedAssetId);
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
      if (asset.status === "Inactive") {
        throw new CustomError(
          "Asset is currently inactive",
          logPath,
          logAction,
          logSourceKey
        );
      }
      if (asset.isUnderMaintenance) {
        throw new CustomError(
          "Asset is currently under maintenance",
          logPath,
          logAction,
          logSourceKey
        );
      }
      if (asset.isDamaged) {
        throw new CustomError(
          "Asset is currently damaged",
          logPath,
          logAction,
          logSourceKey
        );
      }
      request.status = "Approved";
      asset.isAssigned = true;
      asset.assignedAsset = approvedaAsset._id;

      await asset.save();
    } else {
      request.status = "Rejected";
    }

    const approvedaAsset = await request.save();

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
  const { assigneddAssetId } = req.params;
  const { user, ip, company } = req;

  let removedFrom = null;

  try {
    if (!assigneddAssetId) {
      throw new CustomError(
        "Assigned asset ID is required.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const assignedAsset = await AssignAsset.findById(assigneddAssetId);
    if (!assignedAsset) {
      throw new CustomError(
        "Assigned asset not found.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (assignedAsset.status !== "Approved") {
      throw new CustomError(
        "Asset is not assigned to any person.",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (assignedAsset.assignee) {
      const assignedUser = await User.findById({ _id: assignedAsset.assignee });
      if (!assignedUser) {
        throw new CustomError(
          "User not found.",
          logPath,
          logAction,
          logSourceKey
        );
      }
      // Remove the asset from the user's assignedAsset array
      // await User.findByIdAndUpdate(assignedUser._id, {
      //   $pull: { assignedAsset: assignedAsset._id },
      // });
      // removedFrom = "person";
    }

    // Remove the assigned user from the asset's assignedTo field

    assignedAsset.isRevoked = true;
    const revokedAsset = await assignedAsset.save();

    if (!revokedAsset) {
      return res.status(400).json({ message: "Failed to revoke asset" });
    }

    const asset = await Asset.findOne({ assignedAsset: assigneddAssetId });

    if (asset && asset.isAssigned) {
      asset.isAssigned = false;
      asset.assignedAsset = null;
      const updatedAsset = await asset.save();

      if (!updatedAsset) {
        return res
          .status(400)
          .json({ message: "Failed to update asset status" });
      }
    }

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
  requestAsset,
  processAssetRequest,
  revokeAsset,
  getAssetRequests,
};
