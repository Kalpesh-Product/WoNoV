// Keep the department-array response shape used by meeting details and calendars.
const getMeetingDepartments = (meeting) => {
  const clientName = String(meeting?.client?.clientName || "").trim().toLowerCase();
  if (meeting?.meetingType === "Internal" && clientName === "wono") {
    return [{ name: "Tech" }];
  }

  return meeting?.bookedBy?.departments || [];
};

module.exports = { getMeetingDepartments };
