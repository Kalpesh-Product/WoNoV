const router = require("express").Router();

const {
  assignWeeklyUnit,
  updateWeeklyUnit,
  fetchWeeklyUnits,
  addSubstitute,
} = require("../controllers/weeklyScheduleControllers/WeeklyScheduleController");
const {
  createAdminEvent,
  getAdminEvents,
  updateAdminEvent,
} = require("../controllers/adminControllers/adminEventsControllers");

router.post("/assign-weekly-unit", assignWeeklyUnit);
router.patch("/update-weekly-unit", updateWeeklyUnit);
router.patch("/add-substitute", addSubstitute);
router.get("/fetch-weekly-unit/:department", fetchWeeklyUnits);
router.get("/events/:id", getAdminEvents);
router.post("/create-admin-event", createAdminEvent);
router.patch("/update-admin-event", updateAdminEvent);

module.exports = router;
