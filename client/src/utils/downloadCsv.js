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
  /^company$/,
  /\.company$/,
  /^__v$/,
  /\.__v$/,
];

const COLLECTION_FIELD_NAMES = new Set([
  "allBudgets",
  "data",
  "items",
  "records",
  "results",
  "rows",
  "reports",
]);

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]*)?$/;
const MONGO_ID_REGEX = /^[a-f0-9]{24}$/i;
const EMPTY_EXPORT_VALUES = new Set(["NA", "N/A", "NAN", "NULL", "UNDEFINED"]);

const matchesHiddenField = (header, hiddenField) => {
  if (hiddenField instanceof RegExp) return hiddenField.test(header);

  const field = String(hiddenField).trim();

  return (
    header === field ||
    header.startsWith(`${field}.`) ||
    header.endsWith(`.${field}`)
  );
};

const isExcludedHeader = (header, hiddenFields = []) =>
  EXCLUDED_FIELD_PATTERNS.some((pattern) => pattern.test(header)) ||
  hiddenFields.some((field) => matchesHiddenField(header, field));

const isMongoId = (value) =>
  typeof value === "string" && MONGO_ID_REGEX.test(value.trim());

const hasLeadingZeroNumericString = (value) =>
  typeof value === "string" && /^0\d+$/.test(value.trim());

const shouldHideEmptyExportValue = (value) => {
  if (value === null || value === undefined) return true;

  if (typeof value === "number") {
    return Number.isNaN(value);
  }

  if (typeof value === "string") {
    return EMPTY_EXPORT_VALUES.has(value.trim().toUpperCase());
  }

  return false;
};

const formatIfDate = (value) => {
  if (typeof value !== "string") return value;

  if (!ISO_DATE_REGEX.test(value.trim())) return value;

  const parsed = dayjs(value);

  return parsed.isValid() ? parsed.format("DD-MM-YYYY") : value;
};

const toReadableHeader = (keyPath) => {
  const normalizedKeyPath = String(keyPath).trim();

  if (/^sr\.?\s*no$/i.test(normalizedKeyPath)) {
    return "Sr No";
  }

  return normalizedKeyPath
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
};

const shouldOmitParentHeader = (header, allHeaders = []) => {
  const normalizedHeader = String(header || "").trim();
  const readableHeader = toReadableHeader(normalizedHeader);

  return allHeaders.some((candidateHeader) => {
    const normalizedCandidateHeader = String(candidateHeader || "").trim();

    if (!normalizedCandidateHeader || normalizedCandidateHeader === normalizedHeader) {
      return false;
    }

    if (normalizedCandidateHeader.startsWith(`${normalizedHeader}.`)) {
      return true;
    }

    return toReadableHeader(normalizedCandidateHeader).startsWith(
      `${readableHeader} - `,
    );
  });
};

const formatValue = (value, keyPath = "", hiddenFields = []) => {
  if (shouldHideEmptyExportValue(value)) return "";

  if (Array.isArray(value)) {
    return value
      .map((item) => formatValue(item, keyPath, hiddenFields))
      .filter(Boolean)
      .join(" | ");
  }

  if (typeof value === "object") {
    if (value !== null && Object.keys(value).length === 1 && value.name) {
      return value.name;
    }

    return Object.entries(value)
      .filter(([key]) => {
        const nextKey = keyPath ? `${keyPath}.${key}` : key;

        return !isExcludedHeader(nextKey, hiddenFields);
      })
      .map(([key, nestedValue]) => {
        const nextKey = keyPath ? `${keyPath}.${key}` : key;
        const formattedValue = formatValue(nestedValue, nextKey, hiddenFields);

        return formattedValue
          ? `${toReadableHeader(key)}: ${formattedValue}`
          : "";
      })
      .filter(Boolean)
      .join("; ");
  }

  const formatted = formatIfDate(String(value));

  return isMongoId(formatted) ? "" : formatted;
};

const escapeCsvValue = (value) => {
  const formatted = formatValue(value);

  if (hasLeadingZeroNumericString(formatted)) {
    return `="${formatted.trim().replace(/"/g, '""')}"`;
  }

  return formatted ? `"${formatted.replace(/"/g, '""')}"` : "";
};

