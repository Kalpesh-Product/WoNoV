import dayjs from "dayjs";
import { inrFormat } from "../utils/currencyFormat";

const PaidAmountHistory = ({ history = [], currentAmount = 0, currentDate }) => {
  const entries = Array.isArray(history) ? history : [];
  const historyToShow = entries.length
    ? entries
    : currentDate || Number(currentAmount) > 0
      ? [{ amount: currentAmount, changedAt: currentDate, legacy: true }]
      : [];

  if (!historyToShow.length) return "No Paid Amount history";

  return (
    <span className="block space-y-2">
      {historyToShow
        .slice()
        .reverse()
        .map((entry, index) => {
          const person = entry.changedBy;
          const changedBy =
            typeof person === "object" && person
              ? [person.firstName, person.lastName].filter(Boolean).join(" ")
              : "";
          return (
            <span key={`${entry.changedAt || "legacy"}-${index}`} className="block rounded border border-gray-200 p-2">
              <div>
                {entry.legacy
                  ? `Current paid amount: INR ${inrFormat(entry.amount || 0)}`
                  : `INR ${inrFormat(entry.previousAmount || 0)} → INR ${inrFormat(entry.amount || 0)}`}
              </div>
              <span className="block text-sm text-gray-500">
                {entry.changedAt
                  ? dayjs(entry.changedAt).format("DD MMM YYYY, h:mm A")
                  : "Date unavailable"}
                {changedBy ? ` · ${changedBy}` : ""}
              </span>
            </span>
          );
        })}
    </span>
  );
};

export default PaidAmountHistory;
