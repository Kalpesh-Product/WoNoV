const Event = require("../../models/events/Events");

const EVENT_TYPE_COLORS = {
  holiday: "#4caf50",
  meeting: "purple",
  task: "yellow",
  event: "blue",
  birthday: "#ff9800",
};

const buildMonthFilter = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  return {
    $gte: new Date(year, month, 1),
    $lte: new Date(year, month + 1, 0, 23, 59, 59, 999),
  };
};

const getEventBackgroundColor = (type = "") =>
  EVENT_TYPE_COLORS[type.toLowerCase()] || "";

const formatCalendarEvent = ({ event, isReport }) => ({
  id: event._id,
  title: event.title,
  start: event.start,
  end: event.end,
  description: event.description,
  ...(!isReport && {
    allDay: event.allDay,
    active: event.active,
    backgroundColor: getEventBackgroundColor(event.type),
    extendedProps: {
      type: event.type,
    },
  }),
  ...(isReport && { type: event.type }),
});

const fetchHolidayAndEventsService = async ({
  company,
  thisMonth,
  isReport,
}) => {
  const query = { company };

  if (thisMonth === "true") {
    query.start = buildMonthFilter();
  }

  const events = await Event.find(query);

  if (!events || events.length === 0) {
    return [];
  }

  return events.map(formatCalendarEvent);
};

module.exports = {
  fetchHolidayAndEventsService,
};
