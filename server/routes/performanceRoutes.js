const router = require("express").Router();

const {
  createDeptBasedTask,
  updateTaskStatus,
  getAllKpaTasks,
  getMyKraKpaTasks,
} = require("../controllers/performanceControllers/kraKpaControllers");

router.post("/create-task", createDeptBasedTask); //Query needed
// router.post("/create-individual-task", createIndividualTask);
router.patch("/update-task-status/:taskId", updateTaskStatus);
router.get("/get-kpa-tasks", getAllKpaTasks);
router.get("/get-tasks/", getMyKraKpaTasks);

module.exports = router;
