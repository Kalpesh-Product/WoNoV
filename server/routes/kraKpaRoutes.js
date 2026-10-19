const router = require("express").Router();
const {
  listIndividualMonthlyKpa,
  listPendingKpaApprovals,
  getIndividualMonthlyKpaReviewAccess,
  getKraKpaDeleteAccess,
  createIndividualMonthlyKpa,
  approveIndividualMonthlyKpa,
  rejectIndividualMonthlyKpa,
  updateIndividualMonthlyKpa,
  completeIndividualMonthlyKpa,
  deleteIndividualMonthlyKpa,
} = require("../controllers/performanceControllers/kraKpaIndividualMonthlyKpaController");
const {
  listSelfKra,
  listSelfKraLeadOptions,
  createSelfKra,
  addSelfKrasToDailyLogs,
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
  addDueTasksToDailyLogs,
  closeDueTask,
  deleteDueTask,
} = require("../controllers/performanceControllers/kraKpaDueTaskController");
const {
  listDailyLogOptions,
  listDailyLogs,
  createDailyLog,
  updateDailyLog,
  completeDailyLog,
  deleteDailyLog,
} = require("../controllers/performanceControllers/kraKpaDailyLogController");
const {
  listKraCategories,
  createKraCategory,
} = require("../controllers/performanceControllers/kraCategoryController");

router.get("/individual-monthly-kpa", listIndividualMonthlyKpa);
router.get("/individual-monthly-kpa/pending-approvals", listPendingKpaApprovals);
router.get("/individual-monthly-kpa/review-access", getIndividualMonthlyKpaReviewAccess);
router.get("/delete-access", getKraKpaDeleteAccess);
router.post("/individual-monthly-kpa", createIndividualMonthlyKpa);
router.patch("/individual-monthly-kpa/:id/approve", approveIndividualMonthlyKpa);
router.patch("/individual-monthly-kpa/:id/reject", rejectIndividualMonthlyKpa);
router.patch("/individual-monthly-kpa/:id/complete", completeIndividualMonthlyKpa);
router.patch("/individual-monthly-kpa/:id", updateIndividualMonthlyKpa);
router.delete("/individual-monthly-kpa/:id", deleteIndividualMonthlyKpa);
router.get("/self-kra", listSelfKra);
router.get("/self-kra/lead-options", listSelfKraLeadOptions);
router.post("/self-kra/daily-log", addSelfKrasToDailyLogs);
router.post("/self-kra", createSelfKra);
router.patch("/self-kra/:id/complete", completeSelfKra);
router.patch("/self-kra/:id", updateSelfKra);
router.delete("/self-kra/:id", deleteSelfKra);
router.get("/self-kra-categories", listKraCategories);
router.post("/self-kra-categories", createKraCategory);
router.get("/due-task/users", listDueTaskUsers);
router.get("/due-task", listDueTasks);
router.post("/due-task", createDueTask);
router.post("/due-task/daily-log", addDueTasksToDailyLogs);
router.post("/due-task/:id/daily-log", addDueTaskToDailyLogs);
router.patch("/due-task/:id/close", closeDueTask);
router.patch("/due-task/:id", updateDueTask);
router.delete("/due-task/:id", deleteDueTask);
router.get("/daily-log/options", listDailyLogOptions);
router.get("/daily-log", listDailyLogs);
router.post("/daily-log", createDailyLog);
router.patch("/daily-log/:id/complete", completeDailyLog);
router.patch("/daily-log/:id", updateDailyLog);
router.delete("/daily-log/:id", deleteDailyLog);

module.exports = router;
