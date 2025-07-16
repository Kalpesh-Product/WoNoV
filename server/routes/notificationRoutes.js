const {
  getNotifications,
} = require("../controllers/notificationControllers/notificationController");

const router = require("express").Router();
router.get("/get-my-notifications", getNotifications);
module.exports = router;
