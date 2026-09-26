const { getExchangeRates } = require("../services/exchangeRateService");

const getLatestExchangeRates = async (req, res, next) => {
  try {
    const result = await getExchangeRates(req.query.base || "INR");
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getLatestExchangeRates };
