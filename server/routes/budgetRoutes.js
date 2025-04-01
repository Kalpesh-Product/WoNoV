const router = require("express").Router();
const upload = require("../config/multerConfig");

const {
  requestBudget,
  fetchBudget,
  bulkInsertBudgets,
} = require("../controllers/budgetControllers/budgetController");

router.post("/request-budget/:departmentId", requestBudget);
router.get("/company-budget", fetchBudget);
router.post("/bulk-insert-budget", upload.single("budgets"), bulkInsertBudgets);

module.exports = router;
