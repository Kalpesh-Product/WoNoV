const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
});

export const getAttendanceClockState = (record, now = new Date()) => {
  const start = record?.inTime && new Date(record.inTime);
  const validStart = Boolean(start && Number.isFinite(start.getTime()));
  const isToday = validStart && dayFormatter.format(start) === dayFormatter.format(new Date(now));
  const shiftEnd = new Date(record?.shiftSnapshot?.endTime);
  const hasPendingCorrection = Boolean(record?.hasPendingClockOutCorrection);
  const hasClockedIn = validStart && !record.outTime && !hasPendingCorrection;
  // An overnight shift can still be current after the calendar date changes.
  const isCurrentSession = isToday || Boolean(hasClockedIn && shiftEnd >= new Date(now));
  return {
    isToday,
    isCurrentSession,
    hasClockedIn,
    hasPendingCorrection,
    needsClockOutCorrection: hasClockedIn && !isCurrentSession,
  };
};
