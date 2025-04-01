const router = require("express").Router();
const {
  userPermissions,
  modifyUserPermissions,
} = require("../controllers/accessController/accessController");

router.get("/user-permissions/:id", userPermissions);
router.post("/modify-permissions", modifyUserPermissions);

module.exports = router;
