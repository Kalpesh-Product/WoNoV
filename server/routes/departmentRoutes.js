const router = require("express").Router();

const {
  getDepartments,
  assignAdmin,
  createDepartment,
} = require("../controllers/companyControllers/departmentControllers");

router.post("/add-department", createDepartment);
router.patch("/assign-admin", assignAdmin);
router.get("/get-departments", getDepartments);
module.exports = router;
