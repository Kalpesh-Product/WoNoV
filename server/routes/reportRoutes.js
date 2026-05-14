const router = require("express").Router();

const {
  getSingleReport,
  addReport,
  getReports,
  seedReports,
} = require("../controllers/reportControllers/reportControllers");
const {
  generateReport,
  getReportStatus,
  cancelReport,
} = require("../controllers/reportControllers/reportJobControllers");

//report routes
router.post("/", addReport);
router.get("/", getReports);
router.post("/seed-reports", seedReports);

//report job routes
router.post("/generate", generateReport);
router.patch("/cancel/:jobId", cancelReport);
router.get("/status/:jobId", getReportStatus);
router.get("/:reportId", getSingleReport);

module.exports = router;
