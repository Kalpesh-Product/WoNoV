import test from "node:test";
import assert from "node:assert/strict";
import dayjs from "dayjs";
import { getAttendanceRangeDays, getAttendanceRangeParams } from "./attendanceDateRange.js";
import { getCurrentMonthDateRange } from "./tableFilters.js";

const range = (start, end) => ({ startDate: dayjs(start).toDate(), endDate: dayjs(end).toDate() });

test("attendance defaults to the first and last day of the current month", () => {
  const days = getAttendanceRangeDays(getCurrentMonthDateRange(new Date(2026, 9, 26)));
  assert.equal(days.length, 31);
  assert.equal(days[0], "2026-10-01");
  assert.equal(days.at(-1), "2026-10-31");
});

test("partial attendance ranges include both endpoints and no other dates", () => {
  assert.deepEqual(getAttendanceRangeDays(range("2026-10-19", "2026-10-21")), ["2026-10-19", "2026-10-20", "2026-10-21"]);
  assert.deepEqual(getAttendanceRangeDays(range("2026-10-19", "2026-10-19")), ["2026-10-19"]);
});

test("cross-month and cross-year ranges have unique dates without day-number collisions", () => {
  assert.deepEqual(getAttendanceRangeDays(range("2026-10-31", "2026-11-02")), ["2026-10-31", "2026-11-01", "2026-11-02"]);
  assert.deepEqual(getAttendanceRangeDays(range("2026-12-31", "2027-01-01")), ["2026-12-31", "2027-01-01"]);
  assert.equal(getAttendanceRangeDays(range("2028-02-28", "2028-03-01")).length, 3);
});

test("attendance API receives the full selected days, not full-month boundaries", () => {
  const params = getAttendanceRangeParams(range("2026-10-19", "2026-11-02"));
  assert.equal(dayjs(params.startDate).format("YYYY-MM-DD HH:mm:ss.SSS"), "2026-10-19 00:00:00.000");
  assert.equal(dayjs(params.endDate).format("YYYY-MM-DD HH:mm:ss.SSS"), "2026-11-02 23:59:59.999");
});

test("missing, invalid and reversed attendance ranges are rejected", () => {
  assert.deepEqual(getAttendanceRangeDays(null), []);
  assert.deepEqual(getAttendanceRangeDays({ startDate: "invalid", endDate: "2026-10-21" }), []);
  assert.deepEqual(getAttendanceRangeDays(range("2026-10-21", "2026-10-19")), []);
});