const flattenObject = (obj, prefix = "", hiddenFields = []) => {
  const result = {};

  Object.entries(obj || {}).forEach(([key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (isExcludedHeader(nextKey, hiddenFields)) return;

    if (Array.isArray(value)) {
      result[nextKey] = formatValue(value, nextKey, hiddenFields);
    } else if (typeof value === "object" && value !== null) {
      Object.assign(result, flattenObject(value, nextKey, hiddenFields));
    } else {
      result[nextKey] = value ?? "";
    }
  });

  return result;
};

const flattenRow = (item, hiddenFields) => {
  if (typeof item === "object" && item !== null && !Array.isArray(item)) {
    return flattenObject(item, "", hiddenFields);
  }

  return { value: formatValue(item, "value", hiddenFields) };
};

const normalizeRows = (data, hiddenFields = []) => {
  if (data === null || data === undefined) return [];

  if (Array.isArray(data)) {
    return data.map((item) => flattenRow(item, hiddenFields));
  }

  if (typeof data !== "object") return [flattenRow(data, hiddenFields)];

  const entries = Object.entries(data).filter(
    ([key]) => !isExcludedHeader(key, hiddenFields),
  );
  const hasScalarFields = entries.some(([, value]) => !Array.isArray(value));
  const parentFields = {};
  const rows = [];

  entries.forEach(([key, value]) => {
    const containsObjects =
      Array.isArray(value) &&
      value.some(
        (item) =>
          typeof item === "object" && item !== null && !Array.isArray(item),
      );
    const isRowCollection =
      containsObjects && (!hasScalarFields || COLLECTION_FIELD_NAMES.has(key));

    if (isRowCollection || (Array.isArray(value) && !value.length)) return;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(parentFields, flattenObject(value, key, hiddenFields));
    } else {
      parentFields[key] = Array.isArray(value)
        ? formatValue(value, key, hiddenFields)
        : value;
    }
  });

  entries.forEach(([key, value]) => {
    const containsObjects =
      Array.isArray(value) &&
      value.some(
        (item) =>
          typeof item === "object" && item !== null && !Array.isArray(item),
      );
    const isRowCollection =
      containsObjects && (!hasScalarFields || COLLECTION_FIELD_NAMES.has(key));

    if (!isRowCollection) return;

    value.forEach((item) => {
      rows.push({
        ...parentFields,
        ...flattenRow(item, hiddenFields),
      });
    });
  });

  return rows.length ? rows : [parentFields];
};

export const downloadCsv = ({
  data,
  fileName = "report",
  hiddenFields = [],
}) => {
  const normalizedRows = normalizeRows(data, hiddenFields);

  if (!normalizedRows.length) return false;

  const headers = [
    ...new Set(normalizedRows.flatMap((row) => Object.keys(row))),
  ].filter(
    (header, _, allHeaders) =>
      !isExcludedHeader(header, hiddenFields) &&
      !shouldOmitParentHeader(header, allHeaders),
  );

  if (!headers.length) return false;

  // const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]*)?$/;
  // const MONGO_ID_REGEX = /^[a-f0-9]{24}$/i;

  // const isExcludedHeader = (header) =>
  //   EXCLUDED_FIELD_PATTERNS.some((pattern) => pattern.test(header));

  // const isMongoId = (value) =>
  //   typeof value === "string" && MONGO_ID_REGEX.test(value.trim());

  // const formatIfDate = (value) => {
  //   if (typeof value !== "string") return value;

  //   if (!ISO_DATE_REGEX.test(value.trim())) return value;

  //   const parsed = dayjs(value);

  //   return parsed.isValid() ? parsed.format("DD-MM-YYYY") : value;
  // };

  // const escapeCsvValue = (value) => {
  //   if (value === null || value === undefined) return "";

  //   if (isMongoId(String(value).trim())) return "";

  //   const formatted = formatIfDate(
  //     typeof value === "object" ? JSON.stringify(value) : String(value),
  //   );

  //   return `"${formatted.replace(/"/g, '""')}"`;
  // };

  // const toReadableHeader = (keyPath) =>
  //   String(keyPath)
  //     .split(".")
  //     .map((segment) =>
  //       segment
  //         .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  //         .replace(/[_-]+/g, " ")
  //         .replace(/\s+/g, " ")
  //         .trim()
  //         .replace(/^./, (char) => char.toUpperCase()),
  //     )
  //     .join(" - ");

  // const flattenObject = (obj, prefix = "") => {
  //   let result = {};

  //   Object.entries(obj || {}).forEach(([key, value]) => {
  //     const nextKey = prefix ? `${prefix}.${key}` : key;

  //     if (value === null || value === undefined) {
  //       result[nextKey] = "";
  //     } else if (Array.isArray(value)) {
  //       result[nextKey] = JSON.stringify(value);
  //     } else if (typeof value === "object") {
  //       Object.assign(result, flattenObject(value, nextKey));
  //     } else {
  //       result[nextKey] = value;
  //     }
  //   });

  //   return result;
  // };

  // const normalizeRows = (data) => {
  //   if (!data) return [];

  //   if (Array.isArray(data)) {
  //     return data.map((item) => flattenObject(item));
  //   }

  //   if (typeof data === "object") {
  //     const rows = [];

  //     const parentFields = {};

  //     Object.entries(data).forEach(([key, value]) => {
  //       if (!Array.isArray(value)) {
  //         if (typeof value === "object" && value !== null) {
  //           Object.assign(parentFields, flattenObject(value, key));
  //         } else {
  //           parentFields[key] = value;
  //         }
  //       }
  //     });

  //     Object.entries(data).forEach(([key, value]) => {
  //       if (!Array.isArray(value)) return;

  //       if (
  //         value.every(
  //           (item) =>
  //             typeof item === "object" && item !== null && !Array.isArray(item),
  //         )
  //       ) {
  //         value.forEach((item) => {
  //           rows.push({
  //             ...parentFields,
  //             ...flattenObject(item),
  //           });
  //         });
  //       }
  //     });

  //     return rows.length ? rows : [flattenObject(data)];
  //   }

  //   return [];
  // };

  // export const downloadCsv = ({ data, fileName = "report" }) => {
  //   const normalizedRows = normalizeRows(data);

  //   if (!normalizedRows.length) return false;

  //   const headers = [
  //     ...new Set(normalizedRows.flatMap((row) => Object.keys(row))),
  //   ].filter((header) => !isExcludedHeader(header));

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
