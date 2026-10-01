const getPayrollDays = (scheduledWorkingDays, lossOfPayDays = 0) => {
  const working = Number(scheduledWorkingDays);
  const lop = Number(lossOfPayDays);
  if (scheduledWorkingDays == null || scheduledWorkingDays === "" || !Number.isFinite(working) || working < 0) {
    const error = new Error("Payroll working days are missing or invalid. Review attendance and recreate the unprocessed payroll draft; for processed payroll, contact the administrator.");
    error.statusCode = 400;
    throw error;
  }
  if (!Number.isFinite(lop) || lop < 0 || lop > working) {
    const error = new Error("LOP days must be between zero and scheduled working days");
    error.statusCode = 400;
    throw error;
  }
  return { scheduledWorkingDays: working, lossOfPayDays: lop, paidDays: Number((working - lop).toFixed(2)) };
};
module.exports = { getPayrollDays };
