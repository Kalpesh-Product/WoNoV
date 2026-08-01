// utils/attendanceUtils.js
import { format } from "date-fns";

export const calculateAverageAttendance = (attendances = [], workingDays) => {
  const userDayMap = {};
  const totalWorkingDays =
    Number.isFinite(Number(workingDays)) && Number(workingDays) > 0
      ? Number(workingDays)
      : 220;

  attendances.forEach((entry) => {
    const userId = String(entry?.user?._id || entry?.user || "").trim();
    const inTime = new Date(entry?.inTime);

    if (!userId || Number.isNaN(inTime.getTime())) return;

    const day = format(inTime, "yyyy-MM-dd");

    if (!userDayMap[userId]) userDayMap[userId] = new Set();
    userDayMap[userId].add(day); // Set ensures unique days
  });

  const allPercentages = Object.values(userDayMap).map(
    (daysSet) => (daysSet.size / totalWorkingDays) * 100
  );

  if (!allPercentages.length) return "0.00";

  const averageAttendance =
    allPercentages.reduce((sum, percent) => sum + percent, 0) /
    allPercentages.length;

  return averageAttendance.toFixed(2); // e.g., "86.45"
};
