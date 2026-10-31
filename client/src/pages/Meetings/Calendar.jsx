import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "../../pages/LoginPage/CalenderModal.css";

import {
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import dayjs from "dayjs";

import MuiModal from "../../components/MuiModal";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import DetalisFormatted from "../../components/DetalisFormatted";
import humanDate from "../../utils/humanDateForamt";
import { useSelector } from "react-redux";
import { setMeetings } from "../../redux/slices/meetingSlice";
import humanTime from "../../utils/humanTime";
import useAuth from "../../hooks/useAuth";
import { toUtcDayBoundary } from "../../utils/dateRange";
import { getStatusColors } from "../../constants/statusColors";
const getMonthRange = (value = dayjs()) => ({
  startDate: value.startOf("month").toDate(),
  endDate: value.endOf("month").toDate(),
});

const FILTER_COLORS = {
  internal: "#8B5CF6",
  external: "#F59E0B",
};

const STATUS_FILTERS = [
  "upcoming",
  "ongoing",
  "completed",
  "extended",
  "cancelled",
];
const TYPE_FILTERS = ["internal", "external"];
const ALL_FILTERS = [...STATUS_FILTERS, ...TYPE_FILTERS];
const getFilterColors = (filter) =>
  STATUS_FILTERS.includes(filter)
    ? getStatusColors(filter)
    : {
        color: FILTER_COLORS[filter],
        backgroundColor: `${FILTER_COLORS[filter]}18`,
      };

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const getMeetingStatus = (meeting) => {
  const status = normalize(meeting.meetingStatus);
  return status === "canceled" ? "cancelled" : status;
};

const Calender = () => {
  const { auth } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState(""); // 'view' or 'add'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [headerBackground, setHeaderBackground] = useState("");
  const axios = useAxiosPrivate();
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    description: "",
  });

  const [eventFilter, setEventFilter] = useState(ALL_FILTERS);

  const [calendarRange, setCalendarRange] = useState(() => getMonthRange());
  const calendarFilters = useMemo(
    () => ({
      startDate: toUtcDayBoundary(calendarRange.startDate),
      endDate: toUtcDayBoundary(calendarRange.endDate, true),
    }),
    [calendarRange],
  );

  const {
    data: meetings = [],
    isLoading: isMeetingsLoading,
    isPlaceholderData,
  } = useQuery({
    queryKey: [
      "meetings-calendar",
      calendarFilters.startDate,
      calendarFilters.endDate,
    ],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const respone = await axios.get("/api/meetings/get-meetings", {
          params: {
            ...calendarFilters,
            calendar: "true",
            includeTotal: "true",
          },
        });
        return respone.data.data || respone.data || [];
      } catch (error) {
        console.error(error);
      }
    },
  });

  // const transformedMeetings = isMeetingsLoading
  //   ? []
  //   : meetings.map((meeting) => {
  //       const formattedStart = meeting.startTime.split("/").reverse().join("-");
  //       const formattedEnd = meeting.endTime.split("/").reverse().join("-");

  //       const status = meeting.meetingStatus.toLowerCase();
  //       const colors = {
  //         upcoming: "#3BACFF",
  //         completed: "#5EFE1F",
  //       };

  //       return {
  //         id: meeting._id,
  //         title: meeting.subject,
  //         start: formattedStart,
  //         end: formattedEnd,
  //         backgroundColor: colors[status] || undefined, // ✅ Add background color here
  //         borderColor: colors[status] || undefined,
  //         extendedProps: { ...meeting },
  //       };
  //     });

  const roleTitles = useMemo(
    () =>
      (auth?.user?.role || [])
        .map((role) => role?.roleTitle?.toLowerCase?.())
        .filter(Boolean),
    [auth?.user?.role],
  );

  const roleIds = useMemo(
    () =>
      (auth?.user?.role || [])
        .map((role) => role?.roleID?.toUpperCase?.())
        .filter(Boolean),
    [auth?.user?.role],
  );

  const isFinanceAdmin = useMemo(
    () =>
      roleIds.includes("ROLE_FINANCE_ADMIN") ||
      roleTitles.some((role) => role.includes("finance admin")),
    [roleIds, roleTitles],
  );

  const isPrivilegedAdmin = useMemo(
    () =>
      roleTitles.some(
        (role) =>
          role === "super admin" ||
          role === "master admin" ||
          role.includes("admin"),
      ) && !isFinanceAdmin,
    [roleTitles, isFinanceAdmin],
  );

  const isFinanceManager = useMemo(
    () =>
      roleTitles.some(
        (role) => role.includes("finance") && role.includes("manager"),
      ),
    [roleTitles],
  );

  const isFinanceEmployee = useMemo(
    () =>
      roleIds.includes("ROLE_FINANCE_EMPLOYEE") ||
      roleTitles.some(
        (role) => role.includes("finance") && role.includes("employee"),
      ),
    [roleTitles, roleIds],
  );

  const isManager = useMemo(
    () => roleTitles.some((role) => role.includes("manager")),
    [roleTitles],
  );

  const isEmployee = useMemo(
    () => roleTitles.some((role) => role.includes("employee")),
    [roleTitles],
  );

  const isAdministrationDepartment = useMemo(
    () =>
      (auth?.user?.departments || []).some(
        (department) =>
          normalize(department?.name || department) === "administration",
      ),
    [auth?.user?.departments],
  );

  const showMeetingTypeFilters =
    !isEmployee || isAdministrationDepartment;

  const isTopManagement = useMemo(
    () =>
      roleTitles.some((role) => role.includes("top management")) ||
      (auth?.user?.departments || []).some(
        (department) =>
          normalize(department?.name || department) === "top management",
      ),
    [roleTitles, auth?.user?.departments],
  );

  const userDepartmentIds = useMemo(
    () => (auth?.user?.departments || []).map((dept) => dept?._id?.toString()),
    [auth?.user?.departments],
  );

  const allowedMeetingStatuses = useMemo(
    () =>
      new Set(["upcoming", "ongoing", "completed", "extended", "cancelled"]),
    [],
  );

  const visibleMeetings = useMemo(() => {
    if (isPlaceholderData || !Array.isArray(meetings)) return [];

    return meetings.filter((meeting) => {
      const meetingDepartmentIds = (meeting?.department || [])
        .map((dept) => dept?._id?.toString())
        .filter(Boolean);

      const meetingStatus = getMeetingStatus(meeting);

      const isCurrentUserInvolved =
        meeting?.isCurrentUserInvolved === true;

      if (!allowedMeetingStatuses.has(meetingStatus)) {
        return false;
      }

      if (isTopManagement) return true;

      if (isFinanceEmployee) {
        return isCurrentUserInvolved;
      }

      if (isFinanceAdmin || isFinanceManager || isManager) {
        return (
          meetingDepartmentIds.some((deptId) =>
            userDepartmentIds.includes(deptId),
          ) || isCurrentUserInvolved
        );
      }

      if (isPrivilegedAdmin) return true;

      return isCurrentUserInvolved;
    });
  }, [
    meetings,
    isPrivilegedAdmin,
    isFinanceAdmin,
    isFinanceManager,
    isFinanceEmployee,
    isManager,
    isTopManagement,
    userDepartmentIds,
    allowedMeetingStatuses,
    isPlaceholderData,
  ]);

  const meetingCounts = useMemo(() => {
    const counts = Object.fromEntries(ALL_FILTERS.map((key) => [key, 0]));

    visibleMeetings.forEach((meeting) => {
      const status = getMeetingStatus(meeting);
      const type = normalize(meeting.meetingType);

      if (status in counts) counts[status]++;
      if (type in counts) counts[type]++;
    });

    return counts;
  }, [visibleMeetings]);

  const transformedMeetings = useMemo(() => {
    return visibleMeetings.map((meeting) => {
      const status = getMeetingStatus(meeting);
      const statusColors = getStatusColors(status);

      return {
        id: meeting._id,
        title: meeting.subject,
        start: meeting.startTime.split("/").reverse().join("-"),
        end: meeting.endTime.split("/").reverse().join("-"),
        backgroundColor: statusColors.backgroundColor,
        borderColor: "transparent",
        textColor: statusColors.color,
        extendedProps: { ...meeting },
      };
    });
  }, [visibleMeetings]);

  const filteredEvents = useMemo(() => {
    const selectedStatuses = eventFilter.filter((filter) =>
      STATUS_FILTERS.includes(filter),
    );

    const selectedTypes = eventFilter.filter((filter) =>
      TYPE_FILTERS.includes(filter),
    );

    if (!selectedStatuses.length || !selectedTypes.length) {
      return [];
    }

    return transformedMeetings.filter((event) => {
      const status = getMeetingStatus(event.extendedProps);
      const type = normalize(event.extendedProps.meetingType);

      return selectedStatuses.includes(status) && selectedTypes.includes(type);
    });
  }, [transformedMeetings, eventFilter]);

  const getTodaysEvents = () => {
    const today = dayjs().startOf("day");
    return transformedMeetings.filter((event) => {
      const eventStart = dayjs(event.start).startOf("day");
      const eventEnd = dayjs(event.end).startOf("day");
      return (
        today.isSame(eventStart) ||
        (today.isAfter(eventStart) && today.isBefore(eventEnd))
      );
    });
  };

  const todaysEvents = getTodaysEvents();

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const status = getMeetingStatus(event.extendedProps);
    const headerBackground = getStatusColors(status).backgroundColor;
    // Fallback to empty if type doesn't match

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

  return (
    <div className="flex w-[70%] md:w-full">
      <div className="flex-1 p-4 bg-white">
        {!isMeetingsLoading ? (
          <>
            <div className="flex gap-4 relative w-full">
              <div className="flex flex-col gap-4 w-[25%]">
                <div className="border-2 border-gray-300  rounded-md">
                  <div className="w-full flex justify-start border-b-default border-borderGray p-2">
                    <span className="text-content font-bold uppercase">
                      Meeting Filters
                    </span>
                  </div>
                  <div className="text-content">
                    {[
                      { title: "Meeting Status", filters: STATUS_FILTERS },
                      ...(showMeetingTypeFilters
                        ? [{ title: "Meeting Type", filters: TYPE_FILTERS }]
                        : []),
                    ].map((section, sectionIndex) => (
                      <div
                        key={section.title}
                        className={sectionIndex ? "border-t border-borderGray p-2" : "p-2"}
                      >
                        <div className="mb-1 text-xs font-semibold uppercase text-gray-500">
                          {section.title}
                        </div>
                        <FormGroup>
                          {section.filters.map((filter) => (
                            <div
                              key={filter}
                              className="flex w-full items-center justify-between pr-3"
                            >
                              <FormControlLabel
                                sx={{ marginRight: 0 }}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={eventFilter.includes(filter)}
                                    onChange={(event) => {
                                      setEventFilter((previous) =>
                                        event.target.checked
                                          ? [...previous, filter]
                                          : previous.filter(
                                              (item) => item !== filter,
                                            ),
                                      );
                                    }}
                                    sx={{
                                      color: getFilterColors(filter).color,
                                      "&.Mui-checked": {
                                        color: getFilterColors(filter).color,
                                      },
                                    }}
                                  />
                                }
                                label={
                                  <span className="text-sm capitalize">
                                    {filter}
                                  </span>
                                }
                              />
                              <span
                                className="rounded-full px-2 py-1 text-xs font-semibold"
                                style={{
                                  color: getFilterColors(filter).color,
                                  backgroundColor:
                                    getFilterColors(filter).backgroundColor,
                                }}
                              >
                                {isPlaceholderData
                                  ? "…"
                                  : meetingCounts[filter]}
                              </span>
                            </div>
                          ))}
                        </FormGroup>
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
                        const statusColors = getStatusColors(
                          getMeetingStatus(event.extendedProps),
                        );
                        return (
                          <div
                            key={index}
                            className="flex gap-2 items-center mb-2"
                          >
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{
                                backgroundColor: statusColors.color,
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
                      <span>No meetings today.</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="relative w-full h-full overflow-y-auto">
                {isPlaceholderData && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                    <CircularProgress size={36} />
                  </div>
                )}
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
                    setCalendarRange({
                      startDate: dayjs(dateInfo.view.calendar.getDate())
                        .startOf("month")
                        .toDate(),
                      endDate: dayjs(dateInfo.view.calendar.getDate())
                        .endOf("month")
                        .toDate(),
                    })
                  }
                  events={filteredEvents}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="h-72 flex justify-center items-center">
            <CircularProgress />
          </div>
        )}

        <MuiModal
          open={isDrawerOpen}
          onClose={closeDrawer}
          headerBackground={headerBackground}
          title="Meeting Details"
        >
          {drawerMode === "view" && selectedEvent && (
            <div className="space-y-2">
              <div className="font-bold">Basic Info</div>
              <DetalisFormatted title="Title" detail={selectedEvent.title} />
              <DetalisFormatted
                title="Agenda"
                detail={selectedEvent.extendedProps.agenda}
              />
              <DetalisFormatted
                title="Date"
                detail={humanDate(selectedEvent.start)}
              />
              <DetalisFormatted
                title="Time"
                detail={`${humanTime(selectedEvent.start)} - ${humanTime(
                  selectedEvent.end,
                )}`}
              />
              <DetalisFormatted
                title="Duration"
                detail={selectedEvent.extendedProps.duration}
              />
              <DetalisFormatted
                title="Status"
                detail={selectedEvent.extendedProps.meetingStatus}
              />
              <DetalisFormatted
                title="Type"
                detail={selectedEvent.extendedProps.meetingType}
              />
              {/* <DetalisFormatted
                title="Company"
                detail={selectedEvent.extendedProps.client}
              /> */}
              <DetalisFormatted
                title="Company"
                detail={
                  selectedEvent.extendedProps.client?.companyName ||
                  selectedEvent.extendedProps.externalClient ||
                  selectedEvent.extendedProps.client ||
                  "N/A"
                }
              />
              <br />
              <div className="font-bold">People Involved</div>
              {selectedEvent.extendedProps.participants?.length > 0 && (
                <DetalisFormatted
                  title="Participants"
                  detail={
                    selectedEvent.extendedProps.participants
                      .map((p) => {
                        return p.employeeName
                          ? p.employeeName
                          : p.firstName
                            ? `${p.firstName} ${p.lastName}`
                            : p.name
                              ? p.name
                              : "N/A";
                      })
                      .join(", ") || "N/A"
                  }
                />
              )}

              <DetalisFormatted
                title="Booked By"
                detail={
                  selectedEvent.extendedProps.bookedBy
                    ? `${
                        selectedEvent.extendedProps.bookedBy?.firstName || ""
                      } ${selectedEvent.extendedProps.bookedBy?.lastName || ""}`
                    : selectedEvent.extendedProps?.clientBookedBy?.employeeName
                }
              />
              <DetalisFormatted
                title="Receptionist"
                detail={
                  selectedEvent.extendedProps.receptionist
                    ? selectedEvent.extendedProps.receptionist
                    : "N/A"
                }
              />
              <DetalisFormatted
                title="Department"
                detail={selectedEvent.extendedProps.department?.map(
                  (item) => item.name,
                )}
              />

              <br />
              <div className="font-bold">Venue Details</div>
              <DetalisFormatted
                title="Room"
                detail={selectedEvent.extendedProps.roomName}
              />
              <DetalisFormatted
                title="Location"
                detail={`${selectedEvent.extendedProps.location?.unitNo} (${selectedEvent.extendedProps.location?.unitName})`}
              />
              <DetalisFormatted
                title="Building"
                detail={
                  selectedEvent.extendedProps.location?.building?.buildingName
                }
              />
              <DetalisFormatted
                title="Housekeeping Status"
                detail={selectedEvent.extendedProps.housekeepingStatus}
              />
              {selectedEvent.extendedProps.mobileNumber && (
                <>
                  <DetalisFormatted
                    title="Mobile Number"
                    detail={selectedEvent.extendedProps.mobileNumber || "N/A"}
                  />
                  <DetalisFormatted
                    title="POC Name"
                    detail={selectedEvent.extendedProps.pocName || "N/A"}
                  />
                </>
              )}
            </div>
          )}
        </MuiModal>
      </div>
    </div>
  );
};

export default Calender;
