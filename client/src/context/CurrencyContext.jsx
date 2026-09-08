import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "investor-dashboard-currency";
const RATES_STORAGE_KEY = "investor-dashboard-exchange-rates";
const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(
    () => localStorage.getItem(STORAGE_KEY) || "INR",
  );
  const [rates, setRates] = useState(() => {
    try {
      const cachedRates = JSON.parse(localStorage.getItem(RATES_STORAGE_KEY));
      return cachedRates?.INR ? cachedRates : { INR: 1 };
    } catch {
      return { INR: 1 };
    }
  });
  const [isRatesLoading, setIsRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("https://open.er-api.com/v6/latest/INR", {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Exchange rates are unavailable");
        return response.json();
      })
      .then((data) => {
        if (data.result !== "success" || !data.rates) {
          throw new Error("Invalid exchange-rate response");
        }
        setRates(data.rates);
        localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(data.rates));
        setRatesError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.warn("Using fallback exchange rates", error);
          setRatesError("Live exchange rates could not be refreshed");
        }
      })
      .finally(() => setIsRatesLoading(false));

    return () => controller.abort();
  }, []);

  const value = useMemo(() => {
    const rate = rates[currency] || 1;
    const convert = (amount) => (Number(amount) || 0) * rate;
    const format = (amount, options = {}) =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "JPY" ? 0 : 2,
        ...options,
      }).format(convert(amount));

    const formatConverted = (amount, options = {}) =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "JPY" ? 0 : 2,
        ...options,
      }).format(Number(amount) || 0);

    const currencies = Object.keys(rates).sort((first, second) => {
      if (first === "INR") return -1;
      if (second === "INR") return 1;
      return first.localeCompare(second);
    });

    return {
      currency,
      currencies,
      isRatesLoading,
      ratesError,
      setCurrency,
      rate,
      convert,
      format,
      formatConverted,
    };
  }, [currency, isRatesLoading, rates, ratesError]);

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used inside CurrencyProvider");
  return context;
};