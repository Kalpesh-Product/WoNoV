const router = require("express").Router();
const upload = require("../config/multerConfig");
const {
  generatePayroll,
} = require("../controllers/payrollControllers/payrollController");

router.post("/generate-payroll", upload.array("payslips", 4), generatePayroll);

module.exports = router;
