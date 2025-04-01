const router = require("express").Router();
const {
  login,
  logOut,
  checkPassword,
  updatePassword,
} = require("../../controllers/authControllers/userAuthController");
const refreshTokenController = require("../../controllers/authControllers/refreshTokenController");

router.post("/login", login);
router.get("/logout", logOut);
router.get("/refresh", refreshTokenController);
router.post("/check-password", checkPassword);
router.post("/update-password", updatePassword);

module.exports = router;
