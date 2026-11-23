const { default: mongoose } = require("mongoose");
const Notification = require("../../models/Notification");

const DEFAULT_NOTIFICATION_LIMIT = 100;
const MAX_NOTIFICATION_LIMIT = 200;

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user;
    const requestedLimit = Number.parseInt(req.query?.limit, 10);
    const limit =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, MAX_NOTIFICATION_LIMIT)
        : DEFAULT_NOTIFICATION_LIMIT;

    // Only the newest notifications are sent, and only the current user's own
    // read/unread entry is kept from the recipients list. This endpoint is
    // polled by every open tab, so the response has to stay small.
    const notifications = await Notification.find({
      $or: [
        { initiatorData: userId },
        { "users.userActions.whichUser": userId },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({
        path: "initiatorData",
        select: "firstName lastName",
      })
      .lean()
      .exec();

    const currentUserId = String(userId);
    const trimmed = notifications.map((notification) => ({
      ...notification,
      users: (notification.users || []).filter(
        (entry) => String(entry?.userActions?.whichUser) === currentUserId,
      ),
    }));

    res.json(trimmed);
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


const markAllNotificationsAsRead = async (req, res, next) => {
  const userId = req.user;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid User ID." });
  }

  try {
    const result = await Notification.updateMany(
      {
        users: {
          $elemMatch: {
            "userActions.whichUser": new mongoose.Types.ObjectId(userId),
            "userActions.hasRead": { $ne: true },
          },
        },
      },
      {
        $set: {
          "users.$[userEntry].userActions.hasRead": true,
        },
      },
      {
        arrayFilters: [
          {
            "userEntry.userActions.whichUser": new mongoose.Types.ObjectId(userId),
            "userEntry.userActions.hasRead": { $ne: true },
          },
        ],
      },
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markSingleNotificationAsRead, markAllNotificationsAsRead, };
