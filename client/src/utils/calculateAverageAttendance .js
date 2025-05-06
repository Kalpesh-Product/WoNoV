// utils/attendanceUtils.js
import { format } from "date-fns";

export const calculateAverageAttendance = (attendances, workingDays) => {
  const userDayMap = {};

  attendances.forEach((entry) => {
    const userId = entry.user;
    const day = format(new Date(entry.inTime), "yyyy-MM-dd");

    if (!userDayMap[userId]) userDayMap[userId] = new Set();
    userDayMap[userId].add(day); // Set ensures unique days
  });

  const allPercentages = Object.values(userDayMap).map(
    (daysSet) => (daysSet.size / 220) * 100
  );

  const averageAttendance =
    allPercentages.reduce((sum, percent) => sum + percent, 0) /
    allPercentages.length;

  return averageAttendance.toFixed(2); // e.g., "86.45"
};
