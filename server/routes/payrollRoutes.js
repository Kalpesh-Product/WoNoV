const router = require("express").Router();
const upload = require("../config/multerConfig");
const {
  generatePayroll,
  fetchPayrolls,
  fetchUserPayroll,
  createPayrollDraft,
  fetchPayrollDrafts,
  fetchPayrollDraft,
  fetchPayrollDraftExport,
  updatePayrollDraftEmployee,
  excludePayrollDraftEmployees,
  undoPayrollDraftChange,
  undoPayrollDraftEmployeeChange,
  submitPayrollDraft,
  voidPayrollDraft,
} = require("../controllers/payrollControllers/payrollController");

router.post("/generate-payroll", upload.array("payslips", 4), generatePayroll);
router.get("/get-payrolls", fetchPayrolls);
router.get("/get-user-payrolls/:userId", fetchUserPayroll);
router.post("/drafts", createPayrollDraft);
router.get("/drafts", fetchPayrollDrafts);
router.get("/drafts/:draftId", fetchPayrollDraft);
router.get("/drafts/:draftId/export", fetchPayrollDraftExport);
router.patch("/drafts/:draftId/employees/:employeeId", updatePayrollDraftEmployee);
router.post(
  "/drafts/:draftId/employees/:employeeId/undo",
  undoPayrollDraftEmployeeChange
);
router.patch("/drafts/:draftId/employees", excludePayrollDraftEmployees);
router.post("/drafts/:draftId/undo", undoPayrollDraftChange);
router.post("/drafts/:draftId/submit", submitPayrollDraft);
router.delete("/drafts/:draftId", voidPayrollDraft);

module.exports = router;
