const router = require("express").Router();
const {
  saveWebsite,
} = require("../controllers/techControllers/techController");

router.post("/create-website", saveWebsite);

module.exports = router;
