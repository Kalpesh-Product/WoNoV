const {
  fetchEmployeePayslips,
} = require("../controllers/payslipControllers/payslipControllers");

const router = require("express").Router();

router.get("/get-payslips/:user", fetchEmployeePayslips);

module.exports = router;
