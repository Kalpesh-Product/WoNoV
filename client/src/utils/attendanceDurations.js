export const getAttendanceDurations = (inTime, outTime, breaks = [], now = Date.now()) => {
  const start = new Date(inTime).getTime();
  const end = outTime ? new Date(outTime).getTime() : new Date(now).getTime();
  if (!inTime || !Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return { workSeconds: 0, breakSeconds: 0, isOnBreak: false };
  }
  let isOnBreak = false;
  const intervals = (breaks || []).flatMap((brk) => {
    const breakStart = new Date(brk.startBreak || brk.start).getTime();
    const rawEnd = brk.endBreak || brk.end;
    const breakEnd = rawEnd ? new Date(rawEnd).getTime() : end;
    // Only breaks belonging to this attendance session can contribute.
    if (!Number.isFinite(breakStart) || !Number.isFinite(breakEnd) || breakStart < start || breakStart > end || breakEnd < breakStart) return [];
    if (!rawEnd && !outTime) isOnBreak = true;
    return [[breakStart, Math.min(breakEnd, end)]];
  }).sort((a, b) => a[0] - b[0]);
  let breakMs = 0;
  let previousEnd = start;
  for (const [breakStart, breakEnd] of intervals) {
    breakMs += Math.max(0, breakEnd - Math.max(breakStart, previousEnd));
    previousEnd = Math.max(previousEnd, breakEnd);
  }
  return {
    workSeconds: Math.max(0, Math.floor((end - start - breakMs) / 1000)),
    breakSeconds: Math.floor(breakMs / 1000),
    isOnBreak,
  };
};
