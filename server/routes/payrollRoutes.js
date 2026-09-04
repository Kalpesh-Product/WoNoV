const router = require("express").Router();
const upload = require("../config/multerConfig");
const {
  generatePayroll,
  fetchPayrolls,
  fetchUserPayroll,
  createPayrollDraft,
  fetchPayrollDrafts,
  fetchPayrollDraft,
} = require("../controllers/payrollControllers/payrollController");

router.post("/generate-payroll", upload.array("payslips", 4), generatePayroll);
router.get("/get-payrolls", fetchPayrolls);
router.get("/get-user-payrolls/:userId", fetchUserPayroll);
router.post("/drafts", createPayrollDraft);
router.get("/drafts", fetchPayrollDrafts);
router.get("/drafts/:draftId", fetchPayrollDraft);

module.exports = router;
