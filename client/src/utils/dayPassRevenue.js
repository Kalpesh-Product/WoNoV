const normalizeRevenueType = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const hasDayPassType = (value) => {
  const normalizedValue = normalizeRevenueType(value);

  return (
    normalizedValue.includes("open desk") ||
    normalizedValue.includes("half-day") ||
    normalizedValue.includes("half day") ||
    normalizedValue.includes("full-day") ||
    normalizedValue.includes("full day")
  );
};

export const isDayPassRevenue = (revenue = {}) => {
  if (normalizeRevenueType(revenue?.source) === "day-pass") return true;

  const revenueType =
    revenue?.meetingType ||
    revenue?.meetingTypeRaw ||
    revenue?.particulars ||
    revenue?.visitorType ||
    revenue?.visitorDetails?.purposeOfVisit;

  const isMeetingRoomRevenue =
    Boolean(revenue?.meetingRoomName) ||
    normalizeRevenueType(revenueType).includes("meeting room booking");

  return hasDayPassType(revenueType) && !isMeetingRoomRevenue;
};

const normalizePaymentStatus = (value) =>
  typeof value === "string"
    ? value.trim().toLowerCase()
    : value
      ? "paid"
      : "unpaid";

// Same rule used by the Investor dashboard's income breakdown and
// ACTIVE UNIQUE CLIENTS graphs: a day pass counts only when finance is
// verified AND its payment status is paid.
export const isPaidDayPassRevenue = (revenue = {}) =>
  isDayPassRevenue(revenue) &&
  normalizePaymentStatus(revenue?.financeStatus) === "verified" &&
  normalizePaymentStatus(revenue?.status) === "paid";
