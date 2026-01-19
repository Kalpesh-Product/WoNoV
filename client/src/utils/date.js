// src/utils/dateUtils.js
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Set up Day.js once inside the utility
dayjs.extend(utc);
dayjs.extend(timezone);

export const USER_TZ = dayjs.tz.guess();

// convert UTC → user timezone
export const toUserTz = (date) => {
  if (!date) return null;

  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.tz(USER_TZ) : null;
};

// get “today” in user timezone
export const getUserToday = () => {
  return dayjs().tz(USER_TZ).startOf("day");
};

//
export const isTodayForUser = (date) => {
  const userDate = toUserTz(date);
  if (!userDate) return false;

  return userDate.isSame(getUserToday(), "day");
};
