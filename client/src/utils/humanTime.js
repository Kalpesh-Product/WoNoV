import dayjs from "dayjs";

const humanDate = (date) => {
  if (!date) return "—";
  const d = dayjs(date); // ISO-safe
  return d.isValid() ? d.format("DD-MM-YYYY") : "—";
};

export default humanDate;
