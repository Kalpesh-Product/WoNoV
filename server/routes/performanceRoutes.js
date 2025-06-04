const router = require("express").Router();

const {
  createDeptBasedTask,
  updateTaskStatus,
  getAllKpaTasks,
  getKraKpaTasks,
  getAllDeptTasks,
  getMyKraKpaTasks,
  getCompletedKraKpaTasks,
} = require("../controllers/performanceControllers/kraKpaControllers");

router.post("/create-task", createDeptBasedTask);
router.patch("/update-status/:taskId/:taskType", updateTaskStatus);
router.get("/get-kpa-tasks", getAllKpaTasks);
router.get("/get-my-tasks", getMyKraKpaTasks);
router.get("/get-tasks/", getKraKpaTasks);
router.get("/get-completed-tasks/", getCompletedKraKpaTasks);
router.get("/get-depts-tasks/", getAllDeptTasks);

module.exports = router;
