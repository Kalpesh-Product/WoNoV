const router = require("express").Router();
const upload = require("../config/multerConfig");
const {
  generatePayroll,
  fetchPayrolls,
  fetchUserPayroll,
} = require("../controllers/payrollControllers/payrollController");

router.post("/generate-payroll", upload.array("payslips", 4), generatePayroll);
router.get("/get-payrolls", fetchPayrolls);
router.get("/get-user-payrolls/:userId", fetchUserPayroll);

module.exports = router;