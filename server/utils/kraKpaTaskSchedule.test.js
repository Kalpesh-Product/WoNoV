const test = require("node:test");
const assert = require("node:assert/strict");
const { validateTaskSchedule, isOverdueSchedule } = require("./kraKpaTaskSchedule");

const now = new Date("2026-10-19T06:00:00Z");
const tasks = (...deadlines) => deadlines.map((deadline) => ({ deadline }));

test("overdue tasks cannot be scheduled today or in the future", () => {
  const overdue = tasks("2026-10-17");
  assert.match(validateTaskSchedule("2026-10-19", overdue, now), /Overdue/);
  assert.match(validateTaskSchedule("2026-10-25", overdue, now), /Overdue/);
  assert.match(validateTaskSchedule("2026-10-18", overdue, now), /past/);
  assert.equal(isOverdueSchedule("2026-10-25", overdue[0].deadline), true);
});

test("non-overdue deadlines still limit scheduling, including mixed selections", () => {
  const mixed = tasks("2026-10-17", "2026-10-22", "2026-10-24");
  assert.match(validateTaskSchedule("2026-10-22", mixed, now), /Overdue/);
  const upcoming = tasks("2026-10-22", "2026-10-24");
  assert.equal(validateTaskSchedule("2026-10-22", upcoming, now), null);
  assert.match(validateTaskSchedule("2026-10-23", upcoming, now), /deadline/);
  assert.equal(validateTaskSchedule("2026-10-19", tasks("2026-10-19"), now), null);
  assert.match(validateTaskSchedule("2026-10-20", tasks("2026-10-19"), now), /deadline/);
  assert.equal(isOverdueSchedule("2026-10-22", "2026-10-22"), false);
});

test("missing deadlines and invalid dates are rejected", () => {
  assert.match(validateTaskSchedule("2026-10-19", tasks(null), now), /deadline/);
  assert.match(validateTaskSchedule("invalid", tasks("2026-10-20"), now), /valid/);
});

test("past-date validation uses the Indian calendar date at midnight", () => {
  const midnight = new Date("2026-10-18T18:31:00Z");
  assert.match(validateTaskSchedule("2026-10-18", tasks("2026-10-17"), midnight), /past/);
  assert.match(validateTaskSchedule("2026-10-19", tasks("2026-10-18"), midnight), /Overdue/);
  assert.equal(validateTaskSchedule("2026-10-19", tasks("2026-10-19"), midnight), null);
});
