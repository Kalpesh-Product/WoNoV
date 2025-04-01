const Event = require("../../models/events/Events");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");

const createEvent = async (req, res, next) => {
  const { user, ip, company } = req;
  const { title, type, description, start, end, participants } = req.body;

  const logPath = "events/EventLog";
  const logAction = "Create Event";
  const logSourceKey = "event";

  try {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (!title || !type || !description || !start || !end) {
      throw new CustomError(
        "All fields are required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new CustomError(
        "Invalid date format",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const validParticipants = Array.isArray(participants) ? participants : [];

    const newEvent = new Event({
      title,
      type,
      description,
      start: startDate,
      end: endDate,
      participants: validParticipants,
      company,
    });

    const event = await newEvent.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Event created successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: event._id,
      changes: {
        title,
        type,
        description,
        start: startDate,
        end: endDate,
        participants: validParticipants,
      },
    });

    return res.status(201).json({ message: "Event created successfully" });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

const getAllEvents = async (req, res, next) => {
  try {
    const { company } = req.userData;

    company;
    const events = await Event.find({ company: company });

    if (!events || events.length === 0) {
      return res.status(204).json({ message: "No events found" });
    }

    const eventsData = events.map((event) => {
      return {
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
            : event.type === "task"
            ? "yellow"
            : event.type === "event"
            ? "blue"
            : event.type === "Birthday"
            ? "#ff9800"
            : "",
        extendedProps: {
          type: event.type,
        },
      };
    });

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
  const { user, ip, company } = req;
  const { id, extend } = req.body;
  const extendTime = new Date(extend);

  const logPath = "events/EventLog";
  const logAction = "Extend Event";
  const logSourceKey = "event";

  try {
    if (!id) {
      throw new CustomError(
        "EventId is required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (isNaN(extendTime.getTime())) {
      throw new CustomError(
        "Invalid date format",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const meetings = await Event.find({ type: "holiday" });

    const onGoingMeetings = meetings.some((meeting) => {
      const startDate = new Date(meeting.start);
      const endDate = new Date(meeting.end);
      return extendTime > startDate && extendTime < endDate;
    });

    if (onGoingMeetings) {
      throw new CustomError(
        "Cannot extend the meeting due to ongoing meetings",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const extendedMeeting = await Event.findOneAndUpdate(
      { _id: id },
      { end: extendTime },
      { new: true }
    );

    if (!extendedMeeting) {
      throw new CustomError(
        "Event not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Success log with the updated event details
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Meeting time extended successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: extendedMeeting._id,
      changes: { extendedEnd: extendTime },
    });

    return res.status(200).json({ message: "Meeting time extended" });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

const deleteEvent = async (req, res, next) => {
  const { user, ip, company } = req;
  const { id } = req.params;

  const logPath = "events/EventLog";
  const logAction = "Delete Event";
  const logSourceKey = "event";

  try {
    if (!id) {
      throw new CustomError(
        "EventId is required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const inActiveEvent = await Event.findOneAndUpdate(
      { _id: id },
      { active: false },
      { new: true }
    );

    if (!inActiveEvent) {
      throw new CustomError(
        "Event not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Success log with event ID and details
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Event deleted successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: inActiveEvent._id,
      changes: { eventId: inActiveEvent._id, active: "false" },
    });

    return res.status(200).json({
      message: "Event deleted successfully",
      data: inActiveEvent,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
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
