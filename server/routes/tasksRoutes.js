const router = require("express").Router();

const {
  createTasks,
  getMyTasks,
  updateTask,
  deleteTask,
  todayTasks,
  getMyTodayTasks,
  getTeamMembersTasks,
  getAssignedTasks,
  getAllTasks,
  completeTasks,
  getTasks,
  getAllDeptTasks,
  updateTaskStatus,
  getCompletedTasks,
  getMyCompletedTasks,
} = require("../controllers/tasksControllers/tasksControllers");

router.post("/create-tasks", createTasks);
router.get("/my-tasks", getMyTasks);
router.get("/get-all-tasks", getAllTasks);
router.get("/get-tasks", getTasks);
router.get("/get-depts-tasks", getAllDeptTasks);
router.get("/get-team-tasks", getTeamMembersTasks);
router.patch("/update-task-status/:id", updateTaskStatus);
router.get("/get-today-tasks", getMyTodayTasks);
router.get("/get-assigned-tasks", getAssignedTasks);
router.patch("/update-task/:id", updateTask);
router.patch("/complete-tasks/", completeTasks);
router.get("/get-completed-tasks/:deptId", getCompletedTasks);
router.get("/get-my-completed-tasks", getMyCompletedTasks);
router.patch("/delete-task/:id", deleteTask);

module.exports = router;
