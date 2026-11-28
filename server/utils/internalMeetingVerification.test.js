const test = require("node:test");
const assert = require("node:assert/strict");
const {
  canAdvanceVerification,
  canVerifyInternalMeetingPayment,
} = require("./internalMeetingVerification");

test("internal overages must be reviewed and verified before completion", () => {
  assert.equal(canAdvanceVerification("Pending", "Under Review"), true);
  assert.equal(canAdvanceVerification("Under Review", "Verified"), true);
  assert.equal(canAdvanceVerification("Verified", "Completed"), true);
  assert.equal(canAdvanceVerification("Pending", "Verified"), false);
  assert.equal(canAdvanceVerification("Under Review", "Completed"), false);
  assert.equal(canAdvanceVerification("Completed", "Under Review"), false);
});

test("verification access is limited to Finance and administrator roles", () => {
  assert.equal(canVerifyInternalMeetingPayment([{ name: "Finance" }], []), true);
  assert.equal(canVerifyInternalMeetingPayment([], ["Super Admin"]), true);
  assert.equal(canVerifyInternalMeetingPayment([], ["Master Admin"]), true);
  assert.equal(canVerifyInternalMeetingPayment([{ name: "Administration" }], []), false);
});
