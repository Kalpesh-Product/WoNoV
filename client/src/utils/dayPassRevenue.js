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
