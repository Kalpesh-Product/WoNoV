const router = require("express").Router();

const {
  assignWeeklyUnit,
  updateWeeklyUnit,
  fetchWeeklyUnits,
  addSubstitute,
} = require("../controllers/adminControllers/WeeklyScheduleControllers");

router.post("/assign-weekly-unit", assignWeeklyUnit);
router.post("/update-weekly-unit", updateWeeklyUnit);
router.patch("/add-substitute", addSubstitute);
router.get("/fetch-weekly-unit/:department", fetchWeeklyUnits);

module.exports = router;
