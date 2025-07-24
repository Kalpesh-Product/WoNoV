const router = require("express").Router();
const {
  getPermissions,
  updatePermissions
} = require("../controllers/accessController/accessController");

router.get("/user-permissions/:userId", getPermissions);
router.post("/modify-permissions/:userId", updatePermissions);

module.exports = router;
