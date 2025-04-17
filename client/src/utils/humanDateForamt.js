const humanDate = (date) => {
  if (!date) return "—";

  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) return "N/A";

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "numeric",
      year: "numeric",
    }).format(parsedDate);
  } catch (error) {
    return "N/A";
  }
};

export default humanDate;
