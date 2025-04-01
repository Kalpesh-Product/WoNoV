// export const convertToISOFormat = (dateStr, timeStr) => {
//   // Convert date string to YYYY-MM-DD
//   const [day, month, year] = dateStr.split("-").map(Number);
//   const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
//     day
//   ).padStart(2, "0")}`;

//   // Convert time string to 24-hour format
//   const timeParts = timeStr.match(/(\d+):(\d+) (\w+)/);
//   if (!timeParts) {
//     throw new Error("Invalid time format");
//   }

//   let hours = parseInt(timeParts[1], 10);
//   const minutes = timeParts[2];
//   const period = timeParts[3];

//   if (period === "PM" && hours !== 12) {
//     hours += 12;
//   } else if (period === "AM" && hours === 12) {
//     hours = 0;
//   }

//   const formattedTime = `${String(hours).padStart(2, "0")}:${minutes}:00`;

//   // Combine date and time
//   return `${formattedDate}T${formattedTime}`;
// };

// export const convertToISOFormat = (dateStr, timeStr) => {
//   // Check for invalid inputs
//   if (!dateStr || !timeStr) {
//     console.warn("Invalid date or time:", { dateStr, timeStr });
//     return null;
//   }

//   // Validate and format the date
//   const dateParts = dateStr.split("-");
//   if (dateParts.length !== 3) {
//     console.error("Invalid date format:", dateStr);
//     return null;
//   }

//   const [day, month, year] = dateParts.map(Number);
//   if (isNaN(day) || isNaN(month) || isNaN(year)) {
//     console.error("Invalid date values:", dateStr);
//     return null;
//   }

//   const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
//     day
//   ).padStart(2, "0")}`;

//   // Validate and format the time
//   const timeParts = timeStr.match(/(\d+):(\d+)\s?(AM|PM)?/i);
//   if (!timeParts) {
//     console.error("Invalid time format:", timeStr);
//     return null;
//   }

//   let hours = parseInt(timeParts[1], 10);
//   const minutes = timeParts[2];
//   const period = timeParts[3]?.toUpperCase(); // Optional AM/PM

//   // Convert 12-hour format to 24-hour format if needed
//   if (period === "PM" && hours !== 12) {
//     hours += 12;
//   } else if (period === "AM" && hours === 12) {
//     hours = 0;
//   }

//   const formattedTime = `${String(hours).padStart(2, "0")}:${minutes}:00`;

//   return `${formattedDate}T${formattedTime}`;
// };

export const convertToISOFormat = (dateStr, timeStr) => {
  // Check for invalid inputs
  if (!dateStr || !timeStr) {
    console.warn("Invalid date or time:", { dateStr, timeStr });
    return null;
  }

  // Normalize date format (handles both "DD-MM-YYYY" and "DD/MM/YYYY")
  const normalizedDateStr = dateStr.replace(/\//g, "-");
  const dateParts = normalizedDateStr.split("-");

  if (dateParts.length !== 3) {
    console.error("Invalid date format:", dateStr);
    return null;
  }

  const [day, month, year] = dateParts.map(Number);
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    console.error("Invalid date values:", dateStr);
    return null;
  }

  const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;

  // Validate and format the time
  const timeParts = timeStr.match(/(\d+):(\d+)\s?(AM|PM)?/i);
  if (!timeParts) {
    console.error("Invalid time format:", timeStr);
    return null;
  }

  let hours = parseInt(timeParts[1], 10);
  const minutes = timeParts[2];
  const period = timeParts[3]?.toUpperCase(); // Optional AM/PM

  // Convert 12-hour format to 24-hour format if needed
  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  const formattedTime = `${String(hours).padStart(2, "0")}:${minutes}:00`;

  return `${formattedDate}T${formattedTime}`;
};
