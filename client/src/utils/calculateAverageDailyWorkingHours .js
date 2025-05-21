// import { differenceInMinutes, parseISO } from "date-fns";

// export const calculateAverageDailyWorkingHours = (attendances, workingDays) => {
//   const userTimeMap = {};

//   attendances.forEach((entry) => {
//     const userId = entry.user;
//     const { inTime, outTime } = entry;

//     // Skip invalid entries
//     if (!inTime || !outTime) return;

//     try {
//       const inTimeParsed = parseISO(inTime);
//       const outTimeParsed = parseISO(outTime);

//       const minutesWorked = differenceInMinutes(outTimeParsed, inTimeParsed);

//       if (!userTimeMap[userId]) {
//         userTimeMap[userId] = 0;
//       }

//       userTimeMap[userId] += minutesWorked;
//     } catch (err) {
//       console.warn("Skipping invalid date entry:", entry, err);
//     }
//   });

//   const allAvgHours = Object.values(userTimeMap).map(
//     (totalMinutes) => totalMinutes / 60 / workingDays
//   );

//   const overallAverage = allAvgHours.length
//     ? allAvgHours.reduce((sum, hours) => sum + hours, 0) / allAvgHours.length
//     : 0;

//   return overallAverage.toFixed(2); // e.g., "7.89"
// };

import { differenceInMinutes, parseISO } from "date-fns";

export const calculateAverageDailyWorkingHours = (attendances, workingDays) => {
  const userTimeMap = {};

  attendances.forEach((entry) => {
    const userId = entry.user;
    const inTime = entry.inTime ? parseISO(entry.inTime) : null;
    const outTime = entry.outTime ? parseISO(entry.outTime) : null;

    if (!inTime || !outTime) return;

    const minutesWorked = differenceInMinutes(outTime, inTime);

    if (!userTimeMap[userId]) {
      userTimeMap[userId] = 0;
    }
    if (!userTimeMap[userId]) {
      userTimeMap[userId] = 0;
    }

    userTimeMap[userId] += minutesWorked;
    userTimeMap[userId] += minutesWorked;
  });

  const allAvgHours = Object.values(userTimeMap).map(
    (totalMinutes) => totalMinutes / 60 / workingDays
  );

  const overallAverage =
    allAvgHours.reduce((sum, hours) => sum + hours, 0) / allAvgHours.length;

  return overallAverage.toFixed(2); // e.g., "7.89"
};
