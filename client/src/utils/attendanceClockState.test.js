import test from "node:test";
import assert from "node:assert/strict";
import { getAttendanceClockState } from "./attendanceClockState.js";

for (const day of [19, 21]) {
  test(`October ${day}: an open attendance restores clocked-in state`, () => {
    const state = getAttendanceClockState({
      inTime: `2026-10-${day}T04:34:00Z`,
    }, `2026-10-${day}T07:00:00Z`);
    assert.equal(state.hasClockedIn, true);
    assert.equal(state.isToday, true);
    assert.equal(state.isCurrentSession, true);
    assert.equal(state.needsClockOutCorrection, false);
  });
}

test("a completed session stays clocked out", () => {
  const state = getAttendanceClockState({
    inTime: "2026-10-19T04:34:00Z", outTime: "2026-10-19T12:30:00Z",
  }, "2026-10-19T13:00:00Z");
  assert.equal(state.hasClockedIn, false);
  assert.equal(state.isToday, true);
});

test("a missed previous clock-out requires correction, not a current-day timer", () => {
  const state = getAttendanceClockState({ inTime: "2026-10-19T04:34:00Z" }, "2026-10-20T07:00:00Z");
  assert.equal(state.hasClockedIn, true);
  assert.equal(state.isCurrentSession, false);
  assert.equal(state.needsClockOutCorrection, true);
});

test("a submitted clock-out correction does not reactivate the old session", () => {
  const state = getAttendanceClockState({
    inTime: "2026-10-19T04:34:00Z", hasPendingClockOutCorrection: true,
  }, "2026-10-20T07:00:00Z");
  assert.equal(state.hasClockedIn, false);
  assert.equal(state.needsClockOutCorrection, false);
});

test("day changes use India time rather than UTC or the browser timezone", () => {
  const state = getAttendanceClockState({ inTime: "2026-10-18T19:00:00Z" }, "2026-10-19T04:00:00Z");
  assert.equal(state.isToday, true);
});

test("an overnight shift stays current until its scheduled end", () => {
  const state = getAttendanceClockState({
    inTime: "2026-10-19T16:30:00Z",
    shiftSnapshot: { endTime: "2026-10-20T02:30:00Z" },
  }, "2026-10-20T01:30:00Z");
  assert.equal(state.isToday, false);
  assert.equal(state.isCurrentSession, true);
  assert.equal(state.needsClockOutCorrection, false);
});

test("missing or invalid attendance never shows an active session", () => {
  for (const record of [null, undefined, {}, { inTime: "invalid" }]) {
    const state = getAttendanceClockState(record);
    assert.equal(state.hasClockedIn, false);
    assert.equal(state.isToday, false);
  }
});
