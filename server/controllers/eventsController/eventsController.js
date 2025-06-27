const Event = require("../../models/events/Events");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");

const createEvent = async (req, res, next) => {
  const { company } = req;
  const { title, type, description, start, end } = req.body;

  try {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (!title || !type || !description || !start || !end) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const newEvent = new Event({
      title,
      type,
      description,
      start: startDate,
      end: endDate,
      company,
    });

    await newEvent.save();

    return res.status(201).json({ message: "Event created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllEvents = async (req, res, next) => {
  try {
    const { company } = req.userData;
    const { thisMonth } = req.query;

    let query = { company };

    if (thisMonth === "true") {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth(); // 0-indexed

      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

      query.start = { $gte: startOfMonth, $lte: endOfMonth };
    }

    const events = await Event.find(query);

    if (!events || events.length === 0) {
      return res.status(200).json([]);
    }

    const eventsData = events.map((event) => ({
      id: event._id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      description: event.description,
      active: event.active,
      backgroundColor:
        event.type === "Holiday"
          ? "#4caf50"
          : event.type === "Meeting"
          ? "purple"
          : event.type === "Task"
          ? "yellow"
          : event.type === "Event"
          ? "blue"
          : event.type === "Birthday"
          ? "#ff9800"
          : "",
      extendedProps: {
        type: event.type,
      },
    }));

    res.status(200).json(eventsData);
  } catch (error) {
    next(error);
  }
};

const getNormalEvents = async (req, res, next) => {
  try {
    const { company } = req.userData;

    const normalEvents = await Event.find({ company: company, type: "event" });

    if (!normalEvents || normalEvents.length < 0) {
      res.status(400).json({ message: "No event found" });
    }

    res.status(200).json(normalEvents);
  } catch (error) {
    next(error);
  }
};

const getHolidays = async (req, res, next) => {
  try {
    const { company } = req.userData;

    const holidays = await Event.find({ company: company, type: "holiday" });

    if (!holidays || holidays.length < 0) {
      res.status(400).json({ message: "No holiday found" });
    }

    res.status(200).json(holidays);
  } catch (error) {
    next(error);
  }
};

const getBirthdays = async (req, res, next) => {
  try {
    const { company } = req.userData;

    const birthdays = await Event.find({ company: company, type: "birthday" });

    if (!birthdays || birthdays.length < 0) {
      res.status(400).json({ message: "No birthday found" });
    }

    res.status(200).json(birthdays);
  } catch (error) {
    next(error);
  }
};

const extendEvent = async (req, res, next) => {
  const { id, extend } = req.body;
  const extendTime = new Date(extend);

  try {
    if (!id) {
      return res.status(400).json({ message: "EventId is required" });
    }

    if (isNaN(extendTime.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const meetings = await Event.find({ type: "holiday" });

    const onGoingMeetings = meetings.some((meeting) => {
      const startDate = new Date(meeting.start);
      const endDate = new Date(meeting.end);
      return extendTime > startDate && extendTime < endDate;
    });

    if (onGoingMeetings) {
      return res
        .status(400)
        .json({ message: "Cannot extend the meeting due to ongoing meetings" });
    }

    const extendedMeeting = await Event.findOneAndUpdate(
      { _id: id },
      { end: extendTime },
      { new: true }
    );

    if (!extendedMeeting) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({ message: "Meeting time extended" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteEvent = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({ message: "EventId is required" });
    }

    const inActiveEvent = await Event.findOneAndUpdate(
      { _id: id },
      { active: false },
      { new: true }
    );

    if (!inActiveEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({
      message: "Event deleted successfully",
      data: inActiveEvent,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getNormalEvents,
  getHolidays,
  getBirthdays,
  extendEvent,
  deleteEvent,
};
