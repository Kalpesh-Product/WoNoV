const router = require("express").Router();
const {
  getPermissions,
  updatePermissions,
  getDepartmentWiseUsers,
} = require("../controllers/accessController/accessController");

router.get("/user-permissions/:userId", getPermissions);
router.post("/modify-permissions/:userId", updatePermissions);
router.get("/department-wise-employees", getDepartmentWiseUsers);

module.exports = router;
