import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat);

// Only meaningful, visible data fields belong in the advanced-filter drawer.
export const getAdvancedFilterColumns = (columns = []) => columns.filter((column) => {
  const field = String(column.field || "");
  const label = String(column.headerName || "");
  return field && !column.hide && column.filter !== false &&
    !/action|^_?id$|^mongoId$|^(?:srNo|sNo|serialNumber|index)$|Raw$/i.test(field) &&
    !/^(?:sr\.?\s*no\.?|s\.?\s*no\.?|serial\s*(?:number|no\.?))$/i.test(label.trim());
});

export const getCurrentMonthDateRange = (now = new Date()) => ({
  startDate: dayjs(now).startOf("month").toDate(),
  endDate: dayjs(now).endOf("month").toDate(),
  key: "selection",
});

export const parseTableDate = (value) => {
  if (value === null || value === undefined || value === "" || value === "-" || value === "N/A") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== "string") return null;
  const text = value.trim();
  const formats = ["DD-MM-YYYY", "DD-MM-YYYY, hh:mm A", "DD-MM-YYYY, h:mm A", "DD/MM/YYYY", "DD MMM YYYY", "DD MMM YYYY, hh:mm A", "DD-MM-YYYY, HH:mm", "YYYY-MM-DD"];
  for (const format of formats) {
    const parsed = dayjs(text, format, true);
    if (parsed.isValid()) return parsed.toDate();
  }
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
    const parsed = new Date(text);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
};

export const getTableDateFields = (columns = [], rows = [], dateColumn) => {
  const fields = columns.filter((column) => column.field && (
    column.field === dateColumn || /^(?:date|datetime)$|Date$|_date$|(?:created|updated|uploaded|downloaded|completed|submitted|approved|rejected)At$/.test(column.field) || /\bdate\b/i.test(column.headerName || "")
  )).map((column) => ({ field: column.field, label: column.headerName || column.field }));
  for (const field of [dateColumn, "createdAt", "updatedAt"]) {
    if (field && !fields.some((entry) => entry.field === field) && (field === dateColumn || rows.some((row) => row[field] !== undefined))) fields.push({ field, label: field });
  }
  return fields;
};

// Decide from the table's schema, not its current rows: empty dated lists still
// need their picker, while count summaries/directories do not gain one by default.
export const shouldShowTableDateFilter = (columns = [], dateColumn, showDateControls) =>
  showDateControls ?? (Boolean(dateColumn) || getTableDateFields(columns).length > 0);

export const filterTableRows = (rows = [], { search = "", filters = {}, dateRange, dateField } = {}) => rows.filter((row) => {
  const query = search.toLowerCase().trim();
  if (query && !Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(query))) return false;
  if (!Object.entries(filters).every(([field, value]) => !value || String(row[field] ?? "").toLowerCase().includes(String(value).toLowerCase()))) return false;
  if (!dateRange || !dateField) return true;
  const date = parseTableDate(row[`${dateField}Raw`] ?? row[dateField]);
  if (!date) return false;
  const start = dayjs(dateRange.startDate).startOf("day");
  const end = dayjs(dateRange.endDate).endOf("day");
  return date.getTime() >= start.valueOf() && date.getTime() <= end.valueOf();
});
