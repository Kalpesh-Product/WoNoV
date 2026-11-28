const round = (value) => Number(value.toFixed(2));

const getCreditOverage = (record, monthStart, creditsUsed) => {
  const month = record.meetingCreditBalanceHistory.find(
    (entry) => Math.abs(new Date(entry.monthStartDate) - monthStart) <= 12 * 3600000,
  );
  return round(Math.max(creditsUsed - Math.max(Number(month?.remainingCredit ?? 0), 0), 0));
};

const getOveragePayment = (room, overages) => {
  const overageCredits = round(overages.reduce((total, entry) => total + entry.credits, 0));
  if (!overageCredits) return { creditsExceeded: false, creditOverages: [], overageCredits: 0 };
  const paymentBaseAmount = round(overageCredits * (room.perHourPrice || 0) / room.perHourCredit);
  const paymentGstAmount = round(paymentBaseAmount * 0.18);
  return {
    creditsExceeded: true,
    creditOverages: overages,
    overageCredits,
    paymentBaseAmount,
    paymentGstAmount,
    paymentAmount: round(paymentBaseAmount + paymentGstAmount),
  };
};

// Allocate in cents so per-meeting payments sum to the recorded batch amount.
const allocateOveragePayment = (meetings, base, discount, gst) => {
  const taxable = base - discount;
  let cumulativeBase = 0;
  let allocatedDiscount = 0;
  let allocatedGst = 0;

  return meetings.map(({ paymentBaseAmount, paymentGstAmount }) => {
    const meetingBase = Math.round(paymentBaseAmount * 100);
    cumulativeBase += meetingBase;
    const cumulativeDiscount = base ? Math.round(discount * cumulativeBase / base) : 0;
    const meetingDiscount = cumulativeDiscount - allocatedDiscount;
    allocatedDiscount = cumulativeDiscount;
    const cumulativeGst = taxable ? Math.round(gst * (cumulativeBase - cumulativeDiscount) / taxable) : 0;
    const meetingGst = discount ? cumulativeGst - allocatedGst : Math.round(paymentGstAmount * 100);
    allocatedGst += meetingGst;

    return {
      discountAmount: meetingDiscount / 100,
      paymentGstAmount: meetingGst / 100,
      paymentAmount: (meetingBase - meetingDiscount + meetingGst) / 100,
    };
  });
};

module.exports = { getCreditOverage, getOveragePayment, allocateOveragePayment };
