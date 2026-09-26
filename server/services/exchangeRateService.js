const axios = require("axios");

const SUPPORTED_CURRENCIES = ["INR", "USD", "AED"];
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const FRANKFURTER_RATES_URL = "https://api.frankfurter.dev/v2/rates";

const rateCache = new Map();
const pendingRequests = new Map();

const normalizeCurrency = (value) => String(value || "").trim().toUpperCase();

const assertSupportedCurrency = (currency) => {
  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    const error = new Error(
      `Unsupported base currency. Use one of: ${SUPPORTED_CURRENCIES.join(", ")}`,
    );
    error.statusCode = 400;
    throw error;
  }
};

const fetchLatestRates = async (base) => {
  const quotes = SUPPORTED_CURRENCIES.filter((currency) => currency !== base);
  const response = await axios.get(FRANKFURTER_RATES_URL, {
    params: {
      base: base.toLowerCase(),
      quotes: quotes.map((currency) => currency.toLowerCase()).join(","),
    },
    timeout: 8000,
  });

  if (!Array.isArray(response.data)) {
    throw new Error("Frankfurter returned an invalid exchange-rate response");
  }

  const rates = { [base]: 1 };
  const rateDates = {};

  response.data.forEach((row) => {
    const quote = normalizeCurrency(row?.quote);
    const rate = Number(row?.rate);

    if (
      SUPPORTED_CURRENCIES.includes(quote) &&
      quote !== base &&
      Number.isFinite(rate) &&
      rate > 0
    ) {
      rates[quote] = rate;
      rateDates[quote] = row.date;
    }
  });

  const missingQuotes = quotes.filter((quote) => !rates[quote]);
  if (missingQuotes.length > 0) {
    throw new Error(
      `Frankfurter response is missing rates for: ${missingQuotes.join(", ")}`,
    );
  }

  const dates = Object.values(rateDates).filter(Boolean).sort();
  return {
    date: dates[dates.length - 1] || new Date().toISOString().slice(0, 10),
    base,
    rates,
    rateDates,
    provider: "Frankfurter",
  };
};

const getExchangeRates = async (baseCurrency = "INR") => {
  const base = normalizeCurrency(baseCurrency);
  assertSupportedCurrency(base);

  const cached = rateCache.get(base);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return { ...cached.data, cached: true, stale: false };
  }

  if (pendingRequests.has(base)) return pendingRequests.get(base);

  const request = fetchLatestRates(base)
    .then((data) => {
      rateCache.set(base, { data, cachedAt: Date.now() });
      return { ...data, cached: false, stale: false };
    })
    .catch((error) => {
      if (cached) return { ...cached.data, cached: true, stale: true };
      error.statusCode ||= 502;
      throw error;
    })
    .finally(() => pendingRequests.delete(base));

  pendingRequests.set(base, request);
  return request;
};

module.exports = {
  CACHE_TTL_MS,
  SUPPORTED_CURRENCIES,
  getExchangeRates,
};
