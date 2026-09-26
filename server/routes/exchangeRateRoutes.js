const router = require("express").Router();
const {
  getLatestExchangeRates,
} = require("../controllers/exchangeRateController");

router.get("/", getLatestExchangeRates);

module.exports = router;
