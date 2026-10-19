const { toCalendarKey } = require("./kraKpaDelayedDays");

const validateTaskSchedule = (date, tasks, now = new Date()) => {
  const selectedDate = toCalendarKey(date);
  const today = toCalendarKey(now);
  if (!selectedDate) return "A valid Schedule Date is required";
  if (selectedDate < today) return "Schedule Date cannot be in the past";
  for (const task of tasks) {
    const deadline = task.deadline && toCalendarKey(task.deadline);
    if (!deadline) return "Every selected task must have a valid deadline";
    if (deadline < today) {
      return "Overdue tasks cannot be scheduled. Update the task deadline first";
    }
    if (selectedDate > deadline) {
      return "Schedule Date cannot be after a selected task deadline";
    }
  }
  return null;
};

const isOverdueSchedule = (date, deadline) =>
  Boolean(deadline && toCalendarKey(date) > toCalendarKey(deadline));

module.exports = { validateTaskSchedule, isOverdueSchedule };
