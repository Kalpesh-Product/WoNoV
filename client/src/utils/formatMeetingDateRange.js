import dayjs from "dayjs";

const formatDate = (value) => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD-MM-YYYY") : null;
};

// Prefer the booking's full date span over the individual calendar event's date.
export const formatMeetingDateRange = (meeting = {}) => {
  if (!meeting) return "N/A";

  const slots = Array.isArray(meeting.bookingSlots) ? meeting.bookingSlots : [];
  const slotDates = slots
    .map((slot) => formatDate(slot.date || slot.startTime))
    .filter(Boolean);
  const start = formatDate(meeting.startDate) || slotDates[0] ||
    formatDate(meeting.startTime) || formatDate(meeting.date);
  const end = formatDate(meeting.endDate) || slotDates.at(-1) ||
    formatDate(meeting.endTime) || start;

  return start ? `${start} to ${end}` : "N/A";
};
