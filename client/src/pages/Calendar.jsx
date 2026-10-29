import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "../pages/LoginPage/CalenderModal.css";

import {
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import dayjs from "dayjs";

import MuiModal from "../components/MuiModal";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import humanDate from "../utils/humanDateForamt";
import humanTime from "../utils/humanTime";
import useAuth from "../hooks/useAuth";

const MAIN_FILTERS = ["holiday", "event", "meeting"];
const MEETING_STATUS_FILTERS = [
  "upcoming",
  "ongoing",
  "completed",
  "extended",
  "cancelled",
];
const MEETING_TYPE_FILTERS = ["internal", "external"];
const ALL_FILTERS = [
  ...MAIN_FILTERS,
  ...MEETING_STATUS_FILTERS,
  ...MEETING_TYPE_FILTERS,
];
const FILTER_COLORS = {
  holiday: "#4caf50",
  event: "#ff9800",
  meeting: "#2196f3",
  upcoming: "#3BACFF",
  ongoing: "#14B8A6",
  completed: "#22C55E",
  extended: "#6366F1",
  cancelled: "#EF4444",
  internal: "#8B5CF6",
  external: "#F59E0B",
};

const getMonthRange = (value = dayjs()) => ({
  startDate: value.startOf("month"),
  endDate: value.endOf("month"),
});

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const getMeetingStatus = (meeting) => {
  const status = normalize(meeting?.meetingStatus);
  return status === "canceled" ? "cancelled" : status;
};

const Calender = () => {
  const { auth } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState(""); // 'view' or 'add'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [headerBackground, setHeaderBackground] = useState("");
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    description: "",
  });
  const [eventFilter, setEventFilter] = useState([
    ...ALL_FILTERS,
  ]);
  const [calendarRange, setCalendarRange] = useState(() => getMonthRange());
  const axios = useAxiosPrivate();

  const roleTitles = useMemo(
    () =>
      (auth?.user?.role || [])
        .map((role) => normalize(role?.roleTitle || role))
        .filter(Boolean),
    [auth?.user?.role],
  );
  const roleIds = useMemo(
    () =>
      (auth?.user?.role || [])
        .map((role) => String(role?.roleID || "").toUpperCase())
        .filter(Boolean),
    [auth?.user?.role],
  );
  const isEmployee = useMemo(
    () =>
      roleTitles.some((role) => role.includes("employee")) ||
      roleIds.some((roleId) => roleId.includes("EMPLOYEE")),
    [roleIds, roleTitles],
  );

  //---------------------------------API------------------------------------------//

  const { data: events = [], isPending: isEventsPending } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/events/all-events");
        return response.data;
      } catch (error) {
        toast.error(error.message);
        return [];
      }
    },
  });

  const { data: meetings = [], isLoading: isMeetingsLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/my-meetings");
      return response.data;
    },
  });

  // const transformedMeetings = meetings.map((meeting) => ({
  //   id: meeting._id,
  //   title: meeting.subject || "Meeting",
  //   start: meeting.startTime,
  //   end: meeting.endTime,
  //   allDay: false,
  //   backgroundColor: "#2196f3", // blue for meetings
  //   extendedProps: {
  //     type: "meeting", // so it can be filtered
  //     agenda: meeting.agenda,
  //     roomName: meeting.roomName,
  //     bookedBy: meeting.bookedBy,
  //     receptionist: meeting.receptionist,
  //     client: meeting.client,
  //     meetingType: meeting.meetingType,
  //     duration: meeting.duration,
  //     startTime: meeting.startTime,
  //     endTime: meeting.endTime,
  //     subject: meeting.subject,
  //     department: meeting.department,
  //     participants: meeting.participants?.map(
  //       (p) => `${p.firstName} ${p.lastName}`
  //     ),
  //     meetingStatus: meeting.meetingStatus,
  //     housekeepingStatus: meeting.housekeepingStatus,
  //     location: meeting.location,
  //   },
  // }));

  // const transformedEvents = events.map((event) => {
  //   const type = event?.extendedProps?.type?.toLowerCase?.() || "event";
  //   const colorMap = {
  //     holiday: "#4caf50",
  //     event: "#ff9800",
  //     meeting: "#2196f3",
  //   };

  //   return {
  //     ...event,
  //     backgroundColor: colorMap[type] || "#757575", // default gray if unknown
  //   };
  // });

  // const currentUserId = auth?.user?._id?.toString();

  // const ownMeetings = useMemo(
  //   () =>
  //     meetings.filter(
  //       (meeting) => meeting?.bookedById?.toString() === currentUserId
  //     ),
  //   [meetings, currentUserId]
  // );

  // const transformedMeetings = useMemo(
  //   () =>
  //     ownMeetings.map((meeting) => ({
  const visibleMeetings = useMemo(
    () =>
      meetings.filter((meeting) => {
        const isVisibleStatus = MEETING_STATUS_FILTERS.includes(
          getMeetingStatus(meeting),
        );
        const isCurrentUserInvolved =
          meeting?.isCurrentUserInvolved === true;

        return isVisibleStatus && isCurrentUserInvolved;
      }),
    [meetings],
  );

  const transformedMeetings = useMemo(
    () =>
      visibleMeetings.map((meeting) => {
        const status = getMeetingStatus(meeting);

        return {
          id: meeting._id,
          title: meeting.subject || "Meeting",
          start: meeting.startTime,
          end: meeting.endTime,
          allDay: false,
          backgroundColor: FILTER_COLORS[status],
          borderColor: FILTER_COLORS[status],
          extendedProps: {
            type: "meeting", // so it can be filtered
            agenda: meeting.agenda,
            roomName: meeting.roomName,
            bookedBy: meeting.bookedBy,
            receptionist: meeting.receptionist,
            client: meeting.client,
            meetingType: meeting.meetingType,
            duration: meeting.duration,
            startTime: meeting.startTime,
            endTime: meeting.endTime,
            subject: meeting.subject,
            department: meeting.department,
    //       participants: meeting.participants?.map(
    //         (p) => `${p.firstName} ${p.lastName}`
    //       ),
    //       meetingStatus: meeting.meetingStatus,
    //       housekeepingStatus: meeting.housekeepingStatus,
    //       location: meeting.location,
    //     },
    //   })),
    // [ownMeetings]
            participants: meeting.participants?.map((participant) =>
              participant?.firstName
                ? `${participant.firstName} ${participant.lastName || ""}`.trim()
                : participant?.employeeName || participant?.name || "N/A",
            ),
            meetingStatus: meeting.meetingStatus,
            housekeepingStatus: meeting.housekeepingStatus,
            location: meeting.location,
          },
        };
      }),
    [visibleMeetings],
  );

  const transformedEvents = useMemo(
    () =>
      events.map((event) => {
        const type = event?.extendedProps?.type?.toLowerCase?.() || "event";
        return {
          ...event,
          backgroundColor: FILTER_COLORS[type] || "#757575",
        };
      }),
    [events],
  );


  //---------------------------------API------------------------------------------//

  const allCombinedEvents = useMemo(
    () => [...transformedEvents, ...transformedMeetings],
    [transformedEvents, transformedMeetings],
  );
  const filterCounts = useMemo(() => {
    const counts = Object.fromEntries(ALL_FILTERS.map((key) => [key, 0]));
    const monthEvents = allCombinedEvents.filter((event) => {
      const eventStart = dayjs(event.start);
      const eventEnd = event.end ? dayjs(event.end) : eventStart;
      if (!eventStart.isValid() || !eventEnd.isValid()) return false;

      return (
        !eventEnd.isBefore(calendarRange.startDate) &&
        !eventStart.isAfter(calendarRange.endDate)
      );
    });

    monthEvents.forEach((event) => {
      const type = normalize(event.extendedProps?.type);
      if (type in counts) counts[type]++;

      if (type === "meeting") {
        const status = getMeetingStatus(event.extendedProps);
        const meetingType = normalize(event.extendedProps?.meetingType);
        if (status in counts) counts[status]++;
        if (meetingType in counts) counts[meetingType]++;
      }
    });

    return counts;
  }, [allCombinedEvents, calendarRange]);

  const visibleEvents = useMemo(
    () =>
      allCombinedEvents.filter((event) => {
        const type = normalize(event.extendedProps?.type);
        if (!eventFilter.includes(type)) return false;

        if (type !== "meeting") return true;

        return (
          eventFilter.includes(getMeetingStatus(event.extendedProps)) &&
          eventFilter.includes(normalize(event.extendedProps?.meetingType))
        );
      }),
    [allCombinedEvents, eventFilter],
  );

  const getTodaysEvents = () => {
    const today = dayjs().startOf("day");

     return visibleEvents.filter((event) => {
      const start = dayjs(event.start).startOf("day");
      const end = event.end ? dayjs(event.end).startOf("day") : start;

      return (
        today.isSame(start) ||
        today.isSame(end) ||
        (today.isAfter(start) && today.isBefore(end))
      );
    });
  };

  console.log("filtered events : ", visibleEvents);
  const todaysEvents = getTodaysEvents();

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const type = normalize(event.extendedProps?.type);
    const colorKey =
      type === "meeting" ? getMeetingStatus(event.extendedProps) : type;
    const headerBackground = FILTER_COLORS[colorKey] || "";

    setSelectedEvent(event);
    setDrawerMode("view");
    setIsDrawerOpen(true);
    setHeaderBackground(headerBackground); // Set the background color
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedEvent(null);
    setNewEvent({
      title: "",
      start: "",
      description: "",
    });
  };

 console.log("selected : ", visibleEvents);
  return (
    <div className="flex w-[70%] md:w-full">
      {!isMeetingsLoading && !isEventsPending ? (
        <div className="flex-1 p-4 bg-white">
          <div className="flex gap-4 relative w-full">
            <div className="flex flex-col gap-4 w-[25%]">
              <div className="border-2 border-gray-300  rounded-md">
                <div className="w-full flex justify-start border-b-default border-borderGray p-2">
                  <span className="text-content font-bold uppercase">
                    Event Filters
                  </span>
                </div>
                <div className="text-content">
                  {MAIN_FILTERS.map((type, sectionIndex) => (
                    <div
                      key={type}
                      className={
                        sectionIndex
                          ? "border-t border-borderGray p-2"
                          : "p-2"
                      }
                    >
                      <div className="flex items-center justify-between pr-3">
                        <FormControlLabel
                          sx={{ marginRight: 0 }}
                          control={
                            <Checkbox
                              size="small"
                              checked={eventFilter.includes(type)}
                              onChange={(event) =>
                                setEventFilter((previous) =>
                                  event.target.checked
                                    ? [...previous, type]
                                    : previous.filter((item) => item !== type),
                                )
                              }
                              sx={{
                                color: FILTER_COLORS[type],
                                "&.Mui-checked": {
                                  color: FILTER_COLORS[type],
                                },
                              }}
                            />
                          }
                          label={
                            <span className="text-sm capitalize">{type}</span>
                          }
                        />
                        <span
                          className="rounded-full px-2 py-1 text-xs font-semibold"
                          style={{
                            color: FILTER_COLORS[type],
                            backgroundColor: `${FILTER_COLORS[type]}18`,
                          }}
                        >
                          {filterCounts[type]}
                        </span>
                      </div>

                      {type === "meeting" && (
                        <div className="ml-6 mt-1 border-l-2 border-blue-100 pl-3">
                          <div className="mb-1 text-xs font-medium text-gray-500">
                            Filter by status
                          </div>
                          <FormGroup>
                            {MEETING_STATUS_FILTERS.map((status) => (
                              <div
                                key={status}
                                className="flex items-center justify-between pr-3"
                              >
                                <FormControlLabel
                                  sx={{ marginRight: 0 }}
                                  control={
                                    <Checkbox
                                      size="small"
                                      checked={eventFilter.includes(status)}
                                      onChange={(event) =>
                                        setEventFilter((previous) =>
                                          event.target.checked
                                            ? [...previous, status]
                                            : previous.filter(
                                                (item) => item !== status,
                                              ),
                                        )
                                      }
                                      sx={{
                                        color: FILTER_COLORS[status],
                                        "&.Mui-checked": {
                                          color: FILTER_COLORS[status],
                                        },
                                      }}
                                    />
                                  }
                                  label={
                                    <span className="text-sm capitalize">
                                      {status}
                                    </span>
                                  }
                                />
                                <span
                                  className="rounded-full px-2 py-1 text-xs font-semibold"
                                  style={{
                                    color: FILTER_COLORS[status],
                                    backgroundColor: `${FILTER_COLORS[status]}18`,
                                  }}
                                >
                                  {filterCounts[status]}
                                </span>
                              </div>
                            ))}
                          </FormGroup>

                          {!isEmployee && (
                            <div className="mt-2 border-t border-blue-100 pt-2">
                              <div className="mb-1 text-xs font-medium text-gray-500">
                                Filter by type
                              </div>
                              <FormGroup>
                                {MEETING_TYPE_FILTERS.map((meetingType) => (
                                  <div
                                    key={meetingType}
                                    className="flex items-center justify-between pr-3"
                                  >
                                    <FormControlLabel
                                      sx={{ marginRight: 0 }}
                                      control={
                                        <Checkbox
                                          size="small"
                                          checked={eventFilter.includes(
                                            meetingType,
                                          )}
                                          onChange={(event) =>
                                            setEventFilter((previous) =>
                                              event.target.checked
                                                ? [...previous, meetingType]
                                                : previous.filter(
                                                    (item) =>
                                                      item !== meetingType,
                                                  ),
                                            )
                                          }
                                          sx={{
                                            color: FILTER_COLORS[meetingType],
                                            "&.Mui-checked": {
                                              color:
                                                FILTER_COLORS[meetingType],
                                            },
                                          }}
                                        />
                                      }
                                      label={
                                        <span className="text-sm capitalize">
                                          {meetingType}
                                        </span>
                                      }
                                    />
                                    <span
                                      className="rounded-full px-2 py-1 text-xs font-semibold"
                                      style={{
                                        color: FILTER_COLORS[meetingType],
                                        backgroundColor: `${FILTER_COLORS[meetingType]}18`,
                                      }}
                                    >
                                      {filterCounts[meetingType]}
                                    </span>
                                  </div>
                                ))}
                              </FormGroup>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-2 border-gray-300  rounded-md">
                <div className="mb-2 text-content font-bold uppercase border-b-default border-borderGray p-2">
                  <span>Today's Schedule</span>
                </div>

                <div className="px-2">
                  {todaysEvents.length > 0 ? (
                    todaysEvents.map((event, index) => {
                      const type = normalize(event.extendedProps.type);
                      const colorKey =
                        type === "meeting"
                          ? getMeetingStatus(event.extendedProps)
                          : type;
                      return (
                        <div
                          key={index}
                          className="flex gap-2 items-center mb-2"
                        >
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor: FILTER_COLORS[colorKey],
                            }}
                          ></div>
                          <div className="flex flex-col">
                            <span className="text-content font-medium">
                              {event.title}
                            </span>
                            <span className="text-small text-gray-500">
                              {event.start
                                ? dayjs(event.start).format("h:mm A")
                                : "All Day"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <span>No events today.</span>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full h-full overflow-y-auto">
              <FullCalendar
                allDayText="All Day"
                headerToolbar={{
                  left: "today",
                  center: "prev title next",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                dayMaxEvents={2}
                eventDisplay="block"
                eventContent={(meeting) => (
                  <span className="text-content">{meeting.event.title}</span>
                )}
                eventClick={handleEventClick}
                contentHeight={520}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                datesSet={(dateInfo) =>
                  setCalendarRange(
                    getMonthRange(dayjs(dateInfo.view.calendar.getDate())),
                  )
                }
                events={visibleEvents}
              />
            </div>
          </div>

          <MuiModal
            open={isDrawerOpen}
            onClose={closeDrawer}
            headerBackground={headerBackground}
            title={
              selectedEvent?.extendedProps?.type.toLowerCase() === "holiday"
                ? "Holiday Details"
                : selectedEvent?.extendedProps?.type.toLowerCase() === "meeting"
                ? "Meeting Details"
                : selectedEvent?.extendedProps?.type.toLowerCase() === "event"
                ? "Event Details"
                : selectedEvent?.extendedProps?.type.toLowerCase() ===
                  "birthday"
                ? "Birthday Details"
                : ""
            }
          >
            {drawerMode === "view" && selectedEvent && (
              <div>
                <div className="flex flex-col gap-2">
                  {selectedEvent?.extendedProps?.type.toLowerCase() ===
                    "meeting" && <div className="font-bold">Basic Info</div>}
                  <span className="text-content flex items-center">
                    <span className="w-[30%]">Title</span>
                    <span>:</span>
                    <span className="text-content w-full justify-start pl-4">
                      {selectedEvent.title}
                    </span>
                  </span>
                  {selectedEvent.extendedProps?.agenda && (
                    <div>
                      <span className="text-content flex items-start">
                        <span className="w-[30%]">Agenda</span>
                        <span>:</span>
                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.agenda}
                        </span>
                      </span>
                    </div>
                  )}
                  <span className="text-content flex  items-center">
                    <span className="w-[30%]"> Start Date </span>
                    <span>:</span>
                    <span className="text-content   w-full justify-start pl-4">
                      {humanDate(
                        new Date(selectedEvent?._instance.range.start)
                      )}
                    </span>{" "}
                  </span>{" "}
                  <span className="text-content flex  items-center">
                    <span className="w-[30%]"> End Date </span>
                    <span>:</span>
                    <span className="text-content   w-full justify-start pl-4">
                      {humanDate(selectedEvent?._instance.range.end)}
                    </span>{" "}
                  </span>{" "}
                  {selectedEvent.extendedProps.startTime && (
                    <div>
                      <span className="text-content flex  items-start ">
                        <span className="w-[30%]"> Time</span>
                        <span>:</span>

                        <span className="text-content   w-full justify-start pl-4">
                          {`${humanTime(selectedEvent.start)} - ${humanTime(
                            selectedEvent.end
                          )}`}
                        </span>
                      </span>{" "}
                    </div>
                  )}
                  {selectedEvent.extendedProps.duration && (
                    <div>
                      <span className="text-content flex  items-start ">
                        <span className="w-[30%]">Duration</span>
                        <span>:</span>

                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.duration}
                        </span>
                      </span>{" "}
                    </div>
                  )}
                  {selectedEvent.extendedProps.meetingStatus && (
                    <div>
                      <span className="text-content flex  items-start ">
                        <span className="w-[30%]">Status</span>
                        <span>:</span>

                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.meetingStatus}
                        </span>
                      </span>{" "}
                    </div>
                  )}
                  {selectedEvent.extendedProps?.meetingType && (
                    <div>
                      <span className="text-content flex items-start">
                        <span className="w-[30%]">Meeting Type</span>
                        <span>:</span>
                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.meetingType}
                        </span>
                      </span>
                    </div>
                  )}
                  {selectedEvent.extendedProps?.client && (
                    <div>
                      <span className="text-content flex items-start">
                        <span className="w-[30%]">Company</span>
                        <span>:</span>
                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.client}
                        </span>
                      </span>
                    </div>
                  )}
                  {selectedEvent.extendedProps?.externalClient && (
                    <div>
                      <span className="text-content flex items-start">
                        <span className="w-[30%]">Company</span>
                        <span>:</span>
                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.externalClient}
                        </span>
                      </span>
                    </div>
                  )}
                  {selectedEvent.extendedProps.description && (
                    <div>
                      <span className="text-content flex  items-start ">
                        <span className="w-[30%]"> Description</span>
                        <span>:</span>

                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.description}
                        </span>
                      </span>{" "}
                    </div>
                  )}
                  {selectedEvent?.extendedProps?.type.toLowerCase() ===
                    "meeting" && (
                    <>
                      <br />
                      <div className="font-bold">People Involved</div>
                    </>
                  )}
                  {selectedEvent.extendedProps?.participants?.length > 0 && (
                    <div>
                      <span className="text-content flex items-start">
                        <span className="w-[30%]">Participants</span>
                        <span>:</span>
                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.participants
                            .map((p) => p)
                            .join(",")}
                        </span>
                      </span>
                    </div>
                  )}
                  {selectedEvent.extendedProps?.bookedBy && (
                    <div>
                      <span className="text-content flex items-start">
                        <span className="w-[30%]">Booked By</span>
                        <span>:</span>
                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.bookedBy}
                        </span>
                      </span>
                    </div>
                  )}
                  {selectedEvent.extendedProps?.receptionist && (
                    <div>
                      <span className="text-content flex items-start">
                        <span className="w-[30%]">Receptionist</span>
                        <span>:</span>
                        <span className="text-content   w-full justify-start pl-4 ">
                          {selectedEvent.extendedProps.receptionist || "N/A"}
                        </span>
                      </span>
                    </div>
                  )}
                  {selectedEvent.extendedProps?.department && (
                    <div>
                      <span className="text-content flex items-start">
                        <span className="w-[30%]">Department</span>
                        <span>:</span>
                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.department?.map(
                            (item) => item.name
                          )}
                        </span>
                      </span>
                    </div>
                  )}
                  {selectedEvent?.extendedProps?.type.toLowerCase() ===
                    "meeting" && (
                    <>
                      <br />
                      <div className="font-bold">Venue Details</div>
                    </>
                  )}
                  {selectedEvent.extendedProps?.roomName && (
                    <div>
                      <span className="text-content flex items-start">
                        <span className="w-[30%]">Room</span>
                        <span>:</span>
                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.roomName}
                        </span>
                      </span>
                    </div>
                  )}
                  {selectedEvent.extendedProps?.location && (
                    <>
                      {selectedEvent.extendedProps.location?.unitNo &&
                        selectedEvent.extendedProps.location?.unitName && (
                          <div>
                            <span className="text-content flex items-start">
                              <span className="w-[30%]">Location</span>
                              <span>:</span>
                              <span className="text-content   w-full justify-start pl-4">
                                {`${selectedEvent.extendedProps.location.unitNo} (${selectedEvent.extendedProps.location.unitName})`}
                              </span>
                            </span>
                          </div>
                        )}
                      {selectedEvent.extendedProps.location?.building
                        ?.buildingName && (
                        <div>
                          <span className="text-content flex items-start">
                            <span className="w-[30%]">Building</span>
                            <span>:</span>
                            <span className="text-content   w-full justify-start pl-4">
                              {
                                selectedEvent.extendedProps.location.building
                                  .buildingName
                              }
                            </span>
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {selectedEvent.extendedProps?.housekeepingStatus && (
                    <div>
                      <span className="text-content flex items-start">
                        <span className="w-[30%]">Housekeeping Status</span>
                        <span>:</span>
                        <span className="text-content   w-full justify-start pl-4">
                          {selectedEvent.extendedProps.housekeepingStatus}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </MuiModal>
        </div>
      ) : (
        <CircularProgress color="#1E3D73" size={15} />
      )}
    </div>
  );
};

export default Calender;
