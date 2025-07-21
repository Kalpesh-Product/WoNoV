const humanTime = (date) => {
  if (!date) return "—"; // or return "", or some fallback

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(parsedDate);
};

export default humanTime;

// const humanTime = (date) => {
//   return new Intl.DateTimeFormat("en-GB", {
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true,
//   }).format(new Date(date));
// };

// export default humanTime;