const router = require("express").Router();
const {
  getPermissions,
  updatePermissions
} = require("../controllers/accessController/accessController");

router.get("/user-permissions/:id", getPermissions);
router.post("/modify-permissions", updatePermissions);

module.exports = router;
