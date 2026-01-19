import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Get timezone for request
 * Priority:
 * 1. req.user.timezone
 * 2. req.company.timezone
 * 3. fallback to browser/server guess
 */
export const getRequestTimezone = (req) => {
  return req?.user?.timezone || req?.company?.timezone || dayjs.tz.guess();
};

/**
 * Convert a date to start-of-day in request timezone, stored as UTC
 * Used when SAVING dates like assignedDate
 */
export const toUtcStartOfDay = (date, timezone) => {
  if (!date) return null;

  const d = dayjs(date);
  if (!d.isValid()) return null;

  return d.tz(timezone).startOf("day").utc().toDate();
};

/**
 * Convert a date to end-of-day in request timezone, stored as UTC
 */
export const toUtcEndOfDay = (date, timezone) => {
  if (!date) return null;

  const d = dayjs(date);
  if (!d.isValid()) return null;

  return d.tz(timezone).endOf("day").utc().toDate();
};

/**
 * Get today's UTC range based on request timezone
 * Used for "today" queries
 */
export const getTodayUtcRange = (timezone) => {
  const start = dayjs().tz(timezone).startOf("day").utc().toDate();
  const end = dayjs().tz(timezone).endOf("day").utc().toDate();

  return { start, end };
};
