const router = require("express").Router();

const {
  assignWeeklyUnit,
  updateWeeklyUnit,
  fetchWeeklyUnits,
} = require("../controllers/adminControllers/WeeklyScheduleControllers");

router.post("/assign-weekly-unit", assignWeeklyUnit);
router.patch("/update-weekly-unit", updateWeeklyUnit);
router.get("/fetch-weekly-unit", fetchWeeklyUnits);

module.exports = router;
