import { differenceInMinutes, parseISO } from "date-fns";

export const calculateAverageDailyWorkingHours = (attendances, workingDays) => {
  const userTimeMap = {};

  attendances.forEach((entry) => {
    const userId = entry.user;
    const inTime = parseISO(entry.inTime);
    const outTime = parseISO(entry.outTime);

    if (!inTime || !outTime) return;

    const minutesWorked = differenceInMinutes(outTime, inTime);

    if (!userTimeMap[userId]) {
      userTimeMap[userId] = 0;
    }

    userTimeMap[userId] += minutesWorked;
  });

  const allAvgHours = Object.values(userTimeMap).map(
    (totalMinutes) => (totalMinutes / 60) / workingDays
  );

  const overallAverage =
    allAvgHours.reduce((sum, hours) => sum + hours, 0) / allAvgHours.length;

  return overallAverage.toFixed(2); // e.g., "7.89"
};