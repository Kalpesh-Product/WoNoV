import test from "node:test";
import assert from "node:assert/strict";
import { getMeetingDepartmentLabel } from "./meetingDepartment.js";

test("WoNo always displays Tech even with missing or stale department data", () => {
  for (const client of ["WoNo", " wono ", { clientName: "WONO" }]) {
    for (const department of [undefined, [], "Unknown", "Administration", [{ name: "Sales" }]]) {
      assert.equal(getMeetingDepartmentLabel({ client, department }), "Tech");
    }
  }
});

test("BIZNest preserves actual departments in array, object and string formats", () => {
  for (const department of [[{ name: "Sales" }], { name: "Sales" }, "Sales", ["Sales"]]) {
    assert.equal(getMeetingDepartmentLabel({ client: "BIZNest", department }), "Sales");
  }
  assert.equal(getMeetingDepartmentLabel({ client: "BIZNest", department: [{ name: "HR" }, { name: "Finance" }] }), "HR, Finance");
});

test("missing departments for other companies are not labelled Tech", () => {
  assert.equal(getMeetingDepartmentLabel({ client: "Another Company" }), "Unknown");
  assert.equal(getMeetingDepartmentLabel(null), "Unknown");
});
