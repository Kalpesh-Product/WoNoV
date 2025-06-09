const router = require("express").Router();
const upload = require("../config/multerConfig");

const {
  requestBudget,
  fetchBudget,
  bulkInsertBudgets,
  approveBudget,
  rejectBudget,
  fetchLandlordPayments,
} = require("../controllers/budgetControllers/budgetController");

router.post("/request-budget/:departmentId", requestBudget);
router.patch("/approve-budget/:budgetId", approveBudget);
router.patch("/reject-budget/:budgetId", rejectBudget);
router.get("/company-budget", fetchBudget);
router.get("/landlord-payments", fetchLandlordPayments);
router.post(
  "/bulk-insert-budget/:departmentId",
  upload.single("budgets"),
  bulkInsertBudgets
);

module.exports = router;
