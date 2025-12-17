const router = require("express").Router();
const upload = require("../config/multerConfig");

const {
  assignWeeklyUnit,
  updateWeeklyUnit,
  fetchWeeklyUnits,
  addSubstitute,
  bulkInsertWeeklyShiftSchedule,
} = require("../controllers/weeklyScheduleControllers/WeeklyScheduleController");
const {
  createAdminEvent,
  getAdminEvents,
  updateAdminEvent,
  bulkInsertClientEvents,
} = require("../controllers/adminControllers/adminEventsControllers");

router.post("/assign-weekly-unit", assignWeeklyUnit);
router.patch("/update-weekly-unit", updateWeeklyUnit);
router.patch("/add-substitute", addSubstitute);
router.post(
  "/bulk-insert-weekly-shift-schedule/:departmentId",
  upload.single("schedule"),
  bulkInsertWeeklyShiftSchedule
);
router.get("/fetch-weekly-unit/:department", fetchWeeklyUnits);
router.get("/events/:id", getAdminEvents);
router.post("/create-admin-event", createAdminEvent);
router.patch("/update-admin-event", updateAdminEvent);
router.post(
  "/bulk-insert-client-events",
  upload.single("client-events"),
  bulkInsertClientEvents
);

module.exports = router;
