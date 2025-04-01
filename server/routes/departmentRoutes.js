const router = require("express").Router();
const {
  createDepartment,
  assignAdmin,
  getDepartments,
} = require("../controllers/departmentControllers/departmentControllers");

router.post("/add-department", createDepartment);
// router.patch("/assign-admin", assignAdmin);
// router.get("/get-departments", getDepartments);
module.exports = router;
