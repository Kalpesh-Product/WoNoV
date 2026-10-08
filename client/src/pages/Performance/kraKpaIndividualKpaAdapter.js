export const toIndividualKpaTask = (record) => {
  const employee = record.employee || {};
  const name = [employee.firstName, employee.middleName, employee.lastName]
    .filter(Boolean)
    .join(" ");

  return {
    id: record._id,
    taskName: record.target,
    taskType: "INDIVIDUALKPA",
    assignedDate: `${record.month}-01T12:00:00.000Z`,
    dueDate: record.deadline,
    status: record.status,
    finalClosure:
      record.hrRating === null || record.hrRating === undefined
        ? "Pending"
        : "Closed",
    assignedTo: name,
    assignToId: employee._id,
    completedBy: name,
    completionDate: record.closingDate,
    comment: record.resourceComment,
    department: record.department,
  };
};

export const getFiscalMonthKey = (monthName, fiscalYear) => {
  const monthIndex = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ].findIndex((name) => name.toLowerCase() === String(monthName).toLowerCase());
  const startYear = Number(String(fiscalYear).match(/\d{4}/)?.[0]);
  if (monthIndex < 0 || !startYear) return null;
  const calendarYear = monthIndex >= 3 ? startYear : startYear + 1;
  return `${calendarYear}-${String(monthIndex + 1).padStart(2, "0")}`;
};

export const getCurrentFiscalYear = () => {
  const now = new Date();
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
};
