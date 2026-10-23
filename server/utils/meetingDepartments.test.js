const test = require("node:test");
const assert = require("node:assert/strict");
const { getMeetingDepartments } = require("./meetingDepartments");

test("BIZNest bookings show the booker's actual departments", () => {
  const departments = [{ _id: "sales", name: "Sales" }, { _id: "ops", name: "Operations" }];
  for (const client of [null, { clientName: "BIZNest", isHostCompany: true }]) {
    assert.deepEqual(getMeetingDepartments({
      meetingType: "Internal", client, bookedBy: { departments },
    }), departments);
  }
});

test("WoNo coworking-member bookings show Tech without a userdata booker", () => {
  for (const clientName of ["WoNo", "Wono", "WONO", " wono "]) {
    assert.deepEqual(getMeetingDepartments({
      meetingType: "Internal", client: { clientName },
      clientBookedBy: { employeeName: "Example Member" },
    }), [{ name: "Tech" }]);
  }
});

test("WoNo uses Tech rather than the booking facilitator's department", () => {
  assert.deepEqual(getMeetingDepartments({
    meetingType: "Internal", client: { clientName: "WoNo" },
    bookedBy: { departments: [{ name: "Administration" }] },
  }), [{ name: "Tech" }]);
});

test("other companies and external meetings are not labelled Tech", () => {
  for (const meeting of [
    { meetingType: "Internal", client: { clientName: "Other Company" } },
    { meetingType: "External", client: { clientName: "WoNo" } },
    null,
  ]) assert.deepEqual(getMeetingDepartments(meeting), []);
});
