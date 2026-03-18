const {
  getNotifications,
  markSingleNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationControllers/notificationController");

const router = require("express").Router();
router.get("/get-my-notifications", getNotifications);
router.patch("/mark-as-read/:notificationId", markSingleNotificationAsRead);
router.patch("/mark-all-read", markAllNotificationsAsRead);
module.exports = router;
