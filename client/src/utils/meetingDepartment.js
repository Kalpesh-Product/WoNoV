export const getMeetingDepartmentLabel = (meeting) => {
  const companyName = typeof meeting?.client === "string"
    ? meeting.client
    : meeting?.client?.clientName;
  if (String(companyName || "").trim().toLowerCase() === "wono") {
    return "Tech";
  }

  const departments = meeting?.department;
  if (Array.isArray(departments)) {
    return departments.map((dept) => typeof dept === "string" ? dept : dept?.name)
      .filter(Boolean).join(", ") || "Unknown";
  }
  return (typeof departments === "string" ? departments : departments?.name) || "Unknown";
};
