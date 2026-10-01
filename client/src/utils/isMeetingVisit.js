export const isMeetingVisit = (visit = {}) => {
  const type = String(visit.visitorType || "").trim().toLowerCase();
  const purpose = String(visit.purposeOfVisit || "").trim().toLowerCase();
  return Boolean(visit.meeting) || type === "meeting" || purpose === "meeting room booking";
};
