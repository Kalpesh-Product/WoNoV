const { format, intervalToDuration } = require("date-fns");

const formatDate = (date) => {
  if (!date) return "N/A";
  return format(new Date(date), "dd/MM/yyyy");
};

const formatWithOrdinal = (date) => {
  if (!date) return "N/A";

  const d = new Date(date);

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
};

// Function to add ordinal suffix (st, nd, rd, th)
const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return `${day}th`;
  const suffixes = ["st", "nd", "rd"];
  const lastDigit = day % 10;
  return `${day}${suffixes[lastDigit - 1] || "th"}`;
};

const formatTime = (timestamp) => {
  if (!timestamp) return "N/A";
  return format(new Date(timestamp), "hh:mm a");
};

// const formatTime = (timestamp) => {
//   if (!timestamp) return "N/A";

//   return new Date(timestamp).toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   });
// };

const formatDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return "N/A";

  const duration = intervalToDuration({
    start: new Date(startTime),
    end: new Date(endTime),
  });

  const { hours, minutes } = duration;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return "0m";
  }
};

module.exports = { formatDate, formatWithOrdinal, formatTime, formatDuration };
