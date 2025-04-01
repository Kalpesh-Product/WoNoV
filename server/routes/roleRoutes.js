const router = require("express").Router();
const {
  addRole,
  getRoles,
} = require("../controllers/rolesControllers/roleControllers");

router.post("/add-role", addRole);
router.get("/get-roles", getRoles);

module.exports = router;
