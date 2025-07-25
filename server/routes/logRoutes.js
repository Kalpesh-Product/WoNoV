const getLogs = require("../controllers/logController");

const router = require("express").Router();

router.get("/get-logs", getLogs);

module.exports = router;
