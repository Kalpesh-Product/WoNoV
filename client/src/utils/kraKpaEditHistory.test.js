import test from "node:test";
import assert from "node:assert/strict";
import { getKraKpaEditHistory } from "./kraKpaEditHistory.js";

const creator = { _id: "employee", firstName: "Employee" };
const manager = { _id: "manager", firstName: "Manager" };
const createdAt = "2026-10-19T08:00:00Z";
const completedAt = "2026-10-21T08:00:00Z";
const record = { createdAt, createdBy: creator };
const changes = (history, field) => history.flatMap((entry) => entry.changes.filter((change) => change.field === field).map((change) => ({ ...entry, change })));

test("creation is visible even when there have been no subsequent edits", () => {
  const result = getKraKpaEditHistory(record, "kpa");
  assert.equal(result.length, 1);
  assert.equal(result[0].editedAt, createdAt);
  assert.equal(result[0].editedBy, creator);
  assert.equal(result[0].changes[0].label, "Created");
  assert.deepEqual(getKraKpaEditHistory(null), []);
});

test("KPA completion history keeps each real completion and its actor", () => {
  const result = getKraKpaEditHistory({ ...record, completionHistory: [
    { completedAt, completedBy: creator },
    { completedAt: "2026-10-22T08:00:00Z", completedBy: creator },
  ] }, "kpa");
  const completed = changes(result, "status");
  assert.equal(completed.length, 2);
  assert.ok(completed.every((entry) => entry.editedBy === creator && entry.change.newValue === "Completed"));
});

test("persisted completion events are not duplicated by retained metadata", () => {
  const editHistory = [{ editedAt: completedAt, editedBy: creator, changes: [{ field: "status", label: "KPA Status", oldValue: "Pending", newValue: "Completed" }] }];
  const result = getKraKpaEditHistory({ ...record, editHistory, completionHistory: [{ completedAt, completedBy: creator }] }, "kpa");
  assert.equal(changes(result, "status").length, 1);
  assert.equal(editHistory.length, 1, "Do not mutate API data");
});

test("daily-log completion timestamps differing by milliseconds do not create duplicate rows", () => {
  const result = getKraKpaEditHistory({ ...record, completedAt, editHistory: [{
    editedAt: "2026-10-21T08:00:00.003Z", editedBy: creator,
    changes: [{ field: "status", newValue: "Done" }],
  }] });
  assert.equal(changes(result, "status").length, 1);
});

test("approval decisions preserve their recorded approver and rejector", () => {
  const result = getKraKpaEditHistory({ ...record, approvedBy: manager, approvedAt: completedAt, rejectedBy: manager, rejectedAt: "2026-10-22T08:00:00Z" }, "kpa");
  const decisions = changes(result, "approvalStatus");
  assert.deepEqual(decisions.map((entry) => entry.change.newValue), ["Approved", "Rejected"]);
  assert.ok(decisions.every((entry) => entry.editedBy === manager));
});

test("auto-approved creation does not invent a separate approval action", () => {
  const result = getKraKpaEditHistory({ ...record, approvedBy: creator, approvedAt: createdAt }, "kpa");
  assert.equal(changes(result, "approvalStatus").length, 0);
});

test("an explicitly recorded approval by the creator remains visible without a duplicate", () => {
  const result = getKraKpaEditHistory({ ...record, approvedBy: creator, approvedAt: completedAt, editHistory: [{
    editedAt: completedAt, editedBy: creator, changes: [{ field: "approvalStatus", newValue: "Approved" }],
  }] }, "kpa");
  assert.equal(changes(result, "approvalStatus").length, 1);
});

test("Self KRA completion metadata uses the original creation and actual completing lead", () => {
  const result = getKraKpaEditHistory({ ...record, completedAt, completedBy: manager, completionHistory: [{ completedAt, completedBy: manager }] }, "kra");
  assert.equal(changes(result, "created")[0].editedAt, createdAt);
  const completed = changes(result, "status");
  assert.equal(completed.length, 1);
  assert.equal(completed[0].editedBy, manager);
  assert.equal(completed[0].change.label, "KRA Status");
});

test("unknown historical completion actors are not attributed to the latest editor", () => {
  const result = getKraKpaEditHistory({ ...record, status: "Completed", closingDate: completedAt, updatedBy: manager }, "kpa");
  assert.equal(changes(result, "status")[0].editedBy, null);
});

test("generated KPA log mirrors do not invent manual creation or completion events", () => {
  assert.deepEqual(getKraKpaEditHistory({ ...record, sourceSelfKpa: "parent", completedAt }), []);
});

for (const kind of ["task", "kra", "kpa"]) {
  test(`${kind}: creation comes first and edits, approval and completion follow oldest first`, () => {
    const editHistory = [
      { editedAt: "2026-10-23T08:00:00Z", changes: [{ field: "title", newValue: "Latest edit" }] },
      { editedAt: "2026-10-20T08:00:00Z", changes: [{ field: "title", newValue: "First edit" }] },
    ];
    const original = structuredClone(editHistory);
    const result = getKraKpaEditHistory({ ...record, editHistory, completedAt,
      approvedAt: "2026-10-22T08:00:00Z", approvedBy: manager }, kind);
    assert.equal(result[0].changes[0].field, "created");
    assert.deepEqual(result.map((entry) => entry.editedAt), [createdAt,
      "2026-10-20T08:00:00Z", completedAt, "2026-10-22T08:00:00Z", "2026-10-23T08:00:00Z"]);
    assert.deepEqual(editHistory, original);
  });
}

test("creation precedes other changes recorded at the same timestamp", () => {
  const result = getKraKpaEditHistory({ ...record, editHistory: [
    { editedAt: createdAt, changes: [{ field: "approvalStatus", newValue: "Approved" }] },
  ] });
  assert.equal(result[0].changes[0].field, "created");
  assert.equal(result[1].changes[0].field, "approvalStatus");
});

test("KPA history hides rating dates but retains ratings and other date changes", () => {
  const editHistory = [{ editedAt: completedAt, changes: [
    { field: "managerRatingDate", newValue: completedAt },
    { field: "hrRatingDate", newValue: completedAt },
    { field: "kpaRating", newValue: 4 },
    { field: "hrRating", newValue: 5 },
    { field: "verificationClosedDate", newValue: completedAt },
  ] }];
  const original = structuredClone(editHistory);
  const result = getKraKpaEditHistory({ editHistory }, "kpa");
  assert.deepEqual(result[0].changes.map((change) => change.field), ["kpaRating", "hrRating", "verificationClosedDate"]);
  assert.deepEqual(editHistory, original, "Stored history is not modified");
  assert.equal(getKraKpaEditHistory({ editHistory }, "kra")[0].changes.length, 5);
});

test("KPA rating-date-only entries leave no blank rows", () => {
  assert.deepEqual(getKraKpaEditHistory({ editHistory: [{ editedAt: completedAt, changes: [
    { field: "managerRatingDate", newValue: completedAt },
    { field: "hrRatingDate", newValue: completedAt },
  ] }] }, "kpa"), []);
});
