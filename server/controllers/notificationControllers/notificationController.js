const { default: mongoose } = require("mongoose");
const Notification = require("../../models/Notification");

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user;

    const notifications = await Notification.find({
      $or: [
        { initiatorData: userId },
        { "users.userActions.whichUser": userId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate([
        {
          path: "initiatorData",
          select: "firstName lastName profilePicture",
        },
        {
          path: "users.userActions.whichUser",
          select: "firstName lastName profilePicture",
        },
      ])
      .lean()
      .exec();

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

const markSingleNotificationAsRead = async (req, res, next) => {
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

    let updated = false;

    // User is the initiator
    if (
      notification.initiatorData &&
      notification.initiatorData.toString() === userId
    ) {
      // Do nothing or optionally add logic if initiators should also track read
    }

    // Update matching user's hasRead to true
    notification.users = notification.users.map((userObj) => {
      if (
        userObj.userActions &&
        userObj.userActions.whichUser.toString() === userId &&
        !userObj.userActions.hasRead
      ) {
        userObj.userActions.hasRead = true;
        updated = true;
      }
      return userObj;
    });

    if (updated) {
      await notification.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read for this user.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markSingleNotificationAsRead };
