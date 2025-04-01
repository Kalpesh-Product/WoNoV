export const convertToISOFormat = (dateStr, timeStr) => {
  // Convert date string to YYYY-MM-DD
  const [day, month, year] = dateStr.split("-").map(Number);
  const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;

  // Convert time string to 24-hour format
  const timeParts = timeStr.match(/(\d+):(\d+) (\w+)/);
  if (!timeParts) {
    throw new Error("Invalid time format");
  }

  let hours = parseInt(timeParts[1], 10);
  const minutes = timeParts[2];
  const period = timeParts[3];

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  const formattedTime = `${String(hours).padStart(2, "0")}:${minutes}:00`;

  // Combine date and time
  return `${formattedDate}T${formattedTime}`;
};
