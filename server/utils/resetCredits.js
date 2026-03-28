const resetMeetingCreditsIfNeeded = async (BookingModel, clientId, targetDate = new Date()) => {
  const record = await BookingModel.findById(clientId);

  if (!record) return null;

  const now = new Date();
  const targetMonthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  const nowMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let isModified = false;

  // 1. Ensure history entry exists for the target date (e.g. for future booking)
  if (Array.isArray(record.meetingCreditBalanceHistory)) {
    const targetMonthIndex = record.meetingCreditBalanceHistory.findIndex((entry) => {
      if (!entry?.monthStartDate) return false;
      const d = new Date(entry.monthStartDate);
      return (
        d.getFullYear() === targetMonthStart.getFullYear() &&
        d.getMonth() === targetMonthStart.getMonth()
      );
    });

    if (targetMonthIndex === -1) {
      const isCurrentMonth =
        targetMonthStart.getFullYear() === nowMonthStart.getFullYear() &&
        targetMonthStart.getMonth() === nowMonthStart.getMonth();

      let initialRemaining = Number(record.totalMeetingCredits || 0);
      let initialConsumed = 0;

      // Migration Safety: If this is the first time we're creating a history entry 
      // for the CURRENT month, preserve the existing top-level balance.
      if (isCurrentMonth && record.meetingCreditBalance !== undefined) {
        initialRemaining = Number(record.meetingCreditBalance);
        initialConsumed = Math.max(Number(record.totalMeetingCredits || 0) - initialRemaining, 0);
      }

      record.meetingCreditBalanceHistory.push({
        monthStartDate: targetMonthStart,
        remainingCredit: initialRemaining,
        consumedCredit: initialConsumed,
      });
      isModified = true;
    }
  }

  // 2. Automated Month-Start Reset for the CURRENT/REAL-WORLD month
  const lastReset = record.lastCreditReset ? new Date(record.lastCreditReset) : null;
  const isNewRealWorldMonth =
    !lastReset ||
    now.getFullYear() !== lastReset.getFullYear() ||
    now.getMonth() !== lastReset.getMonth();

  if (isNewRealWorldMonth) {
    const monthlyCredit = Number(record.totalMeetingCredits || 0);

    // Find the entry for THIS real-world month
    const currentMonthIndex = record.meetingCreditBalanceHistory.findIndex((entry) => {
      if (!entry?.monthStartDate) return false;
      const d = new Date(entry.monthStartDate);
      return (
        d.getFullYear() === nowMonthStart.getFullYear() &&
        d.getMonth() === nowMonthStart.getMonth()
      );
    });

    if (currentMonthIndex >= 0) {
      // If it exists (e.g. from a future booking made previously), sync current balance
      record.meetingCreditBalance = record.meetingCreditBalanceHistory[currentMonthIndex].remainingCredit;
    } else {
      // Create new entry and set balance
      record.meetingCreditBalance = monthlyCredit;
      record.meetingCreditBalanceHistory.push({
        monthStartDate: nowMonthStart,
        remainingCredit: monthlyCredit,
        consumedCredit: 0,
      });
    }

    record.lastCreditReset = now;
    isModified = true;
  }

  if (isModified) {
    await record.save();
  }

  return record;
};

module.exports = { resetMeetingCreditsIfNeeded };