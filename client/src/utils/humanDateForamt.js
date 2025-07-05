import dayjs from "dayjs";

const humanDate = (date) => {
  if (!date) return "—";

  try {
    const parsedDate = new Date(date);

    if (isNaN(parsedDate)) return "N/A";

    // return new Intl.DateTimeFormat("en-GB", {
    //   day: "2-digit",
    //   month: "numeric",
    //   year: "numeric",
    // }).format(parsedDate);

    return dayjs(parsedDate).format("DD-MM-YYYY");
  } catch (error) {
    console.log("error");
    return "N/A";
  }
};

export default humanDate;
