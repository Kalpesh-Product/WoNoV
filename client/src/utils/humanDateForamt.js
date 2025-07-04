// import dayjs from "dayjs";

// const humanDate = (date) => {
//   if (!date) return "—";

//   try {
//     const parsedDate = new Date(date);

//     if (isNaN(parsedDate.getTime())) return "N/A";

//     // return new Intl.DateTimeFormat("en-GB", {
//     //   day: "2-digit",
//     //   month: "numeric",
//     //   year: "numeric",
//     // }).format(parsedDate);

//     return dayjs(parsedDate).format("DD-MM-YYYY");
//   } catch (error) {
//     console.log("error");
//     return "N/A";
//   }
// };

// export default humanDate;

// humanDateForamt.js

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const humanDate = (date) => {
  if (!date) return "N/A";

  const validDate = date instanceof Date ? date : new Date(date);
  console.log("date", validDate);
  if (isNaN(validDate.getTime())) return "N/A";

  return dayjs.utc(validDate).format("DD-MM-YYYY");
};

export default humanDate;
