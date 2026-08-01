import dayjs from "dayjs";

export const toUtcDayBoundary = (value, useNextDay = false) => {
  const localDayStart = dayjs(value).startOf("day");
  const boundary = useNextDay
    ? localDayStart.add(1, "day")
    : localDayStart;

  return boundary.toDate().toISOString();
};

export const toLocalDayBoundary = (value, useNextDay = false) => {
  const localDayStart = dayjs(value).startOf("day");
  const boundary = useNextDay ? localDayStart.endOf("day") : localDayStart;

  return boundary.format("YYYY-MM-DDTHH:mm:ss.SSSZ");
};
