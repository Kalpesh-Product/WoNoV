const normalizeStatus = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

export const hasValidMeetingExtension = (meeting) => {
  const endTime = new Date(meeting?.endTime).getTime();
  const extendTime = new Date(meeting?.extendTime).getTime();

  return (
    !Number.isNaN(endTime) &&
    !Number.isNaN(extendTime) &&
    extendTime > endTime
  );
};

export const getMeetingDisplayStatus = (meeting) => {
  const rawStatus = meeting?.meetingStatus || meeting?.status || "";
  const normalizedStatus = normalizeStatus(rawStatus);

  if (normalizedStatus === "cancelled" || normalizedStatus === "canceled") {
    return "Cancelled";
  }

  if (normalizedStatus === "completed") return "Completed";
  if (hasValidMeetingExtension(meeting)) return "Extended";

  return rawStatus || "-";
};

export const getNormalizedMeetingDisplayStatus = (meeting) =>
  normalizeStatus(getMeetingDisplayStatus(meeting));
