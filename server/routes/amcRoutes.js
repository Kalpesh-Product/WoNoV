const router = require("express").Router();
const {
  bulkInsertAmcReports,
} = require("../controllers/amcControllers/amcControllers");
const upload = require("../config/multerConfig");

router.post(
  "/bulk-insert-amc-records/:departmentId",
  upload.single("amc-records"),
  bulkInsertAmcReports
);

module.exports = router;
