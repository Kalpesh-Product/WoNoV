+13 - 0;

import dayjs from "dayjs";

export default formatDateTime = (value) => {
  if (!value) return "N/A";

  const parsed = dayjs(value);

  if (!parsed.isValid()) return "N/A";

  return parsed.format("DD-MM-YYYY, hh:mm A");
};

export const formatDateTimeFields = (data) => {
  if (!data) return "N/A";

  const formattedData = data.map((field) => {
    if (field?.toLowerCase().includes("date")) {
      const date = dayjs(field);
      if (!date.isValid()) return date;
      return date.format("DD-MM-YYYY");
    } else if (field?.toLowerCase().includes("time")) {
      const date = dayjs(field);
      if (!date.isValid()) return date;
      return date.format("hh:mm A");
    }
    return field;
  });

  return formattedData;
};
