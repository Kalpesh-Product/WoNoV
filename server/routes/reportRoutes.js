const router = require("express").Router();

const {
  getSingleReport,
  addReport,
  getReports,
  seedReports,
} = require("../controllers/reportControllers/reportControllers");

router.post("/", addReport);
router.get("/", getReports);
router.get("/:reportId", getSingleReport);
router.post("/seed-reports", seedReports);

module.exports = router;
