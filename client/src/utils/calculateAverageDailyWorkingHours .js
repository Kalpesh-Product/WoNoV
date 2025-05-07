import { parseISO } from "date-fns";

export function calculateAverageDailyWorkingHours(attendanceRecords) {
  let totalHours = 0;
  let validCount = 0;

  attendanceRecords.forEach((record) => {
    if (!record?.inTime || !record?.outTime) return;

    try {
      const inTime = parseISO(record.inTime);
      const outTime = parseISO(record.outTime);

      if (isNaN(inTime) || isNaN(outTime)) return; // skip if invalid date

      const hoursWorked = (outTime - inTime) / (1000 * 60 * 60);
      totalHours += hoursWorked;
      validCount++;
    } catch (err) {
      console.warn("Invalid date in record:", record, err);
    }
  });

  return validCount > 0 ? (totalHours / validCount).toFixed(2) : "0";
}

// import { differenceInMinutes, parseISO } from "date-fns";

// export const calculateAverageDailyWorkingHours = (attendances, workingDays) => {
//   const userTimeMap = {};

//   attendances.forEach((entry) => {
//     const userId = entry.user;
//     const inTime = parseISO(entry.inTime);
//     const outTime = parseISO(entry.outTime);

//     if (!inTime || !outTime) return;

//     const minutesWorked = differenceInMinutes(outTime, inTime);

//     if (!userTimeMap[userId]) {
//       userTimeMap[userId] = 0;
//     }

//     userTimeMap[userId] += minutesWorked;
//   });

//   const allAvgHours = Object.values(userTimeMap).map(
//     (totalMinutes) => (totalMinutes / 60) / workingDays
//   );

//   const overallAverage =
//     allAvgHours.reduce((sum, hours) => sum + hours, 0) / allAvgHours.length;

//   return overallAverage.toFixed(2); // e.g., "7.89"
// };
