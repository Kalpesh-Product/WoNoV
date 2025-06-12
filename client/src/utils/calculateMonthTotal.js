import dayjs from "dayjs";

/**
 * Calculates the total amount for a specific month.
 *
 * @param {Array} data - The dataset (array of objects)
 * @param {string} dateKey - Key used to find the date field (e.g., "dueDate")
 * @param {string} amountKey - Key used to find the numeric field (e.g., "actualAmount")
 * @param {string|null} selectedMonth - Month in format "MMM-YYYY"
 * @returns {number}
 */
export function calculateMonthTotal(data, dateKey, amountKey, selectedMonth) {
  if (!Array.isArray(data) || !dateKey || !amountKey || !selectedMonth) {
    return 0; // Fallback for any missing or invalid input
  }

  return data.reduce((total, item) => {
    const dateValue = item[dateKey];
    const amountValue = item[amountKey];

    if (!dayjs(dateValue).isValid()) return total;

    const monthLabel = dayjs(dateValue).format("MMM-YYYY");

    if (monthLabel === selectedMonth && typeof amountValue === "number") {
      return total + amountValue;
    }

    return total;
  }, 0);
}
