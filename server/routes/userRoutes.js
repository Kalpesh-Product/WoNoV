const router = require("express").Router();
const {
  createUser,
  fetchUser,
  fetchSingleUser,
  updateProfile,
  bulkInsertUsers,
  getAssignees,
  checkPassword,
  updatePassword,
  getEmployeePoliciesByEmpId
} = require("../controllers/userControllers/userControllers");
const upload = require("../config/multerConfig");
const {
  addEmployeeLeaves,
} = require("../controllers/userControllers/leaveSettings/leaveSettingsController");

router.post("/create-user", createUser);
router.patch("/employee-leaves", addEmployeeLeaves);
router.get("/fetch-users", fetchUser);
router.get("/assignees", getAssignees);
router.get("/fetch-single-user/:empid", fetchSingleUser);
router.post("/check-password", checkPassword);
router.post("/update-password", updatePassword);
router.patch("/update-single-user",upload.single("profilePic"), updateProfile);
router.post("/bulk-insert-users", upload.single("users"), bulkInsertUsers);
router.get("/policies/:employeeId", getEmployeePoliciesByEmpId);

module.exports = router;
