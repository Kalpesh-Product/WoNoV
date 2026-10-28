import dayjs from "dayjs";

// Keep row identity independent of API object references and toolbar renders.
export const getPerformanceRowId = ({ data }) => String(data._id);

export const isDueTaskOverdue = (record, today = dayjs()) =>
  Boolean(record?.deadline && dayjs(record.deadline).isValid() &&
    dayjs(record.deadline).isBefore(today, "day"));

export const isDueTaskRowSelectable = ({ data }) =>
  Boolean(data && data.status !== "Closed" && !data.isAddedToDailyLogs &&
    data.deadline && dayjs(data.deadline).isValid());

