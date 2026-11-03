const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateDelayedWorkingDays, calculateDailyLogDelay } = require("./kraKpaDelayedDays");

test("pending Daily Log delay uses its deadline and excludes non-working days", () => {
  assert.equal(calculateDailyLogDelay(
    { deadline: "2026-10-02", status: "Due" },
    [{ start: "2026-10-05" }], "2026-10-06",
  ), 2);
});

test("completed Daily Log delay stops at completion rather than today", () => {
  assert.equal(calculateDailyLogDelay(
    { deadline: "2026-10-02", status: "Done", completedAt: "2026-10-06" },
    [], "2026-10-28",
  ), 3);
});

test("Daily Log delay falls back to source deadline, then scheduled log date", () => {
  assert.equal(calculateDailyLogDelay({ sourceDueTask: { deadline: "2026-10-02" } }, [], "2026-10-06"), 3);
  assert.equal(calculateDailyLogDelay({ sourceSelfKpa: { deadline: "2026-10-02" } }, [], "2026-10-06"), 3);
  assert.equal(calculateDailyLogDelay({ date: "2026-10-06" }, [], "2026-10-06"), 0);
  assert.equal(calculateDailyLogDelay({}, [], "2026-10-06"), 0);
});

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
