import test from "node:test";
import assert from "node:assert/strict";
import { getAttendanceDurations } from "./attendanceDurations.js";

test("reported example includes only the current attendance session's break", () => {
  const totals = getAttendanceDurations("2026-10-22T04:44:42.921Z", null, [
    { start: "2026-09-30T04:50:20.385Z", end: "2026-09-30T04:50:43.689Z" },
    { start: "2026-10-19T08:20:38.436Z", end: "2026-10-19T08:52:34.123Z" },
    { start: "2026-10-21T07:53:36.641Z", end: "2026-10-21T08:25:31.450Z" },
    { start: "2026-10-22T07:47:42.686Z", end: "2026-10-22T08:22:10.623Z" },
  ], "2026-10-22T08:30:00Z");
  assert.equal(totals.breakSeconds, 2067); // 34m 27s, not 1h 06m 22s.
  assert.equal(totals.workSeconds, 11449);
});

test("work timer pauses on an active break while break time keeps increasing", () => {
  const breaks = [{ startBreak: "2026-10-22T07:00:00Z", endBreak: null }];
  const first = getAttendanceDurations("2026-10-22T04:30:00Z", null, breaks, "2026-10-22T07:10:00Z");
  const later = getAttendanceDurations("2026-10-22T04:30:00Z", null, breaks, "2026-10-22T07:20:00Z");
  assert.equal(first.workSeconds, 9000);
  assert.equal(later.workSeconds, first.workSeconds);
  assert.equal(later.breakSeconds, 1200);
  assert.equal(later.isOnBreak, true);
});

test("work resumes after break, multiple breaks are summed, clock-out freezes totals", () => {
  const breaks = [
    { startBreak: "2026-10-22T07:00:00Z", endBreak: "2026-10-22T07:30:00Z" },
    { startBreak: "2026-10-22T09:00:00Z", endBreak: "2026-10-22T09:15:00Z" },
  ];
  const first = getAttendanceDurations("2026-10-22T04:30:00Z", "2026-10-22T12:30:00Z", breaks, "2026-10-22T13:00:00Z");
  const later = getAttendanceDurations("2026-10-22T04:30:00Z", "2026-10-22T12:30:00Z", breaks, "2026-10-23T13:00:00Z");
  assert.deepEqual(first, later);
  assert.equal(first.workSeconds, 26100);
  assert.equal(first.breakSeconds, 2700);
  assert.equal(first.isOnBreak, false);
});

test("overnight breaks belong to their session even after midnight", () => {
  const result = getAttendanceDurations("2026-10-22T18:00:00Z", "2026-10-23T03:00:00Z", [
    { start: "2026-10-23T00:00:00Z", end: "2026-10-23T00:30:00Z" },
  ]);
  assert.equal(result.breakSeconds, 1800);
  assert.equal(result.workSeconds, 30600);
});

test("missing clock-in returns zero; invalid and overlapping breaks cannot inflate totals", () => {
  assert.equal(getAttendanceDurations(null, null).workSeconds, 0);
  const result = getAttendanceDurations("2026-10-22T04:30:00Z", "2026-10-22T06:30:00Z", [
    { start: "invalid", end: "invalid" },
    { start: "2026-10-22T05:00:00Z", end: "2026-10-22T05:30:00Z" },
    { start: "2026-10-22T05:15:00Z", end: "2026-10-22T05:45:00Z" },
  ]);
  assert.equal(result.breakSeconds, 2700);
});
