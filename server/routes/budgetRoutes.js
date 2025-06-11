const router = require("express").Router();
const upload = require("../config/multerConfig");

const {
  requestBudget,
  fetchBudget,
  bulkInsertBudgets,
  approveBudget,
  rejectBudget,
  fetchLandlordPayments,
  uploadInvoice,
  fetchPendingApprovals,
  approveFinanceBudget,
} = require("../controllers/budgetControllers/budgetController");

router.post("/request-budget/:departmentId", requestBudget);
router.get("/pending-approvals", fetchPendingApprovals);
// router.patch("/approve-budget/:budgetId", approveBudget);
router.patch("/approve-budget", approveFinanceBudget);
router.patch("/reject-budget/:budgetId", rejectBudget);
router.patch(
  "/upload-budget-invoice/:budgetId",
  upload.single("invoice"),
  uploadInvoice
);
router.get("/company-budget", fetchBudget);
router.get("/landlord-payments", fetchLandlordPayments);
router.post(
  "/bulk-insert-budget/:departmentId",
  upload.single("budgets"),
  bulkInsertBudgets
);

module.exports = router;
