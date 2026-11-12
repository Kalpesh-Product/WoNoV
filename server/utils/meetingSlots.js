const getMeetingSlots = (meeting) =>
  Array.isArray(meeting?.bookingSlots) && meeting.bookingSlots.length
    ? meeting.bookingSlots
    : [{ startTime: meeting.startTime, endTime: meeting.endTime }];

const meetingOverlaps = (meeting, start, end) =>
  getMeetingSlots(meeting).some((slot) => {
    const slotEnd = meeting.bookingSlots?.length
      ? new Date(slot.endTime)
      : meeting.extendTime && new Date(meeting.extendTime) > new Date(slot.endTime)
        ? new Date(meeting.extendTime)
        : new Date(slot.endTime);
    return new Date(slot.startTime) < end && slotEnd > start;
  });

const meetingOverlapFilter = (start, end) => ({
  $or: [
    { bookingSlots: { $elemMatch: { startTime: { $lt: end }, endTime: { $gt: start } } } },
    {
      bookingSlots: { $exists: false },
      startTime: { $lt: end },
      $expr: { $gt: [{ $max: ["$endTime", "$extendTime"] }, start] },
    },
    {
      bookingSlots: { $size: 0 },
      startTime: { $lt: end },
      $expr: { $gt: [{ $max: ["$endTime", "$extendTime"] }, start] },
    },
  ],
});

const getMeetingDurationHours = (meeting) =>
  getMeetingSlots(meeting).reduce(
    (total, slot) => total + (new Date(slot.endTime) - new Date(slot.startTime)) / 3600000,
    0,
  );

module.exports = { getMeetingSlots, meetingOverlaps, meetingOverlapFilter, getMeetingDurationHours };
