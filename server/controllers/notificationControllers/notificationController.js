const { default: mongoose } = require("mongoose");
const Notification = require("../../models/Notification");

const getNotifications = async (req, res, next) => {
  try {
    const user = req.user;

    const notifications = await Notification.find({
      $or: [
        { "initiatorData.initiator": user._id },
        { "users.userActions.whichUser": user._id },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("initiatorData.initiator")
      .lean()
      .exec();

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

const markSingleNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user;

  if (
    !mongoose.Types.ObjectId.isValid(notificationId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid IDs provided." });
  }

  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found." });
    }

    // Check and update if user is the initiator
    if (
      notification.initiatorData &&
      notification.initiatorData.initiator.toString() === userId &&
      !notification.initiatorData.hasRead
    ) {
      notification.initiatorData.hasRead = true;
    }

    // Check and update in users array
    notification.users = notification.users.map((userObj) => {
      if (userObj.userActions.whichUser.toString() === userId) {
        userObj.userActions.hasRead = true;
      }
      return userObj;
    });

    await notification.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Notification marked as read for this user.",
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification.",
    });
  }
};

module.exports = { getNotifications, markSingleNotificationAsRead };
