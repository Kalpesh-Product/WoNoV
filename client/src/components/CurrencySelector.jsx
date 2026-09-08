import { useEffect, useMemo, useRef, useState } from "react";
import { useCurrency } from "../context/CurrencyContext";

const CurrencySelector = () => {
  const { currencies, currency, isRatesLoading, ratesError, setCurrency } =
    useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef(null);

  const currencyNames = useMemo(() => {
    if (!Intl.DisplayNames) return null;
    return new Intl.DisplayNames([navigator.language], { type: "currency" });
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedCurrencyName = currencyNames?.of(currency) || currency;

  return (
    <div ref={selectorRef} className="relative w-[180px] text-sm">
      <span className="absolute -top-2 left-3 z-10 bg-white px-1 text-xs font-normal text-[#1E3D73]">
        Currency
      </span>
      <button
        type="button"
        aria-label="Investor dashboard currency"
        aria-expanded={isOpen}
        title={ratesError || "Live INR exchange rates"}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-[#1E3D73] bg-[#1E3D73] px-3 text-left font-normal text-white outline-none focus:ring-1 focus:ring-[#1E3D73]"
      >
        <span className="truncate">
          {currency} - {selectedCurrencyName}
        </span>
        <span
          className="relative ml-2 mr-1 shrink-0"
          style={{ display: "inline-block", width: "14px", height: "9px" }}
          aria-hidden="true"
        >
          <span
            className="absolute bg-white"
            style={{ width: "8px", height: "2px", left: "0", top: "3px", transform: "rotate(45deg)" }}
          />
          <span
            className="absolute bg-white"
            style={{ width: "8px", height: "2px", right: "0", top: "3px", transform: "rotate(-45deg)" }}
          />
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 max-h-72 w-full overflow-y-auto rounded-sm bg-white py-1 shadow-[0_4px_14px_rgba(0,0,0,0.2)]">
          {currencies.map((code) => {
            const name = currencyNames?.of(code) || code;
            const isSelected = code === currency;

            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setCurrency(code);
                  setIsOpen(false);
                }}
                className={`block w-full px-4 py-2 text-left font-normal text-[#1E3D73] transition-colors hover:bg-[#edf3fa] ${
                  isSelected ? "bg-[#edf3fa]" : ""
                }`}
              >
                {code} - {name}
              </button>
            );
          })}
        </div>
      )}

      {isRatesLoading && (
        <span className="hidden text-xs text-gray-500 xl:inline">
          Updating...
        </span>
      )}
    </div>
  );
};

export default CurrencySelector;
