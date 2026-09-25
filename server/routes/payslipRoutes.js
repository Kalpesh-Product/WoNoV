const {
  downloadPayslip,
  fetchCompanyPayslips,
  fetchEmployeePayslips,
} = require("../controllers/payslipControllers/payslipControllers");

const router = require("express").Router();

router.get("/download-payslip/:payslipId", downloadPayslip);
router.get("/get-payslips", fetchCompanyPayslips);
router.get("/get-payslips/:user", fetchEmployeePayslips);

module.exports = router;
