const router = require("express").Router();
const upload = require("../config/multerConfig");

const {
  createDeptBasedTask,
  updateTaskStatus,
  updateKraKpaTask,
  deleteTaskRecurrence,
  getAllKpaTasks,
  getKraKpaTasks,
  getAllDeptTasks,
  getMyKraKpaTasks,
  getCompletedKraKpaTasks,
  bulkInsertKraKpaTasks,
} = require("../controllers/performanceControllers/kraKpaControllers");

router.post("/create-task", createDeptBasedTask);
router.patch("/update-status/:taskId/:taskType", updateTaskStatus);
router.patch("/update-task/:taskId", updateKraKpaTask);
router.patch("/delete-recurrence/:taskId", deleteTaskRecurrence);
router.post(
  "/bulk-upload-performance-tasks",
  upload.single("performance"),
  bulkInsertKraKpaTasks,
);
router.post(
  "/bulk-insert-performance-tasks/:departmentId",
  upload.single("performance-tasks"),
  bulkInsertKraKpaTasks,
);
router.get("/get-kpa-tasks", getAllKpaTasks);
router.get("/get-my-tasks", getMyKraKpaTasks);
router.get("/get-tasks/", getKraKpaTasks);
router.get("/get-completed-tasks/", getCompletedKraKpaTasks);
router.get("/get-depts-tasks/", getAllDeptTasks);

module.exports = router;
