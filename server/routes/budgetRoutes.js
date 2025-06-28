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
  fetchApprovedbudgets,
  updateBudget,
} = require("../controllers/budgetControllers/budgetController");

router.post(
  "/request-budget/:departmentId",
  upload.fields([
    { name: "invoice", maxCount: 1 },
    { name: "voucher", maxCount: 1 },
  ]),
  requestBudget
);
router.get("/pending-approvals", fetchPendingApprovals);
router.get("/approved-budgets", fetchApprovedbudgets);
// router.patch("/approve-budget/:budgetId", approveBudget);
router.patch("/approve-budget", upload.single("voucher"), approveFinanceBudget);
router.patch("/reject-budget/:budgetId", rejectBudget);
router.patch("/update-budget/:budgetId", updateBudget);
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
