const CALENDAR_DAY_MS = 24 * 60 * 60 * 1000;

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const toCalendarKey = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = Object.fromEntries(
    dateFormatter
      .formatToParts(date)
      .filter(({ type }) => type !== "literal")
      .map(({ type, value: partValue }) => [type, partValue]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const calendarKeyToUtcDate = (key) => new Date(`${key}T00:00:00.000Z`);

const getHolidayDateKeys = (holidays = []) => {
  const holidayDates = new Set();
  holidays.forEach((holiday) => {
    const startKey = toCalendarKey(holiday?.start);
    const endKey = toCalendarKey(holiday?.end || holiday?.start);
    if (!startKey || !endKey) return;
    const start = calendarKeyToUtcDate(startKey);
    const end = calendarKeyToUtcDate(endKey);
    if (end < start) return;
    for (let date = start; date <= end; date = new Date(date.getTime() + CALENDAR_DAY_MS)) {
      holidayDates.add(date.toISOString().slice(0, 10));
    }
  });
  return holidayDates;
};

const calculateDelayedWorkingDays = (deadline, closingDate, holidays = []) => {
  const deadlineKey = toCalendarKey(deadline);
  const closingKey = toCalendarKey(closingDate);
  if (!deadlineKey || !closingKey || closingKey <= deadlineKey) return 0;

  const holidayDates = getHolidayDateKeys(holidays);
  const closingDay = calendarKeyToUtcDate(closingKey);
  let date = new Date(calendarKeyToUtcDate(deadlineKey).getTime() + CALENDAR_DAY_MS);
  let delayedDays = 0;

  while (date <= closingDay) {
    const dateKey = date.toISOString().slice(0, 10);
    const isSunday = date.getUTCDay() === 0;
    if (!isSunday && !holidayDates.has(dateKey)) delayedDays += 1;
    date = new Date(date.getTime() + CALENDAR_DAY_MS);
  }

  return delayedDays;
};

const calculateDailyLogDelay = (record, holidays = [], now = new Date()) => {
  const deadline = record.deadline || record.sourceDueTask?.deadline ||
    record.sourceSelfKpa?.deadline || record.date;
  if (!deadline) return 0;
  const end = record.status === "Done"
    ? record.completedAt || record.endTime || record.date
    : now;
  if (!end) return 0;
  return calculateDelayedWorkingDays(deadline, end, holidays);
};

module.exports = { calculateDelayedWorkingDays, calculateDailyLogDelay, toCalendarKey };
