const assert = require("node:assert/strict");
const test = require("node:test");
const { getCreditOverage, getOveragePayment, allocateOveragePayment } = require("./meetingCreditOverage");

const november = new Date("2026-11-01T00:00:00Z");
const december = new Date("2026-12-01T00:00:00Z");
const room = { perHourPrice: 1000, perHourCredit: 5 };

test("charges two credits when a five-credit meeting has three credits available", () => {
  const record = {
    meetingCreditBalanceHistory: [{ monthStartDate: november, remainingCredit: 3 }],
  };
  const credits = getCreditOverage(record, november, 5);
  const payment = getOveragePayment(room, [{ monthStart: november, credits }]);

  assert.equal(payment.creditsExceeded, true);
  assert.equal(payment.overageCredits, 2);
  assert.equal(payment.paymentBaseAmount, 400);
  assert.equal(payment.paymentGstAmount, 72);
  assert.equal(payment.paymentAmount, 472);
});

test("excludes an earlier deficit and keeps overages tied to their booking months", () => {
  const record = {
    meetingCreditBalanceHistory: [
      { monthStartDate: november, remainingCredit: -2 },
      { monthStartDate: december, remainingCredit: 4 },
    ],
  };
  const overages = [
    { monthStart: november, credits: getCreditOverage(record, november, 3) },
    { monthStart: december, credits: getCreditOverage(record, december, 5) },
  ];
  const payment = getOveragePayment(room, overages);

  assert.equal(payment.overageCredits, 4);
  assert.deepEqual(payment.creditOverages, [
    { monthStart: november, credits: 3 },
    { monthStart: december, credits: 1 },
  ]);
});

test("leaves payment amounts unset when the booking is fully covered", () => {
  const record = {
    meetingCreditBalanceHistory: [{ monthStartDate: november, remainingCredit: 5 }],
  };
  assert.equal(getCreditOverage(record, november, 5), 0);
  const payment = getOveragePayment(room, []);
  assert.equal(payment.creditsExceeded, false);
  assert.equal(payment.paymentAmount, undefined);
});

test("preserves stored GST when combining overages without a discount", () => {
  const meetings = [
    { paymentBaseAmount: 0.03, paymentGstAmount: 0.01 },
    { paymentBaseAmount: 0.03, paymentGstAmount: 0.01 },
  ];

  assert.deepEqual(allocateOveragePayment(meetings, 6, 0, 2), [
    { discountAmount: 0, paymentGstAmount: 0.01, paymentAmount: 0.04 },
    { discountAmount: 0, paymentGstAmount: 0.01, paymentAmount: 0.04 },
  ]);
});

test("allocates a batch discount and GST without losing a cent", () => {
  const meetings = [
    { paymentBaseAmount: 1.01 },
    { paymentBaseAmount: 1.01 },
    { paymentBaseAmount: 1.01 },
  ];
  const amounts = allocateOveragePayment(meetings, 303, 2, 54);
  const sumCents = (field) => amounts.reduce((sum, row) => sum + Math.round(row[field] * 100), 0);

  assert.equal(sumCents("discountAmount"), 2);
  assert.equal(sumCents("paymentGstAmount"), 54);
  assert.equal(sumCents("paymentAmount"), 355);
});
