import dayjs from "dayjs";

const dateKey = (value) => value && dayjs(value).isValid()
  ? dayjs(value).format("YYYY-MM-DD")
  : null;
const percent = (part, total) => total ? Math.round((part / total) * 100) : 0;
const isActiveKpa = (record) => record?.isActive !== false && record?.isDeleted !== true;

export const getTodayProgress = (logs, today) => {
  const todayLogs = logs.filter((log) => dateKey(log.date) === today);
  const completed = todayLogs.filter((log) => log.status === "Done").length;
  return {
    kraScheduled: todayLogs.filter((log) => log.type === "KRA").length,
    completed,
    pending: todayLogs.length - completed,
    carriedForward: todayLogs.filter((log) => log.isCarryForward).length,
    completion: percent(completed, todayLogs.length),
  };
};

export const getDailyScoreRows = (logs, today) => {
  const month = dayjs(today).startOf("month");
  const logsByDate = new Map();
  logs.forEach((log) => {
    const key = dateKey(log.date);
    if (!key?.startsWith(month.format("YYYY-MM"))) return;
    logsByDate.set(key, [...(logsByDate.get(key) || []), log]);
  });
  return Array.from({ length: month.daysInMonth() }, (_, index) => {
    const date = month.date(index + 1);
    const key = date.format("YYYY-MM-DD");
    const dayLogs = logsByDate.get(key) || [];
    const assigned = dayLogs.length;
    const future = date.isAfter(dayjs(today), "day");
    const closed = future ? 0 : dayLogs.filter((log) => log.status === "Done").length;
    return {
      date: key,
      day: index + 1,
      assigned,
      closed,
      carriedForward: date.isBefore(dayjs(today), "day") ? Math.max(assigned - closed, 0) : 0,
      score: future ? 0 : percent(closed, assigned),
      future,
    };
  });
};

export const getPendingActions = (kpas) => {
  const activeKpas = kpas.filter(isActiveKpa);
  const approvedKpas = activeKpas.filter((kpa) =>
    !kpa.approvalStatus || kpa.approvalStatus === "Approved",
  );
  return {
    approvals: activeKpas.filter((kpa) => kpa.approvalStatus === "Pending Approval").length,
    reviews: approvedKpas.filter((kpa) =>
      kpa.status === "Completed" &&
      (kpa.verification || "Pending") === "Pending",
    ).length,
    ratings: approvedKpas.filter((kpa) =>
      kpa.status === "Completed" &&
      kpa.verification === "Closed" &&
      (kpa.kpaRating == null || kpa.hrRating == null),
    ).length,
    changesRequired: approvedKpas.filter((kpa) =>
      kpa.verification === "Changes Required",
    ).length,
  };
};

export const getPerformanceTrend = (kpas, logs, today) => {
  const currentMonth = dayjs(today).startOf("month");
  const fiscalYearStart = currentMonth.month() >= 3
    ? currentMonth.month(3)
    : currentMonth.subtract(1, "year").month(3);
  const months = Array.from({ length: 12 }, (_, index) => fiscalYearStart.add(index, "month"));
  const activeKpas = kpas.filter(isActiveKpa);
  const points = months.map((month) => {
    const key = month.format("YYYY-MM");
    const monthKpas = activeKpas.filter((kpa) => kpa.month === key);
    const monthLogs = logs.filter((log) => dateKey(log.date)?.startsWith(key));
    const rated = monthKpas.filter((kpa) => kpa.kpaRating != null);
    return {
      label: month.format("MMM"),
      completion: percent(monthKpas.filter((kpa) => kpa.status === "Completed").length, monthKpas.length),
      rating: percent(rated.filter((kpa) => Number(kpa.kpaRating) === 1).length, rated.length),
      dailyLogs: percent(monthLogs.filter((log) => log.status === "Done").length, monthLogs.length),
    };
  });
  const currentPoint = points[currentMonth.diff(fiscalYearStart, "month")];
  return {
    points,
    completion: currentPoint.completion,
    rating: currentPoint.rating,
    dailyLogs: currentPoint.dailyLogs,
  };
};

const holidayKeys = (holidays) => {
  const keys = new Set();
  holidays.forEach((holiday) => {
    if (!holiday?.start) return;
    const start = dayjs(holiday.start).startOf("day");
    const end = dayjs(holiday.end || holiday.start).startOf("day");
    if (!start.isValid() || !end.isValid()) return;
    for (let day = start; !day.isAfter(end); day = day.add(1, "day")) {
      keys.add(day.format("YYYY-MM-DD"));
    }
  });
  return keys;
};

const workingDaysUntil = (today, deadline, holidays) => {
  const start = dayjs(today).startOf("day");
  const end = dayjs(deadline).startOf("day");
  const direction = end.isBefore(start) ? -1 : 1;
  let days = 0;
  for (let day = start.add(direction, "day");
    direction > 0 ? !day.isAfter(end) : !day.isBefore(end);
    day = day.add(direction, "day")) {
    if (day.day() !== 0 && !holidays.has(day.format("YYYY-MM-DD"))) days += direction;
  }
  return days;
};

export const getUpcomingDeadlines = (kpas, today, holidays = []) => {
  const excludedDays = holidayKeys(holidays);
  return kpas
    .filter((kpa) =>
      isActiveKpa(kpa) && kpa.status !== "Completed" && kpa.deadline &&
      (!kpa.approvalStatus || kpa.approvalStatus === "Approved"),
    )
    .map((kpa) => {
      const workingDays = workingDaysUntil(today, kpa.deadline, excludedDays);
      const isOverdue = dayjs(kpa.deadline).isBefore(dayjs(today), "day");
      return {
        id: kpa._id,
        target: kpa.target,
        deadline: kpa.deadline,
        workingDays,
        status: isOverdue ? "Overdue" : workingDays === 0 ? "Due Today" : workingDays <= 2 ? "Due Soon" : "On Track",
      };
    })
    .sort((first, second) => dayjs(first.deadline).valueOf() - dayjs(second.deadline).valueOf())
    .slice(0, 5);
};
