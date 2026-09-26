import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../utils/axios";

const STORAGE_KEY = "investor-dashboard-currency";
const RATES_STORAGE_KEY = "investor-dashboard-exchange-rates";
const SUPPORTED_CURRENCIES = ["INR", "USD", "AED"];
const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const { pathname } = useLocation();
  const isInvestorDashboard = pathname.includes("/investor-dashboard");
  const [currency, setCurrency] = useState(
    () => {
      const savedCurrency = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED_CURRENCIES.includes(savedCurrency) ? savedCurrency : "INR";
    },
  );
  const [rates, setRates] = useState(() => {
    try {
      const cachedData = JSON.parse(localStorage.getItem(RATES_STORAGE_KEY));
      const cachedRates = cachedData?.rates || cachedData;
      return cachedRates?.INR ? cachedRates : { INR: 1 };
    } catch {
      return { INR: 1 };
    }
  });
  const [ratesDate, setRatesDate] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RATES_STORAGE_KEY))?.date || "";
    } catch {
      return "";
    }
  });
  const [isRatesLoading, setIsRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);

  useEffect(() => {
    if (!isInvestorDashboard) {
      setIsRatesLoading(false);
      return undefined;
    }

    setIsRatesLoading(true);
    const controller = new AbortController();
    api
      .get("/api/exchange-rates", {
        params: { base: "INR" },
        signal: controller.signal,
      })
      .then((response) => response.data)
      .then((data) => {
        const hasSupportedRates = SUPPORTED_CURRENCIES.every(
          (code) => Number(data.rates?.[code]) > 0,
        );
        if (data.base !== "INR" || !hasSupportedRates) {
          throw new Error("Invalid exchange-rate response");
        }
        setRates(data.rates);
        setRatesDate(data.date || "");
        localStorage.setItem(
          RATES_STORAGE_KEY,
          JSON.stringify({
            date: data.date || "",
            rates: data.rates,
          }),
        );
        setRatesError("");
      })
      .catch((error) => {
        if (error.name !== "CanceledError") {
          console.warn("Using fallback exchange rates", error);
          setRatesError(
            error.response?.data?.message ||
              "Live exchange rates could not be refreshed",
          );
        }
      })
      .finally(() => setIsRatesLoading(false));

    return () => controller.abort();
  }, [isInvestorDashboard]);

  const value = useMemo(() => {
    const getRate = (fromCurrency = "INR", toCurrency = currency) => {
      const from = String(fromCurrency || "INR").toUpperCase();
      const to = String(toCurrency || currency).toUpperCase();
      if (from === to) return 1;

      const fromRate = Number(rates[from]);
      const toRate = Number(rates[to]);
      if (!(fromRate > 0) || !(toRate > 0)) return null;
      return toRate / fromRate;
    };
    const rate = getRate("INR", currency) || 1;
    const convert = (amount, originalCurrency = "INR") => {
      const conversionRate = getRate(originalCurrency, currency);
      return (Number(amount) || 0) * (conversionRate || 1);
    };
    const formatCurrencyValue = (amount, options = {}) => {
      const formatterOptions = {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        ...options,
      };

      if (isInvestorDashboard && currency !== "INR") {
        const investorFormatterOptions = {
          ...formatterOptions,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        };

        return `${new Intl.NumberFormat("en-IN", investorFormatterOptions).format(Math.trunc(amount))} ${currency}`;
      }

      if (currency === "INR") {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency,
          ...formatterOptions,
        }).format(amount);
      }

      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        ...formatterOptions,
      }).format(amount);
    };
    const format = (amount, options = {}, originalCurrency = "INR") =>
      formatCurrencyValue(convert(amount, originalCurrency), options);

    const formatConverted = (amount, options = {}) =>
      formatCurrencyValue(Number(amount) || 0, options);

    const currencies = SUPPORTED_CURRENCIES;

    return {
      currency,
      currencies,
      isRatesLoading,
      ratesError,
      ratesDate,
      setCurrency,
      rate,
      getRate,
      convert,
      format,
      formatConverted,
    };
  }, [
    currency,
    isInvestorDashboard,
    isRatesLoading,
    rates,
    ratesDate,
    ratesError,
  ]);

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used inside CurrencyProvider");
  return context;
};
