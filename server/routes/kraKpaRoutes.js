const router = require("express").Router();
const {
  listIndividualMonthlyKpa,
  getIndividualMonthlyKpaReviewAccess,
  getKraKpaDeleteAccess,
  createIndividualMonthlyKpa,
  updateIndividualMonthlyKpa,
  completeIndividualMonthlyKpa,
  deleteIndividualMonthlyKpa,
} = require("../controllers/performanceControllers/kraKpaIndividualMonthlyKpaController");
const {
  listSelfKra,
  listSelfKraLeadOptions,
  createSelfKra,
  updateSelfKra,
  completeSelfKra,
  deleteSelfKra,
} = require("../controllers/performanceControllers/kraKpaSelfKraController");
const {
  listDueTaskUsers,
  listDueTasks,
  createDueTask,
  updateDueTask,
  addDueTaskToDailyLogs,
  closeDueTask,
  deleteDueTask,
} = require("../controllers/performanceControllers/kraKpaDueTaskController");
const {
  listDailyLogs,
  createDailyLog,
  updateDailyLog,
  completeDailyLog,
  deleteDailyLog,
} = require("../controllers/performanceControllers/kraKpaDailyLogController");

router.get("/individual-monthly-kpa", listIndividualMonthlyKpa);
router.get("/individual-monthly-kpa/review-access", getIndividualMonthlyKpaReviewAccess);
router.get("/delete-access", getKraKpaDeleteAccess);
router.post("/individual-monthly-kpa", createIndividualMonthlyKpa);
router.patch("/individual-monthly-kpa/:id/complete", completeIndividualMonthlyKpa);
router.patch("/individual-monthly-kpa/:id", updateIndividualMonthlyKpa);
router.delete("/individual-monthly-kpa/:id", deleteIndividualMonthlyKpa);
router.get("/self-kra", listSelfKra);
router.get("/self-kra/lead-options", listSelfKraLeadOptions);
router.post("/self-kra", createSelfKra);
router.patch("/self-kra/:id/complete", completeSelfKra);
router.patch("/self-kra/:id", updateSelfKra);
router.delete("/self-kra/:id", deleteSelfKra);
router.get("/due-task/users", listDueTaskUsers);
router.get("/due-task", listDueTasks);
router.post("/due-task", createDueTask);
router.post("/due-task/:id/daily-log", addDueTaskToDailyLogs);
router.patch("/due-task/:id/close", closeDueTask);
router.patch("/due-task/:id", updateDueTask);
router.delete("/due-task/:id", deleteDueTask);
router.get("/daily-log", listDailyLogs);
router.post("/daily-log", createDailyLog);
router.patch("/daily-log/:id/complete", completeDailyLog);
router.patch("/daily-log/:id", updateDailyLog);
router.delete("/daily-log/:id", deleteDailyLog);

module.exports = router;
