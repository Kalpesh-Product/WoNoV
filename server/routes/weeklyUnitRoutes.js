const router = require("express").Router();

const {
  assignWeeklyUnit,
  updateWeeklyUnit,
  fetchWeeklyUnits,
  addSubstitute,
  fetchPrimaryUnits,
  fetchTeamMembersSchedule,
} = require("../controllers/weeklyScheduleControllers/WeeklyScheduleController");

router.post("/assign-weekly-unit", assignWeeklyUnit);
router.patch("/update-weekly-unit", updateWeeklyUnit);
router.patch("/add-substitute", addSubstitute);
router.get("/fetch-weekly-unit/:department", fetchWeeklyUnits);
router.get("/get-primary-units", fetchPrimaryUnits);
router.get("/get-unit-schedule", fetchTeamMembersSchedule);

module.exports = router;
