const getIncomeAndExpanse = require("../controllers/financeControllers/financeControllers");
const router = require("express").Router();

router.get("/income-expense", getIncomeAndExpanse);
module.exports = router;
