const {
  getNotifications,
  markSingleNotificationAsRead,
} = require("../controllers/notificationControllers/notificationController");

const router = require("express").Router();
router.get("/get-my-notifications", getNotifications);
router.patch("/mark-as-read/:notificationId", markSingleNotificationAsRead);
module.exports = router;
