const router = require("express").Router();
const {
  generatePayroll,
} = require("../controllers/payrollControllers/payrollController");

router.post("/generate-payroll", generatePayroll);

module.exports = router;
