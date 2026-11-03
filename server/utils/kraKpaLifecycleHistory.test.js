const test = require("node:test");
const assert = require("node:assert/strict");
const { buildKpaApprovalUpdate, buildLifecycleHistoryEntry } = require("./kraKpaLifecycleHistory");

for (const status of ["Approved", "Rejected"]) {
  test(`${status} is saved atomically with one history event and the same actor/time`, () => {
    const at = new Date("2026-10-27T08:00:00Z");
    const update = buildKpaApprovalUpdate(status, "hr-user", at);
    assert.equal(update.$set.approvalStatus, status);
    assert.equal(update.$set[status === "Approved" ? "approvedBy" : "rejectedBy"], "hr-user");
    assert.equal(update.$set[status === "Approved" ? "approvedAt" : "rejectedAt"], at);
    assert.equal(update.$push.editHistory.editedBy, "hr-user");
    assert.equal(update.$push.editHistory.editedAt, at);
    assert.deepEqual(update.$push.editHistory.changes, [{ field: "approvalStatus", label: "Approval Status", oldValue: "Pending Approval", newValue: status }]);
  });
}

test("invalid decisions cannot produce a database update", () => {
  assert.throws(() => buildKpaApprovalUpdate("Pending", "user", new Date()));
});

test("manual due-task completion has one status row, not a derived closure-date change", () => {
  const event = buildLifecycleHistoryEntry({ user: "lead", at: new Date(), field: "status", label: "Task Status", oldValue: "Pending", newValue: "Closed" });
  assert.equal(event.changes.length, 1);
  assert.equal(event.editedBy, "lead");
  assert.equal(event.changes[0].field, "status");
});
