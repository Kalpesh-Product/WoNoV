+13 - 0;

import dayjs from "dayjs";

const formatDateTime = (value) => {
  if (!value) return "N/A";

  const parsed = dayjs(value);

  if (!parsed.isValid()) return "N/A";

  return parsed.format("DD-MM-YYYY, hh:mm A");
};

export const formatDateTimeFields = (data) => {
  if (!data) return "N/A";

  const formatValue = (value, key = "") => {
    if (typeof value !== "string") return value;

    if (key.toLowerCase().includes("date")) {
      const date = dayjs(value);
      if (!date.isValid()) return value;
      return date.format("DD-MM-YYYY");
    }

    if (key.toLowerCase().includes("time")) {
      const date = dayjs(value);
      if (!date.isValid()) return value;
      return date.format("hh:mm A");
    }

    return value;
  };

  if (Array.isArray(data)) {
    return data.map((field) => formatValue(field, field));
  }

  if (typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, formatValue(value, key)])
    );
  }

  return data;
};

export default formatDateTime;
