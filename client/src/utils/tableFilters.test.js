import test from "node:test";
import assert from "node:assert/strict";
import { parseTableDate, getTableDateFields, filterTableRows, getCurrentMonthDateRange } from "./tableFilters.js";

const rows = [
  { name: "Attendance HR", status: "Active", updatedAt: "23-10-2026, 11:01 AM", updatedAtRaw: "2026-10-23T05:31:00Z" },
  { name: "Attendance Finance", status: "Inactive", updatedAt: "23-10-2026" },
  { name: "Employee HR", status: "Active", updatedAt: "22-10-2026" },
  { name: "No upload yet", status: "Active", updatedAt: "-" },
];
const dateRange = { startDate: new Date(2026, 9, 23), endDate: new Date(2026, 9, 23) };

test("a selected October range excludes September and July uploads", () => {
  const records = [
    { name: "Coworking Revenue", updatedAt: "21-09-2026, 03:58 PM", date: "01-09-2026, 05:49 PM" },
    { name: "Virtual Office Revenue", updatedAt: "13-08-2026, 12:20 PM", date: "03-07-2026, 11:07 AM" },
    { name: "October Upload", updatedAt: "23-10-2026, 09:00 AM", date: "22-10-2026, 03:00 PM" },
  ];
  const range = getCurrentMonthDateRange(new Date(2026, 9, 23));
  assert.equal(range.startDate.getDate(), 1);
  assert.equal(range.endDate.getDate(), 31);
  for (const dateField of ["updatedAt", "date"]) {
    assert.deepEqual(filterTableRows(records, { dateRange: range, dateField }), [records[2]]);
  }
  const september = { startDate: new Date(2026, 8, 1), endDate: new Date(2026, 8, 30) };
  assert.deepEqual(filterTableRows(records, { dateRange: september, dateField: "updatedAt" }), [records[0]]);
  assert.deepEqual(filterTableRows(records, { dateRange, dateField: "updatedAt" }), [records[2]]);
  assert.deepEqual(filterTableRows(records, { dateRange, dateField: "date" }), []);
});

test("all rows appear initially and clearing the chosen range restores them", () => {
  const initial = { dateRange: null, dateField: "updatedAt" };
  assert.deepEqual(filterTableRows(rows, initial), rows);
  assert.equal(filterTableRows(rows, { ...initial, dateRange }).length, 2);
  assert.deepEqual(filterTableRows(rows, initial), rows);
  assert.equal(filterTableRows(rows, { ...initial, search: "HR" }).length, 2);
});

test("SOP and Policy dates filter uploaded and modified timestamps independently", () => {
  const documents = [
    { name: "Uploaded in October", dateRaw: "2026-10-23T05:00:00Z", updatedAtRaw: "2026-11-02T05:00:00Z" },
    { name: "Modified in October", dateRaw: "2026-09-10T05:00:00Z", updatedAtRaw: "2026-10-23T05:00:00Z" },
    { name: "Missing dates", dateRaw: null, updatedAtRaw: null },
  ];
  assert.deepEqual(filterTableRows(documents, { dateRange: null, dateField: "date" }), documents);
  assert.deepEqual(filterTableRows(documents, { dateRange, dateField: "date" }), [documents[0]]);
  assert.deepEqual(filterTableRows(documents, { dateRange, dateField: "updatedAt" }), [documents[1]]);
  assert.deepEqual(filterTableRows(documents, { dateRange, dateField: "updatedAt", search: "modified" }), [documents[1]]);
});

test("search, advanced filter and date range are combined, not overwritten", () => {
  assert.deepEqual(filterTableRows(rows, { search: "attendance", filters: { status: "active", name: "HR" }, dateRange, dateField: "updatedAt" }), [rows[0]]);
});
test("a date range includes the entire end day and excludes missing dates only when active", () => {
  assert.equal(filterTableRows(rows).length, 4);
  assert.equal(filterTableRows(rows, { dateRange, dateField: "updatedAt" }).length, 2);
});
test("raw ISO timestamps take precedence over display values", () => {
  const row = { date: "-", dateRaw: "2026-10-23T05:31:00Z" };
  assert.deepEqual(filterTableRows([row], { dateRange, dateField: "date" }), [row]);
});
test("Indian day-first dates and displayed timestamps are parsed without US month/day reversal", () => {
  for (const value of ["23-10-2026", "23-10-2026, 11:01 AM", "23/10/2026", "23 Oct 2026"]) {
    assert.equal(parseTableDate(value).getMonth(), 9);
    assert.equal(parseTableDate(value).getDate(), 23);
  }
  assert.equal(parseTableDate("08-09-2026").getMonth(), 8);
});
test("IDs and invalid dates are not treated as calendar dates", () => {
  for (const value of [1694, "1234", "31-02-2026", "-", "N/A", null, undefined]) assert.equal(parseTableDate(value), null);
});
test("date selector lists real date columns and does not mistake candidate fields for dates", () => {
  const fields = getTableDateFields([{ field: "candidateName", headerName: "Candidate" }, { field: "updatedAt", headerName: "Uploaded Date" }, { field: "date", headerName: "Downloaded Date" }], rows);
  assert.deepEqual(fields.map((entry) => entry.field), ["updatedAt", "date"]);
  assert.deepEqual(getTableDateFields([{ field: "name" }], [{ name: "No date data" }]), []);
});
test("empty datasets and individual filter clearing are safe", () => {
  assert.deepEqual(filterTableRows([], { search: "HR" }), []);
  assert.equal(filterTableRows(rows, { search: "HR" }).length, 2);
  assert.equal(filterTableRows(rows, { filters: { name: "HR" }, dateRange, dateField: "updatedAt" }).length, 1);
});
