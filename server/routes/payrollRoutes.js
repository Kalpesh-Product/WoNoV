const router = require("express").Router();
const upload = require("../config/multerConfig");
const {
  generatePayroll,
  fetchPayrolls,
} = require("../controllers/payrollControllers/payrollController");

router.post("/generate-payroll", upload.array("payslips", 4), generatePayroll);
router.get("/get-payrolls", fetchPayrolls);

module.exports = router;
