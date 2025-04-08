const router = require("express").Router();

const {
  assignWeeklyUnit,
  updateWeeklyUnit,
  fetchWeeklyUnits,
} = require("../controllers/adminControllers/WeeklyScheduleControllers");
const {
  createAdminEvent,
  getAdminEvents,
  updateAdminEvent,
} = require("../controllers/adminControllers/adminEventsControllers");

router.post("/assign-weekly-unit", assignWeeklyUnit);
router.patch("/update-weekly-unit", updateWeeklyUnit);
router.get("/fetch-weekly-unit", fetchWeeklyUnits);
router.get("/events/:id", getAdminEvents);
router.post("/create-admin-event", createAdminEvent);
router.patch("/update-admin-event", updateAdminEvent);

module.exports = router;
