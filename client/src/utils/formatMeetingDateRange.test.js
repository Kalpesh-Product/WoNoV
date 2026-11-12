import assert from "node:assert/strict";
import test from "node:test";
import { formatMeetingDateRange } from "./formatMeetingDateRange.js";

test("repeats the date for a single-day meeting", () => {
  assert.equal(
    formatMeetingDateRange({ startDate: "2026-11-12", endDate: "2026-11-12" }),
    "12-11-2026 to 12-11-2026",
  );
});

test("shows the full span for a multi-day booking", () => {
  assert.equal(
    formatMeetingDateRange({ startDate: "2026-11-12", endDate: "2026-12-18" }),
    "12-11-2026 to 18-12-2026",
  );
});

test("falls back to booking slots when date fields are absent", () => {
  assert.equal(
    formatMeetingDateRange({ bookingSlots: [
      { date: "2026-11-12" },
      { date: "2026-11-16" },
    ] }),
    "12-11-2026 to 16-11-2026",
  );
});
