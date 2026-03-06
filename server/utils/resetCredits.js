export const resetMeetingCreditsIfNeeded = async (BookingModel, clientId) => {
  const record = await BookingModel.findById(clientId);

  if (!record) return;

  const now = new Date();
  const lastReset = new Date(record.lastCreditReset);

  const isNewMonth =
    now.getFullYear() !== lastReset.getFullYear() ||
    now.getMonth() !== lastReset.getMonth();

  if (isNewMonth) {
    record.meetingCreditBalance = record.totalCreditBalance;
    record.lastCreditReset = now;
    await record.save();
  }

  return record;
};
