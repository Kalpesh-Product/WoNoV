const router = require("express").Router();

const {
  createDeptBasedTask,
  updateTaskStatus,
  getAllKpaTasks,
  getKraKpaTasks,
  getAllDeptTasks,
} = require("../controllers/performanceControllers/kraKpaControllers");

router.post("/create-task", createDeptBasedTask);
// router.post("/create-individual-task", createIndividualTask);
router.patch("/update-task-status/:taskId", updateTaskStatus);
router.get("/get-kpa-tasks", getAllKpaTasks);
router.get("/get-tasks/", getKraKpaTasks);
router.get("/get-depts-tasks/", getAllDeptTasks);

module.exports = router;
