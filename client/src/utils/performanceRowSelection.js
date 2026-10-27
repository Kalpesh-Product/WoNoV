import dayjs from "dayjs";

// Keep row identity independent of API object references and toolbar renders.
export const getPerformanceRowId = ({ data }) => String(data._id);

export const isDueTaskOverdue = (record, today = dayjs()) =>
  Boolean(record?.deadline && dayjs(record.deadline).isValid() &&
    dayjs(record.deadline).isBefore(today, "day"));

export const isDueTaskRowSelectable = ({ data }) =>
  Boolean(data) && !isDueTaskOverdue(data);

export const getDueTaskCheckboxTooltip = (record, canEditDeadline) => {
  if (!isDueTaskOverdue(record)) return "";
  return canEditDeadline
    ? "Update deadline to add to Daily Logs."
    : "Ask your manager to update the deadline.";
};
