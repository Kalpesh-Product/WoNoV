const router = require("express").Router();

const {
  assignWeeklyUnit,
  updateWeeklyUnit,
  fetchWeeklyUnits,
  addSubstitute,
  fetchPrimaryUnits,
} = require("../controllers/weeklyScheduleControllers/WeeklyScheduleController");

router.post("/assign-weekly-unit", assignWeeklyUnit);
router.patch("/update-weekly-unit", updateWeeklyUnit);
router.patch("/add-substitute", addSubstitute);
router.get("/fetch-weekly-unit/:department", fetchWeeklyUnits);
router.get("/get-primary-units", fetchPrimaryUnits);

module.exports = router;
