const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateDelayedWorkingDays } = require("./kraKpaDelayedDays");

test("excludes Sundays from delayed days", () => {
  assert.equal(
    calculateDelayedWorkingDays("2026-10-02", "2026-10-06"),
    3,
  );
});

test("excludes company holidays without counting a Sunday twice", () => {
  const holidays = [
    { start: "2026-10-04", end: "2026-10-04" },
    { start: "2026-10-05", end: "2026-10-05" },
  ];
  assert.equal(
    calculateDelayedWorkingDays("2026-10-02", "2026-10-06", holidays),
    2,
  );
});

test("returns zero when completed on or before the deadline", () => {
  assert.equal(calculateDelayedWorkingDays("2026-10-06", "2026-10-06"), 0);
  assert.equal(calculateDelayedWorkingDays("2026-10-06", "2026-10-05"), 0);
});
