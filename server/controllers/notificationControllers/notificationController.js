const Notification = require("../../models/Notification");

const getNotifications = async (req, res, next) => {
  try {
    const user = req.user;
    const notifications = await Notification.find({ user: user._id })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications };
