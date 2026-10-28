import dayjs from "dayjs";

export const getAttendanceRangeDays = (range) => {
  const start = dayjs(range?.startDate).startOf("day");
  const end = dayjs(range?.endDate).startOf("day");
  if (!range?.startDate || !range?.endDate || !start.isValid() || !end.isValid() || end.isBefore(start)) return [];
  const days = [];
  for (let date = start; !date.isAfter(end); date = date.add(1, "day")) {
    days.push(date.format("YYYY-MM-DD"));
  }
  return days;
};

export const getAttendanceRangeParams = (range) => ({
  startDate: dayjs(range.startDate).startOf("day").format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
  endDate: dayjs(range.endDate).endOf("day").format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
});
