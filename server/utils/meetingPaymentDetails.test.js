const test = require("node:test");
const assert = require("node:assert/strict");
const { getMeetingPaymentDetails } = require("./meetingPaymentDetails");

test("visitor and revenue views use the same meeting payment and invoice data", () => {
  const meeting = {
    paymentBaseAmount: 1, paymentGstAmount: 2, paymentAmount: 3,
    paymentStatus: true, paymentMode: "UPI", paymentVerification: "Completed",
    paymentProof: { link: "meeting-proof", name: "proof.pdf" },
  };
  const revenue = {
    date: "2099-01-01", paymentDate: "2099-01-02", hoursBooked: "2",
    costPerHour: 1000, taxable: 1800, gst: 324, totalAmount: 2124,
    remarks: "Discount applied", invoice: { link: "invoice", date: "2099-01-03" },
    invoiceUploadedBy: { firstName: "Test", lastName: "User" },
  };
  const visitorDetails = getMeetingPaymentDetails(revenue, meeting);
  assert.deepEqual(visitorDetails, getMeetingPaymentDetails({ ...revenue, meeting }));
  assert.equal(visitorDetails.taxable, 1800);
  assert.equal(visitorDetails.gst, 324);
  assert.equal(visitorDetails.totalAmount, 2124);
  assert.equal(visitorDetails.status, "Paid");
  assert.equal(visitorDetails.paymentProofLink, "meeting-proof");
  assert.equal(visitorDetails.invoiceLink, "invoice");
  assert.equal(visitorDetails.invoiceUploadedByName, "Test User");
  assert.equal(visitorDetails.financeStatus, "Upload Invoice");
});

test("linked meetings without revenue use meeting amounts, including zero", () => {
  const details = getMeetingPaymentDetails(null, {
    paymentBaseAmount: 0, paymentGstAmount: 0, paymentAmount: 0,
    paymentStatus: false, bookedRoom: { perHourPrice: 750 },
  });
  assert.equal(details.totalAmount, 0);
  assert.equal(details.status, "Unpaid");
  assert.equal(details.costPerHour, 750);
  assert.equal(details.invoiceLink, "");
  assert.equal(details.hoursBooked, null);
});

test("missing linked meeting does not fabricate day pass payment details", () => {
  assert.equal(getMeetingPaymentDetails(null, null), null);
  assert.equal(getMeetingPaymentDetails(null, "meeting-id"), null);
});

test("historical revenue retains the finance status used by revenue reports", () => {
  const details = getMeetingPaymentDetails({ date: "2000-01-01" }, { paymentStatus: "false" });
  assert.equal(details.financeStatus, "Verified");
  assert.equal(details.status, "Unpaid");
});


test("unpaid bookings show hours including extensions without revenue", () => {
  const meeting = { startTime: "2026-10-01T09:00:00Z", endTime: "2026-10-01T10:30:00Z", paymentStatus: false };
  assert.equal(getMeetingPaymentDetails(null, meeting).hoursBooked, 1.5);
  assert.equal(getMeetingPaymentDetails(null, { ...meeting, extendTime: "2026-10-01T11:00:00Z" }).hoursBooked, 2);
  assert.equal(getMeetingPaymentDetails(null, { ...meeting, extendTime: "invalid" }).hoursBooked, 1.5);
  assert.equal(getMeetingPaymentDetails({ hoursBooked: "3" }, meeting).hoursBooked, "3");
  assert.equal(getMeetingPaymentDetails(null, { ...meeting, startTime: "invalid" }).hoursBooked, null);
});
