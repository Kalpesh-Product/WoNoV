import dayjs from "dayjs";

export const dateKeysInRange = (startDate, endDate) => {
  if (!startDate || !endDate || !dayjs(startDate).isValid() || !dayjs(endDate).isValid() || dayjs(endDate).isBefore(startDate, "day")) return [];
  const result = [];
  for (let day = dayjs(startDate).startOf("day"); !day.isAfter(endDate, "day") && result.length <= 100; day = day.add(1, "day")) {
    result.push(day.format("YYYY-MM-DD"));
  }
  return result;
};

export const bookedSlotsForDay = (dateKey, bookings) => {
  const dayStart = dayjs(dateKey).startOf("day");
  const dayEnd = dayStart.add(1, "day");
  return (bookings || []).flatMap((booking) => {
    if (String(booking?.status || "").toLowerCase() === "cancelled") return [];
    const slots = booking.bookingSlots?.length ? booking.bookingSlots : [booking];
    return slots.flatMap((slot) => {
      const start = dayjs(slot.startTime);
      const originalEnd = dayjs(slot.endTime);
      const extendedEnd = !booking.bookingSlots?.length && booking.extendTime ? dayjs(booking.extendTime) : null;
      const end = extendedEnd?.isAfter(originalEnd) ? extendedEnd : originalEnd;
      if (!start.isValid() || !end.isValid() || !start.isBefore(dayEnd) || !end.isAfter(dayStart)) return [];
      const shownStart = start.isBefore(dayStart) ? dayStart : start;
      const shownEnd = end.isAfter(dayEnd) ? dayEnd : end;
      return [{ start, end, label: `${shownStart.format("h:mm A")}–${shownEnd.format("h:mm A")}` }];
    });
  });
};
