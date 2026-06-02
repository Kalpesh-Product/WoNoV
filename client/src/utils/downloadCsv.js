// src/utils/downloadCsv.js

import dayjs from "dayjs";

const EXCLUDED_FIELD_PATTERNS = [
  /\._id$/,
  /^_id$/,
  /\.id$/,
  /^id$/,
  /createdAt/,
  /updatedAt/,
  /sqft/,
  /openDesks/,
  /cabinDesks/,
  /company/,
  /^__v$/,
  /\.__v$/,
];

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]*)?$/;
const MONGO_ID_REGEX = /^[a-f0-9]{24}$/i;

const isExcludedHeader = (header) =>
  EXCLUDED_FIELD_PATTERNS.some((pattern) => pattern.test(header));

const isMongoId = (value) =>
  typeof value === "string" && MONGO_ID_REGEX.test(value.trim());

const formatIfDate = (value) => {
  if (typeof value !== "string") return value;

  if (!ISO_DATE_REGEX.test(value.trim())) return value;

  const parsed = dayjs(value);

  return parsed.isValid() ? parsed.format("DD-MM-YYYY") : value;
};

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return "";

  if (isMongoId(String(value).trim())) return "";

  const formatted = formatIfDate(
    typeof value === "object" ? JSON.stringify(value) : String(value),
  );

  return `"${formatted.replace(/"/g, '""')}"`;
};

const toReadableHeader = (keyPath) =>
  String(keyPath)
    .split(".")
    .map((segment) =>
      segment
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^./, (char) => char.toUpperCase()),
    )
    .join(" - ");

const flattenObject = (obj, prefix = "") => {
  let result = {};

  Object.entries(obj || {}).forEach(([key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      result[nextKey] = "";
    } else if (Array.isArray(value)) {
      result[nextKey] = JSON.stringify(value);
    } else if (typeof value === "object") {
      Object.assign(result, flattenObject(value, nextKey));
    } else {
      result[nextKey] = value;
    }
  });

  return result;
};

const normalizeRows = (data) => {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data.map((item) => flattenObject(item));
  }

  if (typeof data === "object") {
    const rows = [];

    const parentFields = {};

    Object.entries(data).forEach(([key, value]) => {
      if (!Array.isArray(value)) {
        if (typeof value === "object" && value !== null) {
          Object.assign(parentFields, flattenObject(value, key));
        } else {
          parentFields[key] = value;
        }
      }
    });

    Object.entries(data).forEach(([key, value]) => {
      if (!Array.isArray(value)) return;

      if (
        value.every(
          (item) =>
            typeof item === "object" && item !== null && !Array.isArray(item),
        )
      ) {
        value.forEach((item) => {
          rows.push({
            ...parentFields,
            ...flattenObject(item),
          });
        });
      }
    });

    return rows.length ? rows : [flattenObject(data)];
  }

  return [];
};

export const downloadCsv = ({ data, fileName = "report" }) => {
  const normalizedRows = normalizeRows(data);

  if (!normalizedRows.length) return false;

  const headers = [
    ...new Set(normalizedRows.flatMap((row) => Object.keys(row))),
  ].filter((header) => !isExcludedHeader(header));

  const csvLines = [
    headers.map((h) => escapeCsvValue(toReadableHeader(h))).join(","),

    ...normalizedRows.map((row) =>
      headers.map((h) => escapeCsvValue(row[h])).join(","),
    ),
  ];

  const blob = new Blob([csvLines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });

  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");

  const safeFileName =
    String(fileName)
      .replace(/[<>:"/\\|?*]+/g, "")
      .replace(/\s+/g, "-")
      .trim() || "report";

  link.href = objectUrl;
  link.download = `${safeFileName}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(objectUrl);

  return true;
};
